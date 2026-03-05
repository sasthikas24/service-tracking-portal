import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Search, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import TicketTable from "../components/TicketTable.jsx";
import API_URL from "../utils/api.js";
import { getToken, getSession } from "../utils/storage.js";
import { mapTicketFromApi } from "../utils/ticketMapper.js";

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Resolved"];
const CATEGORY_OPTIONS = ["All", "Network", "Payment", "Delivery", "General", "Other"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = getToken();
  const session = getSession();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters & Pagination State
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Items per page
  const [hasMore, setHasMore] = useState(false); // Simple pagination check

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
  }, [page, statusFilter, categoryFilter]);

  // Debounced search effect could be added, but manual refresh/enter is okay for now
  // For simplicity, we'll trigger search on Enter or Button click

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (statusFilter !== "All") params.append("status", statusFilter);
      if (categoryFilter !== "All") params.append("category", categoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`${API_URL}/api/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load tickets");
        setTickets([]);
      } else {
        const mapped = data.map(mapTicketFromApi);
        setTickets(mapped);
        // Heuristic: if we got 'limit' items, there might be more.
        // real API should return total count, but for now this suffices.
        setHasMore(mapped.length === limit);
      }
    } catch {
      setError("Backend not reachable. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    loadTickets();
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6"
        >
          <div>
            <h2 className="text-4xl font-extrabold text-surface-900 mb-2 font-display">Admin <span className="text-brand-600">Dashboard</span></h2>
            <p className="text-surface-400 font-medium">Manage and resolve service tickets across the organization.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadTickets}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-surface-200 rounded-2xl hover:bg-surface-50 transition-all shadow-sm text-surface-900 font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-brand-600 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </motion.button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl shadow-sm text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-morphism rounded-3xl p-8 mb-8 border-surface-100"
        >
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">

            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-3">
                Search Tickets
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, Title, Email..."
                  className="w-full pl-11 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                />
                <Search className="w-4 h-4 text-surface-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-3">
                Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none appearance-none transition-all text-sm font-medium"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Filter className="w-4 h-4 text-surface-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-3">
                Category
              </label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none appearance-none transition-all text-sm font-medium"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Filter className="w-4 h-4 text-surface-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Submit Button (for Search) */}
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary w-full py-3"
              >
                Apply Search
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism rounded-3xl p-8 border-surface-100"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
              <p className="text-surface-400 font-medium animate-pulse">Loading tickets...</p>
            </div>
          ) : (
            <>
              <TicketTable tickets={tickets} onTicketClick={handleTicketClick} />

              {/* Pagination Controls */}
              <div className="mt-10 flex items-center justify-between border-t border-surface-100 pt-8">
                <p className="text-sm font-bold text-surface-400 uppercase tracking-widest">
                  Page <span className="text-brand-600">{page}</span>
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-5 py-2.5 border border-surface-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-50 transition-all font-bold text-sm text-surface-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasMore && tickets.length < limit}
                    className="flex items-center gap-2 px-5 py-2.5 border border-surface-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-50 transition-all font-bold text-sm text-surface-900"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
