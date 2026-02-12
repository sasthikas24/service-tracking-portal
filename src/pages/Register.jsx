import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../utils/storage";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMsg("Email and password are required.");
      return;
    }

    const res = registerUser({ email, password, role });
    setMsg(res.message);

    if (res.ok) {
      setTimeout(() => navigate("/login"), 800);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Register</h1>
        <p className="text-center text-gray-600 mb-6">
          Create your account (stored in browser)
        </p>

        {msg && (
          <div className="mb-4 text-sm bg-blue-50 text-blue-700 p-3 rounded-lg">
            {msg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="user@example.com"
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
