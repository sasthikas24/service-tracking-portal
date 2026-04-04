import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { getSession, getToken, clearSession } from "../utils/storage.js";
import API_URL from "../utils/api.js";

const labelStatus = (s) => {
  if (s === "Open") return "Open";
  if (s === "In Progress") return "In Progress";
  if (s === "Resolved") return "Resolved";
  return s;
};

// ✅ Convert backend snake_case -> frontend camelCase safely
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

export default function TrackComplaint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const session = getSession();

  const [ticketId, setTicketId] = useState(searchParams.get("id") || "");
  const [ticket, setTicket] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // ✅ redirect if not logged in
  useEffect(() => {
    if (!session) navigate("/login");
  }, [session, navigate]);

  // ✅ auto-search if id is in URL
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      doSearch(idFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = async (id) => {
    const cleaned = (id || "").trim();
    setTicketId(cleaned);
    setSearched(true);
    setTicket(null);
    setError("");

    if (!cleaned) {
      setError("Please enter a Ticket ID.");
      return;
    }

    const token = getToken();
    if (!token) {
      clearSession();
      navigate("/login");
      return;
    }

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
        setError(data?.message || "Failed to load tickets from server");
        return;
      }

      const foundRaw = Array.isArray(data)
        ? data.find((t) => String(t.id).toLowerCase() === cleaned.toLowerCase())
        : null;

      if (!foundRaw) {
        setError("Ticket not found. Please check the ID.");
        return;
      }

      const found = mapTicket(foundRaw);

      // ✅ Only show ticket if user owns it or is admin
      if (session?.role !== "admin" && found.userEmail !== session?.email) {
        setError("You are not allowed to view this ticket.");
        return;
      }

      setTicket(found);
    } catch (err) {
      console.error("Search error:", err);
      setError("Backend not reachable. Is Flask running?");
    }
  };

  const handleSearch = () => doSearch(ticketId);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/user/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Track Your Complaint
            </h2>

            <div className="flex gap-4">
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Enter Ticket ID (e.g., TKT-2026-1234)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          {/* ✅ Error message */}
          {searched && !ticket && error && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Not Available</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {/* ✅ Ticket found */}
          {ticket && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Ticket ID</p>
                    <h3 className="text-2xl font-bold">{ticket.id}</h3>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Category</p>
                    <p className="text-lg text-gray-900">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Status</p>
                    <p className="text-lg text-gray-900">{labelStatus(ticket.status)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Title</p>
                  <p className="text-lg text-gray-900">{ticket.title}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
                </div>

                {ticket.remark && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Admin Remark</p>
                    <p className="text-blue-800">{ticket.remark}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Created At</p>
                    <p className="text-gray-700">{formatDate(ticket.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Last Updated</p>
                    <p className="text-gray-700">{formatDate(ticket.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
