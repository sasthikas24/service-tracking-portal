from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
import os
from db import init_db, get_db

app = Flask(__name__)

# -------------------- CONFIG --------------------

# Allow all origins (safe for deployment)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change_this_secret_123")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

jwt = JWTManager(app)

ALLOWED_STATUS = {"Open", "In Progress", "Resolved"}

def now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def is_valid_email(email: str) -> bool:
    return bool(email) and ("@" in email) and ("." in email)

# Initialize database
init_db()

# -------------------- ROOT & HEALTH --------------------

@app.route("/")
def home():
    return "Service Tracking Portal Backend is Running 🚀"

@app.get("/api/health")
def health():
    return jsonify({"ok": True, "message": "Backend running"}), 200

@app.errorhandler(404)
def not_found(_):
    return jsonify({"message": "Route not found"}), 404

# -------------------- JWT ERROR HANDLERS --------------------

@jwt.unauthorized_loader
def unauthorized_callback(reason):
    return jsonify({"message": reason}), 401

@jwt.invalid_token_loader
def invalid_token_callback(reason):
    return jsonify({"message": reason}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired"}), 401

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

        # Admin backdoor (as requested)
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
        return jsonify({"message": "Missing required fields"}), 400

    conn = get_db()
    try:
        exists = conn.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        if exists:
            return jsonify({"message": "Ticket ID already exists"}), 409

        conn.execute("""
            INSERT INTO tickets (id, user_email, category, title, description,
            status, remark, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ticket_id, user_email, category, title, description,
            "Open", "", now_iso(), now_iso()
        ))

        conn.commit()
        return jsonify({"ok": True, "id": ticket_id}), 201
    finally:
        conn.close()

# -------------------- RUN APP --------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)