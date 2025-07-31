import { useState, useEffect } from "react";
import axios from "axios";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8080";

  // Fetch tasks from backend
  useEffect(() => {
    axios.get(`${API_BASE}/tasks`).then((res) => {
      setTasks(res.data);
    });
  }, []);

  // Add task
  const addTask = async () => {
    if (!newTask) return;
    await axios.post(`${API_BASE}/tasks`, { task: newTask });
    setNewTask("");
    const res = await axios.get(`${API_BASE}/tasks`);
    setTasks(res.data);
  };

  // Delete task
  const deleteTask = async (id) => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
    const res = await axios.get(`${API_BASE}/tasks`);
    setTasks(res.data);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow p-4 rounded">
      <h1 className="text-2xl font-bold text-center mb-4">Full-Stack Todo</h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 border px-2 py-1 rounded-l"
          placeholder="Enter new task"
        />
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center border-b py-2"
          >
            {task.task}
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}