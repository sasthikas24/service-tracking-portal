from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # only "user" or "admin"
    role = db.Column(db.String(20), nullable=False, default="user")

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class Ticket(db.Model):
    __tablename__ = "tickets"
    id = db.Column(db.String(50), primary_key=True)  # TKT-YYYY-1234

    user_email = db.Column(db.String(120), nullable=False, index=True)

    category = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)

    status = db.Column(db.String(30), nullable=False, default="PENDING")  # PENDING/Open/In Progress/Resolved
    remark = db.Column(db.Text, default="", nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
