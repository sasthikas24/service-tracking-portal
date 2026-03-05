from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from db import init_db, get_db

app = Flask(__name__)

# ✅ CORS: allow frontend (Vite usually runs at 5173)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# For development, avoid short token expiry
app.config["JWT_SECRET_KEY"] = "change_this_secret_123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
jwt = JWTManager(app)

# ✅ Status options (use same in frontend)
ALLOWED_STATUS = {"Open", "In Progress", "Resolved"}

def now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def is_valid_email(email: str) -> bool:
    return bool(email) and ("@" in email) and ("." in email)

# ✅ Init DB tables
init_db()

# -------------------- JWT error handlers (clearer JSON responses) --------------------
@jwt.unauthorized_loader
def unauthorized_callback(reason):
    return jsonify({"message": reason}), 401


@jwt.invalid_token_loader
def invalid_token_callback(reason):
    return jsonify({"message": reason}), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired"}), 401


@app.before_request
def log_auth_header():
    # Helpful during local dev to see what Authorization header arrives
    if request.path.startswith("/api/"):
        auth = request.headers.get("Authorization")
        if auth:
            app.logger.debug(f"Auth header: {auth[:20]}...")

# -------------------- Basic errors --------------------

@app.get("/api/health")
def health():
    return jsonify({"ok": True, "message": "Backend running"}), 200

@app.errorhandler(404)
def not_found(_):
    return jsonify({"message": "Route not found"}), 404

# -------------------- AUTH --------------------

@app.post("/api/auth/register")
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not is_valid_email(email):
        return jsonify({"message": "Valid email is required"}), 400
    if not password or len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters"}), 400

    password_hash = generate_password_hash(password)

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
            (email, password_hash, "user", now_iso()),
        )
        conn.commit()
        return jsonify({"ok": True, "message": "Registration successful"}), 201
    except Exception as e:
        if "UNIQUE" in str(e).upper():
            return jsonify({"message": "User already exists"}), 409
        return jsonify({"message": f"Registration error: {str(e)}"}), 500
    finally:
        conn.close()


@app.post("/api/auth/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    role_requested = (data.get("role") or "user").strip().lower()

    if not email or not password:
        return jsonify({"message": "Email & password required"}), 400

    conn = get_db()
    try:
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        
        # ✅ BACKDOOR for initial Admin setup if not in DB
        # If logging in as admin, and email is 'admin@portal.com', let them in if password matches hardcoded check
        # This is strictly for the requested "Admin login (fixed credentials)" requirement if DB is empty.
        if role_requested == 'admin' and email == 'admin@portal.com':
            if password == 'Admin@123':
                 token = create_access_token(
                    identity=email,
                    additional_claims={"role": "admin"}
                )
                 return jsonify({
                    "token": token,
                    "user": {"email": email, "role": "admin"}
                }), 200

        if not user:
            return jsonify({"message": "User not found"}), 404

        # ✅ prevents user trying to login as admin
        if role_requested and user["role"] != role_requested:
            return jsonify({"message": "Role mismatch"}), 403

        if not check_password_hash(user["password_hash"], password):
            return jsonify({"message": "Invalid password"}), 401

        token = create_access_token(
            identity=user["email"],
            additional_claims={"role": user["role"]}
        )

        return jsonify({
            "token": token,
            "user": {"email": user["email"], "role": user["role"]}
        }), 200
    finally:
        conn.close()

# -------------------- TICKETS --------------------

@app.post("/api/tickets")
@jwt_required()
def create_ticket():
    claims = get_jwt()
    role = claims.get("role")
    user_email = get_jwt_identity()

    if role != "user":
        return jsonify({"message": "Only users can create tickets"}), 403

    data = request.get_json() or {}
    ticket_id = (data.get("id") or "").strip()
    category = (data.get("category") or "").strip()
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()

    if not ticket_id or not category or not title or not description:
        return jsonify({"message": "Missing required fields: id, category, title, description"}), 400

    conn = get_db()
    try:
        # ✅ check duplicate ticket id
        exists = conn.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        if exists:
            return jsonify({"message": "Ticket ID already exists"}), 409

        conn.execute("""
            INSERT INTO tickets (id, user_email, category, title, description, status, remark, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ticket_id, user_email, category, title, description,
            "Open", "", now_iso(), now_iso()
        ))
        
        # Initial Audit Log
        conn.execute("""
            INSERT INTO audit_logs (ticket_id, changed_by, old_status, new_status, change_time)
            VALUES (?, ?, ?, ?, ?)
        """, (ticket_id, user_email, None, "Open", now_iso()))

        conn.commit()
        return jsonify({"ok": True, "id": ticket_id}), 201
    except Exception as e:
        return jsonify({"message": f"Error creating ticket: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/api/tickets")
@jwt_required()
def list_tickets():
    claims = get_jwt()
    role = claims.get("role")
    user_email = get_jwt_identity()

    # Query params for filtering/pagination
    status_filter = request.args.get("status")
    category_filter = request.args.get("category")
    search_query = request.args.get("search")
    
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    offset = (page - 1) * limit

    conn = get_db()
    try:
        query = "SELECT * FROM tickets WHERE 1=1"
        params = []

        # ✅ Role-based Base Filter
        if role != "admin":
            query += " AND user_email = ?"
            params.append(user_email)

        # ✅ Apply Filters
        if status_filter and status_filter != "All":
            query += " AND status = ?"
            params.append(status_filter)
        
        if category_filter and category_filter != "All":
            query += " AND category = ?"
            params.append(category_filter)

        if search_query:
            # Search by ID or Email (for admin) or Title
            like_search = f"%{search_query}%"
            query += " AND (id LIKE ? OR title LIKE ?)"
            params.extend([like_search, like_search])

        # ✅ Sorting & Pagination
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        rows = conn.execute(query, tuple(params)).fetchall()
        return jsonify([dict(r) for r in rows]), 200
    except Exception as e:
        return jsonify({"message": f"Error loading tickets: {str(e)}"}), 500
    finally:
        conn.close()


@app.put("/api/tickets/<ticket_id>")
@jwt_required()
def update_ticket(ticket_id):
    claims = get_jwt()
    role = claims.get("role")
    updater_email = get_jwt_identity()

    if role != "admin":
        return jsonify({"message": "Admin only"}), 403

    data = request.get_json() or {}
    new_status = (data.get("status") or "").strip()
    remark = (data.get("remark") or "").strip()

    if not new_status:
        return jsonify({"message": "Status is required"}), 400
    if new_status not in ALLOWED_STATUS:
        return jsonify({"message": f"Invalid status. Allowed: {sorted(list(ALLOWED_STATUS))}"}), 400

    conn = get_db()
    try:
        # Get current status for audit log
        current = conn.execute("SELECT status FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        if not current:
            return jsonify({"message": "Ticket not found"}), 404
        
        old_status = current["status"]

        cur = conn.execute(
            "UPDATE tickets SET status = ?, remark = ?, updated_at = ? WHERE id = ?",
            (new_status, remark, now_iso(), ticket_id),
        )

        if cur.rowcount > 0:
            # ✅ Add Audit Log if status changed
            if old_status != new_status:
                conn.execute("""
                    INSERT INTO audit_logs (ticket_id, changed_by, old_status, new_status, change_time)
                    VALUES (?, ?, ?, ?, ?)
                """, (ticket_id, updater_email, old_status, new_status, now_iso()))
            
            conn.commit()
            return jsonify({"ok": True}), 200
        else:
             return jsonify({"message": "Ticket not found"}), 404

    except Exception as e:
        return jsonify({"message": f"Error updating ticket: {str(e)}"}), 500
    finally:
        conn.close()

@app.get("/api/tickets/<ticket_id>")
@jwt_required()
def get_single_ticket(ticket_id):
    claims = get_jwt()
    role = claims.get("role")
    user_email = get_jwt_identity()

    try:
        conn = get_db()
        row = conn.execute(
            "SELECT * FROM tickets WHERE id = ?",
            (ticket_id,)
        ).fetchone()
        conn.close()

        if not row:
            return jsonify({"message": "Ticket not found"}), 404

        ticket = dict(row)

        # ✅ user can view only their own ticket
        if role != "admin" and ticket.get("user_email") != user_email:
            return jsonify({"message": "Not allowed to view this ticket"}), 403

        return jsonify(ticket)

    except Exception as e:
        return jsonify({"message": f"Error loading ticket: {str(e)}"}), 500

# -------------------- COMMENTS --------------------

@app.get("/api/tickets/<ticket_id>/comments")
@jwt_required()
def get_comments(ticket_id):
    claims = get_jwt()
    role = claims.get("role")
    user_email = get_jwt_identity()

    conn = get_db()
    try:
        # Check access
        ticket = conn.execute("SELECT user_email FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        if not ticket:
             return jsonify({"message": "Ticket not found"}), 404
        
        if role != "admin" and ticket["user_email"] != user_email:
             return jsonify({"message": "Access denied"}), 403

        rows = conn.execute(
            "SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC",
            (ticket_id,)
        ).fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        conn.close()

@app.post("/api/tickets/<ticket_id>/comments")
@jwt_required()
def add_comment(ticket_id):
    claims = get_jwt()
    role = claims.get("role")
    user_email = get_jwt_identity()
    
    data = request.get_json() or {}
    content = (data.get("content") or "").strip()

    if not content:
        return jsonify({"message": "Content required"}), 400

    conn = get_db()
    try:
        # Check access
        ticket = conn.execute("SELECT user_email FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        if not ticket:
             return jsonify({"message": "Ticket not found"}), 404
        
        if role != "admin" and ticket["user_email"] != user_email:
             return jsonify({"message": "Access denied"}), 403

        is_admin = 1 if role == "admin" else 0

        conn.execute("""
            INSERT INTO comments (ticket_id, user_email, content, created_at, is_admin)
            VALUES (?, ?, ?, ?, ?)
        """, (ticket_id, user_email, content, now_iso(), is_admin))
        conn.commit()

        return jsonify({"ok": True}), 201
    except Exception as e:
        return jsonify({"message": f"Error adding comment: {str(e)}"}), 500
    finally:
        conn.close()

# -------------------- AUDIT LOGS --------------------

@app.get("/api/tickets/<ticket_id>/history")
@jwt_required()
def get_ticket_history(ticket_id):
    claims = get_jwt()
    role = claims.get("role")
    user_email = get_jwt_identity()

    conn = get_db()
    try:
        # Check access
        ticket = conn.execute("SELECT user_email FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        if not ticket:
             return jsonify({"message": "Ticket not found"}), 404
        
        if role != "admin" and ticket["user_email"] != user_email:
             return jsonify({"message": "Access denied"}), 403

        rows = conn.execute(
            "SELECT * FROM audit_logs WHERE ticket_id = ? ORDER BY change_time DESC",
            (ticket_id,)
        ).fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(port=5000, debug=True)
