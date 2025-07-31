import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password });
      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch (err) {
      alert("Login failed: " + err.response.data.message);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}