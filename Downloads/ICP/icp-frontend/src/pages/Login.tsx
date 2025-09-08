import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err.response?.data);
      if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail.map((d: any) => d.msg).join(", "));
      } else {
        setError(err.response?.data?.detail || "Login failed");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow rounded w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
