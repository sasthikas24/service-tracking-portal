from db import get_db, init_db
from werkzeug.security import generate_password_hash
from datetime import datetime

init_db()
conn = get_db()

email = "admin@portal.com"
password = "Admin@123"
role = "admin"

try:
    conn.execute(
        "INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
        (email, generate_password_hash(password), role, datetime.utcnow().isoformat())
    )
    conn.commit()
    print("✅ Admin created")
except Exception as e:
    print("⚠️ Admin already exists or error:", e)
finally:
    conn.close()
