import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import TicketTable from "../components/TicketTable.jsx";
import API_URL from "../utils/api.js";
import { getToken, getSession, clearSession } from "../utils/storage.js";

const STATUS_OPTIONS = ["All", "PENDING", "Open", "In Progress", "Resolved"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = getToken();
  const session = getSession();

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchId, setSearchId] = useState("");
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
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, statusFilter, searchId]);

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

  const applyFilters = () => {
    let filtered = [...tickets];

    if (statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (searchId.trim()) {
      filtered = filtered.filter((t) =>
        t.id.toLowerCase().includes(searchId.trim().toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };

  const getStatusCounts = () => ({
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "PENDING").length,
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  });

  const counts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage all service tickets</p>
        </div>

        {error && (
          <div className="mb-6 text-sm bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">Total</p>
            <p className="text-3xl font-bold">{counts.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">Pending</p>
            <p className="text-3xl font-bold">{counts.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">Open</p>
            <p className="text-3xl font-bold">{counts.open}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">In Progress</p>
            <p className="text-3xl font-bold">{counts.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">Resolved</p>
            <p className="text-3xl font-bold">{counts.resolved}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={loadTickets}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              Refresh
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search by Ticket ID
              </label>
              <input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter ticket ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:w-56">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <p className="text-gray-500 text-sm">No tickets found for the filter.</p>
          ) : (
            <TicketTable tickets={filteredTickets} onTicketClick={handleTicketClick} />
          )}
        </div>
      </div>
    </div>
  );
}
