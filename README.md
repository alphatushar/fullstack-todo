# **Full-Stack Dockerized Todo App**  

A **production-ready full-stack Todo application** built with:  
- **Frontend:** React + Vite + Axios (served via Nginx in Docker)  
- **Backend:** Flask + Python (Dockerized REST API)  
- **DevOps:** Docker Compose for full-stack container orchestration  

---

## **📌 Features**

✅ Add, View, and Delete tasks  
✅ React frontend communicates with Flask backend via REST API  
✅ Fully containerized with Docker Compose
✅ Database PostgreSQL (containerized with Docker)  
✅ Production-ready frontend served by Nginx  
✅ Easily deployable to any cloud provider  

---

### Access the Application

- Frontend (React + Nginx): ```http://localhost:8081```
- Backend (Flask API): ```http://localhost:8080/tasks```

---

### Database

```
DB Host: db 
DB Name: todo_db
User: todo_user
Password: todo_pass
```

---

### Example Query

```
docker exec -it todo_db psql -U todo_user -d todo_db
SELECT * FROM task;
```

### Clone the Repository

```bash
git clone https://github.com/alphatushar/fullstack-todo.git
cd fullstack-todo
```

---

### 🛠️ Tech Stack

- Frontend: React, Vite, Axios
- Backend: Python, Flask, Flask-CORS, SQLAlchemy, JWT
- Database: PostgreSQL 15
- DevOps: Docker, Docker Compose, Nginx

---

### 🔐 New Features
- JWT authentication with multi‑user support
- Secure task management per user
- Fully Dockerized full‑stack deployment

---

### Example

![screenshot](example/screenshot%201.png)
![screenshot](example/screenshot%202.png)
![screenshot](example/screenshot%203.png)
![screenshot](example/screenshot%204.png)
![screenshot](example/screenshot%205.png)
![screenshot](example/screenshot%206.png)
![screenshot](example/screenshot%207.png)
![screenshot](example/screenshot%208.png)
![screenshot](example/screenshot%209.png)
![screenshot](example/screenshot%2010.png)
![screenshot](example/screenshot%2011.png)

---

### Author
Tushar Sharma
