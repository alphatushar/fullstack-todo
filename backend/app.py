from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from passlib.hash import bcrypt
import os

app = Flask(__name__)
CORS(app)

tasks = []

jwt = JWTManager(app)

@jwt.invalid_token_loader
def invalid_token_callback(reason):
    return {"error": "Invalid token", "reason": reason}, 401


# Configure Database
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    # Render gives postgres:// but SQLAlchemy expects postgresql://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)


app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretjwtkey")  # change for production

db = SQLAlchemy(app)
jwt = JWTManager(app)

# User & Task Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    tasks = db.relationship('Task', backref='user', lazy=True)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)  # ✅ New column
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Initialize DB
with app.app_context():
    db.create_all()


# ================= AUTH ROUTES =================

@app.route("/", methods=["GET"])
def home():
    return {"status": "Backend Live!", "message": "Use /register or /login POST methods"}, 200

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"error": "Username and password required"}, 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_pw = bcrypt.hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.verify(password, user.password_hash):
        token = create_access_token(identity=str(user.id))

        return jsonify({"token": token}), 200
    return jsonify({"message": "Invalid credentials"}), 401


@app.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    try:
        user_id = int(get_jwt_identity())
        if user_id is None:
            return jsonify({"message": "Invalid token"}), 401
        user_id = int(user_id)  # Convert safely
        tasks = Task.query.filter_by(user_id=user_id).all()
        return jsonify([{"id": t.id, "task": t.task, "completed": t.completed} for t in tasks])
    except Exception as e:
        print("Error in /tasks:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/tasks", methods=["POST"])
@jwt_required()
def add_task():
    user_id = int(get_jwt_identity())
    data = request.json
    new_task = Task(task=data["task"], user_id=user_id)
    db.session.add(new_task)
    try:
        db.session.commit()
        return jsonify({"message": "Task added"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if task:
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted"}), 200
    return jsonify({"message": "Task not found"}), 404


@app.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    data = request.json
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    # Update content or completion
    if "task" in data:
        task.task = data["task"]
    if "completed" in data:
        task.completed = data["completed"]

    db.session.commit()
    return jsonify({"message": "Task updated"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)