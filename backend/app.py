from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

tasks = []


# Configure Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///todo.db")
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)

#create tables at startup
with app.app_context():
    db.create_all()


@app.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([{"id": t.id, "task": t.task} for t in tasks])


@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    new_task = Task(task=data["task"])
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task added"}), 201


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    global tasks
    tasks = [t for t in tasks if t["id"] != task_id]
    return jsonify({"message": "Task deleted"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)