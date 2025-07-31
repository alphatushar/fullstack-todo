import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE}/register`, { username, password });
      alert("Registration successful! Please login.");
    } catch (err) {
      alert("Registration failed: " + err.response.data.message);
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
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
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}