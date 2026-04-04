import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Ticket, User, ShieldCheck } from "lucide-react";
import API_URL from "../utils/api.js";
import { setSession } from "../utils/storage.js";


export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.message || "Login failed" });
        return;
      }

      // store token + user in session
      setSession({
        token: data.token,
        email: data.user.email,
        role: data.user.role,
      });


      if (data.user.role === "user") navigate("/user/dashboard");
      else navigate("/admin/dashboard");
    } catch {
      setErrors({ form: "Backend not reachable. Is Flask running?" });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service Tracking Portal
          </h1>
          <p className="text-gray-600">Login to manage your service tickets</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setRole("user");
                    setErrors({});
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${role === "user"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <User
                    className={`w-8 h-8 mx-auto mb-2 ${role === "user" ? "text-blue-600" : "text-gray-400"
                      }`}
                  />
                  <span
                    className={`text-sm font-medium ${role === "user" ? "text-blue-600" : "text-gray-600"
                      }`}
                  >
                    User
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole("admin");
                    setErrors({});
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${role === "admin"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <ShieldCheck
                    className={`w-8 h-8 mx-auto mb-2 ${role === "admin" ? "text-blue-600" : "text-gray-400"
                      }`}
                  />
                  <span
                    className={`text-sm font-medium ${role === "admin" ? "text-blue-600" : "text-gray-600"
                      }`}
                  >
                    Admin
                  </span>
                </button>
              </div>
            </div>

            {errors.form && (
              <div className="text-sm bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
                {errors.form}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "", form: "" });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "", form: "" });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Login
            </button>

            <Link
              to="/register"
              className="block w-full text-center bg-white border border-gray-200 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              New user? Register
            </Link>
          </form>


        </div>
      </div>
    </div>
  );
}
