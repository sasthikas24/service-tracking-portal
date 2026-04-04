import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../utils/api.js";


export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMsg("Email and password are required.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setMsg(data.message || (res.ok ? "Registered successfully" : "Register failed"));

      if (res.ok) {
        setTimeout(() => navigate("/login"), 800);
      }
    } catch {
      setMsg("Backend not reachable. Is Flask running?");
    }
  };


  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Register</h1>
        <p className="text-center text-gray-600 mb-6">
          Create your user account
        </p>

        {msg && (
          <div className="mb-4 text-sm bg-blue-50 text-blue-700 p-3 rounded-lg">
            {msg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="user@example.com"
              type="email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Create a password"
            />
          </div>

          <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold">
            Register
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already registered?{" "}
          <Link className="text-blue-600 font-semibold" to="/login">
            Login
          </Link>
        </p>


      </div>
    </div>
  );
}
