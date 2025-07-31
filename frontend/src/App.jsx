import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import Register from "./components/Register";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

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

    await axios.post(
      `${API_BASE}/tasks`,
      { task: newTask },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNewTask("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, [isLoggedIn]);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setTasks([]);
  };

  if (!isLoggedIn) {
    return (
      <div>
        <h1>Welcome to Secure Todo App</h1>
        <Login onLogin={() => setIsLoggedIn(true)} />
        <Register />
      </div>
    );
  }

  return (
    <div>
      <h1>Secure Todo App</h1>
      <button onClick={logout}>Logout</button>

      <div>
        <input
          type="text"
          placeholder="New Task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.task} <button onClick={() => deleteTask(task.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;