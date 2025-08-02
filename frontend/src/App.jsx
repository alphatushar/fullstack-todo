import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import Register from "./components/Register";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [firstLogin, setFirstLogin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const backgroundStyle = isDarkMode
    ? "linear-gradient(135deg, #181a20 0%, #23272f 100%)"
    : "linear-gradient(135deg, #f9f9f9 0%, #e0e0e0 100%)";

  const cardBackground = isDarkMode
    ? "rgba(32,34,40,0.99)"
    : "rgba(255,255,255,0.95)";

  const textColor = isDarkMode ? "#fff" : "#000";

  const inputBg = isDarkMode ? "#23272f" : "#fff";
  const inputBorder = isDarkMode ? "#23272f" : "#ccc";
  const inputText = isDarkMode ? "#eaeaea" : "#000";

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      }
    }
  };

  const addTask = async () => {
    const token = localStorage.getItem("token");
    if (!newTask.trim() || !token) return;

    try {
      await axios.post(
        `${API_BASE}/tasks`,
        { task: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTask("");
      toast.success("Task added successfully!");
      const addBtn = document.querySelector('button.add-task-btn');
      if (addBtn) {
        addBtn.style.animation = "pulseSuccess 0.4s ease";
        setTimeout(() => { addBtn.style.animation = ""; }, 400);
      }
      fetchTasks();
      setTimeout(() => {
        const lastLi = document.querySelector("ul li:last-child");
        if (lastLi) {
          lastLi.style.animation = "newTaskFadeIn 0.4s ease";
        }
      }, 100);
    } catch (err) {
      toast.error("Failed to add task");
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const li = document.querySelector(`li[data-task-id="${id}"]`);
    if (li) {
      li.style.animation = "fadeOut 0.3s forwards";
    }
    setTimeout(async () => {
      await axios.delete(`${API_BASE}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Task deleted successfully!");
      fetchTasks();
    }, 300);
  };

  const toggleTask = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_BASE}/tasks/${id}`,
        { completed: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const li = document.querySelector(`li[data-task-id="${id}"]`);
      if (li) {
        li.style.animation = "bounceCompleted 0.4s ease";
        const checkbox = li?.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.style.animation = "checkboxPulse 0.3s ease";
          setTimeout(() => { checkbox.style.animation = ""; }, 300);
        }
      }
      fetchTasks();
      if (!currentStatus) {
        toast.success("Task marked as completed!");
      } else {
        toast.info("Task marked as pending!");
      }
    } catch (err) {
      toast.error("Failed to update task");
      console.error(err);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.task);
  };

  const saveEdit = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_BASE}/tasks/${id}`,
        { task: editingText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Task updated successfully!");
      setEditingTaskId(null);
      setEditingText("");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update task");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [isLoggedIn]);

  // Confetti effect when all tasks completed
  useEffect(() => {
    if (tasks.length > 0 && tasks.every(t => t.completed)) {
      // Create simple confetti using div elements
      for (let i = 0; i < 20; i++) {
        const confetti = document.createElement("div");
        confetti.style.position = "fixed";
        confetti.style.top = "0";
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.width = "8px";
        confetti.style.height = "14px";
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.opacity = "0.9";
        confetti.style.borderRadius = "2px";
        confetti.style.animation = "confettiFall 2s linear forwards";
        confetti.style.zIndex = 9999;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2000);
      }
      toast.success("🎉 All tasks completed!");
    }
  }, [tasks]);

  // Confetti effect on first successful login
  useEffect(() => {
    if (firstLogin) {
      for (let i = 0; i < 25; i++) {
        const confetti = document.createElement("div");
        confetti.style.position = "fixed";
        confetti.style.top = "0";
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.width = "8px";
        confetti.style.height = "14px";
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.opacity = "0.9";
        confetti.style.borderRadius = "2px";
        confetti.style.animation = "confettiFall 2.2s linear forwards";
        confetti.style.zIndex = 9999;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2200);
      }
      setFirstLogin(false);
    }
  }, [firstLogin]);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setTasks([]);
    toast.info("Logged out");
  };

  if (!isLoggedIn) {
    return (
      <div
        className="app-container"
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: backgroundStyle,
          padding: "32px 0",
          fontFamily: "Inter, Arial, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: "600px",
            background: cardBackground,
            borderRadius: "18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            padding: "40px 32px",
          }}
        >
          <h1 style={{ textAlign: "center", color: textColor, letterSpacing: "1px", marginBottom: 28 }}>
            Welcome to Secure Todo App
          </h1>
          <Login
            onLogin={() => {
              setIsLoggedIn(true);
              setFirstLogin(true);
              toast.success("Logged in successfully!");
            }}
          />
          <Register />
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: backgroundStyle,
        fontFamily: "Inter, Arial, sans-serif",
        padding: "36px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }

        @keyframes newTaskFadeIn {
          0% { opacity: 0; transform: translateY(-8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes bounceCompleted {
          0% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }

        @keyframes editHighlight {
          0% { background-color: rgba(33, 150, 243, 0.15); }
          100% { background-color: transparent; }
        }

        @keyframes saveFlash {
          0% { background-color: #4caf50; }
          50% { background-color: #81c784; }
          100% { background-color: #4caf50; }
        }
        @keyframes pulseSuccess {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes checkboxPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div
        style={{
          width: "90%",
          maxWidth: "700px",
          background: cardBackground,
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.38)",
          padding: "38px 32px 28px 32px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: textColor,
            letterSpacing: "1.5px",
            marginBottom: "30px",
            fontWeight: 700,
            fontSize: "2.2rem",
          }}
        >
          Secure Todo App
        </h1>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "28px" }}>
          <button
            onClick={logout}
            style={{
              background: "linear-gradient(90deg, #e53935 60%, #b71c1c 100%)",
              color: "#fff",
              padding: "8px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(229,57,53,0.18)",
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
              outline: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(90deg, #c62828 60%, #8e1919 100%)")}
            onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(90deg, #e53935 60%, #b71c1c 100%)")}
          >
            Logout
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "26px" }}>
          <input
            type="text"
            placeholder="New Task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "8px",
              border: `1px solid ${inputBorder}`,
              background: inputBg,
              color: inputText,
              fontSize: "1rem",
              outline: "none",
              transition: "border 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.09)",
            }}
            onFocus={e => (e.target.style.border = "1.5px solid #2196f3")}
            onBlur={e => (e.target.style.border = `1px solid ${inputBorder}`)}
          />
          <button
            className="add-task-btn"
            onClick={addTask}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
              color: "#23272f",
              fontWeight: 700,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(67,233,123,0.13)",
              fontSize: "1rem",
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
              outline: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(90deg, #21d4fd 0%, #b721ff 100%)")}
            onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)")}
          >
            Add Task
          </button>
        </div>

        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {tasks.map((task) => {
            const taskBg = isDarkMode
              ? (task.completed
                  ? "linear-gradient(135deg, #2c2c2c, #1a1a1a)"
                  : "linear-gradient(135deg, #3b3b3b, #2a2a2a)")
              : (task.completed
                  ? "linear-gradient(135deg, #e0e0e0, #bdbdbd)"
                  : "linear-gradient(135deg, #fafafa, #e0e0e0)");
            const taskHoverBg = isDarkMode
              ? "linear-gradient(135deg, #4b4b4b, #333)"
              : "linear-gradient(135deg, #e3f2fd, #bbdefb)";
            const taskTextColor = task.completed
              ? (isDarkMode ? "#aaa" : "#888")
              : textColor;
            return (
              <li
                key={task.id}
                data-task-id={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                  background: taskBg,
                  color: taskTextColor,
                  padding: "14px 18px",
                  borderRadius: "10px",
                  textDecoration: task.completed ? "line-through" : "none",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.35)",
                  border: isDarkMode
                    ? "1.5px solid rgba(52, 58, 64, 0.5)"
                    : "1.5px solid #ececec",
                  transition: "transform 0.2s ease, background 0.3s ease",
                  position: "relative",
                  animation: "fadeSlideIn 0.4s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.background = taskHoverBg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = taskBg;
                }}
              >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id, task.completed)}
                  style={{
                    accentColor: isDarkMode ? "#43e97b" : "#1976d2",
                    width: "18px",
                    height: "18px",
                  }}
                />
                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: `1.3px solid ${inputBorder}`,
                      background: inputBg,
                      color: inputText,
                      fontSize: "1rem",
                      outline: "none",
                      marginRight: 8,
                      animation: "editHighlight 0.6s ease",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "1.07rem" }}>{task.task}</span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", marginLeft: "8px" }}>
                <button
                  onClick={event => {
                    if (editingTaskId === task.id) {
                      const btn = event.currentTarget;
                      btn.style.animation = "saveFlash 0.5s ease";
                      saveEdit(task.id);
                      setTimeout(() => { btn.style.animation = ""; }, 500);
                    } else {
                      startEditing(task);
                    }
                  }}
                  style={{
                    background: "#2196f3",
                    color: "#fff",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem",
                    boxShadow: "0 2px 4px rgba(33,150,243,0.16)",
                    transition: "all 0.3s ease",
                    outline: "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1976d2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#2196f3")}
                >
                  {editingTaskId === task.id ? "Save" : "Edit"}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: "#e53935",
                    color: "#fff",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem",
                    boxShadow: "0 2px 4px rgba(229,57,53,0.18)",
                    transition: "all 0.3s ease",
                    outline: "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#c62828")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#e53935")}
                >
                  X
                </button>
              </div>
            </li>
            );
          })}
        </ul>
        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}

export default App;