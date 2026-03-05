import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import TicketTable from "../components/TicketTable.jsx";
import API_URL from "../utils/api.js";
import { getSession, getToken } from "../utils/storage.js";
import { mapTicketFromApi } from "../utils/ticketMapper.js";

export default function UserDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const token = getToken();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session || !token) {
      navigate("/login");
      return;
    }
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load tickets");
        return;
      }

      const mapped = data.map(mapTicketFromApi);
      setTickets(mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setError("Backend not reachable. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/user/track?id=${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-extrabold text-surface-900 mb-2 font-display">
            Welcome back, <span className="text-brand-600">{session?.email?.split('@')[0] || 'User'}</span>
          </h2>
          <p className="text-surface-400 font-medium">Manage and track your service tickets with ease.</p>
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

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.button
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/user/raise")}
            className="group relative overflow-hidden flex items-center justify-center gap-4 bg-gradient-to-br from-brand-600 to-brand-800 text-white p-8 rounded-3xl shadow-xl shadow-brand-200"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="bg-white/20 p-3 rounded-2xl">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <span className="text-xl font-bold font-display">Raise New Complaint</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/user/track")}
            className="group relative overflow-hidden flex items-center justify-center gap-4 bg-white border border-surface-200 text-brand-600 p-8 rounded-3xl shadow-premium"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-brand-50 rounded-full blur-2xl transition-all" />
            <div className="bg-brand-50 p-3 rounded-2xl">
              <Search className="w-8 h-8 text-brand-600" />
            </div>
            <span className="text-xl font-bold font-display">Track Complaint</span>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism rounded-3xl p-8 border-surface-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-surface-900 font-display">My Tickets</h3>
            <button
              onClick={loadTickets}
              className="p-2 hover:bg-surface-50 rounded-xl transition-colors group"
              title="Refresh tickets"
            >
              <Loader2 className={`w-5 h-5 text-surface-400 group-hover:text-brand-600 transition-colors ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
              <p className="text-surface-400 font-medium animate-pulse">Loading your tickets...</p>
            </div>
          ) : (
            <TicketTable tickets={tickets} onTicketClick={handleTicketClick} />
          )}
        </motion.div>
      </main>
    </div>
  );
}
