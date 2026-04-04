import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import TicketTable from "../components/TicketTable.jsx";
import API_URL from "../utils/api.js";
import { getSession, getToken, clearSession } from "../utils/storage.js";

export default function UserDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const token = getToken();

  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session || !token) {
      navigate("/login");
      return;
    }
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Convert backend snake_case to frontend camelCase
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

  const loadTickets = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // read text safely
      const text = await res.text();
      let data = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        data = [];
      }

      if (res.status === 401) {
        // token invalid/expired
        clearSession();
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setError(data?.message || "Failed to load tickets");
        return;
      }

      const mapped = Array.isArray(data) ? data.map(mapTicket) : [];
      mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(mapped);
    } catch {
      setError("Backend not reachable. Is Flask running?");
    }
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/user/track?id=${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {session?.email}
          </h2>
          <p className="text-gray-600">Manage and track your service tickets</p>
        </div>

        {error && (
          <div className="mb-6 text-sm bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate("/user/raise")}
            className="flex items-center justify-center gap-3 bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-semibold">Raise New Complaint</span>
          </button>

          <button
            onClick={() => navigate("/user/track")}
            className="flex items-center justify-center gap-3 bg-white text-blue-600 p-6 rounded-xl hover:bg-gray-50 transition-colors border-2 border-blue-600 shadow-lg hover:shadow-xl"
          >
            <Search className="w-6 h-6" />
            <span className="text-lg font-semibold">Track Complaint</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">My Tickets</h3>
            <button
              onClick={loadTickets}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              Refresh
            </button>
          </div>

          {/* ✅ nice empty state */}
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-sm">No tickets yet. Raise a complaint to see it here.</p>
          ) : (
            <TicketTable tickets={tickets} onTicketClick={handleTicketClick} />
          )}
        </div>
      </div>
    </div>
  );
}
