import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { getSession, getToken, clearSession } from "../utils/storage.js";
import API_URL from "../utils/api.js";

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "PENDING"];

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const session = getSession();
  const token = getToken();

  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("Open");
  const [remark, setRemark] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session || !token) {
      navigate("/login");
      return;
    }
    if (session.role !== "admin") {
      navigate("/user/dashboard");
      return;
    }
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Map backend snake_case -> camelCase
  const mapTicket = (t) => ({
    id: t.id,
    userEmail: t.user_email ?? t.userEmail,
    category: t.category,
    title: t.title,
    description: t.description,
    status: t.status,
    remark: t.remark || "",
    createdAt: t.created_at ?? t.createdAt,
    updatedAt: t.updated_at ?? t.updatedAt,
  });

  const loadTicket = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let data = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        data = [];
      }

      if (res.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setTicket(null);
        setError(data?.message || "Failed to load ticket");
        return;
      }

      const found = Array.isArray(data) ? data.find((t) => t.id === id) : null;

      if (!found) {
        setTicket(null);
        setError("Ticket not found");
        return;
      }

      const mapped = mapTicket(found);
      setTicket(mapped);
      setStatus(mapped.status || "Open");
      setRemark(mapped.remark || "");
    } catch {
      setTicket(null);
      setError("Backend not reachable. Is Flask running?");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, remark }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (res.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setError(data?.message || "Failed to update ticket");
        return;
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      loadTicket();
    } catch {
      setError("Backend not reachable. Is Flask running?");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">Ticket not found</h2>

            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              onClick={() => navigate("/admin/dashboard")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {showSuccess && (
          <div className="max-w-3xl mx-auto mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-800 font-medium">Ticket updated successfully!</p>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mb-6 text-sm bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Ticket Details</h3>
              <p className="text-sm opacity-90">{ticket.id}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">User Email</p>
                <p className="text-gray-900">{ticket.userEmail}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Category</p>
                <p className="text-gray-900">{ticket.category}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Current Status</p>
                <StatusBadge status={ticket.status} />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Title</p>
                <p className="text-gray-900">{ticket.title}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Description</p>
                <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-500 mb-1">Created At</p>
                <p className="text-gray-700 text-sm">{formatDate(ticket.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Last Updated</p>
                <p className="text-gray-700 text-sm">{formatDate(ticket.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Update Ticket</h3>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="remark" className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Remark / Resolution Note
                </label>
                <textarea
                  id="remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Add notes, resolution details, or any updates for the user..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
