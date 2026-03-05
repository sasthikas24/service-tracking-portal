import { useState, useEffect } from "react";
import { Search, Loader2, MessageSquare, History, Send, User, ShieldAlert, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import API_URL from "../utils/api.js";
import { getToken, getSession } from "../utils/storage.js";
import { mapTicketFromApi } from "../utils/ticketMapper.js";
import { useNavigate } from "react-router-dom";

export default function TrackComplaint() {
  const navigate = useNavigate();
  const session = getSession();
  const token = getToken();

  // State
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details"); // details, comments, history

  // Comment Form
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam) {
      setTicketId(idParam);
      fetchTicketData(idParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTicketData = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    setTicket(null);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Get Ticket
      const res = await fetch(`${API_URL}/api/tickets/${id}`, { headers });

      if (res.status === 404) throw new Error("Ticket not found");
      if (res.status === 403) throw new Error("You are not authorized to view this ticket");
      if (!res.ok) throw new Error("Failed to fetch ticket");

      const data = await res.json();
      setTicket(mapTicketFromApi(data));

      // 2. Get Comments (if authorized, which they must be if they got the ticket)
      if (token) {
        const resCom = await fetch(`${API_URL}/api/tickets/${id}/comments`, { headers });
        if (resCom.ok) setComments(await resCom.json());

        const resHist = await fetch(`${API_URL}/api/tickets/${id}/history`, { headers });
        if (resHist.ok) setHistory(await resHist.json());
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTicketData(ticketId);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        // Reload comments
        const resCom = await fetch(`${API_URL}/api/tickets/${ticket.id}/comments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resCom.ok) setComments(await resCom.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto mb-10 text-center">
          {session && (
            <button
              onClick={() => navigate("/user/dashboard")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          )}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Track Your Complaint</h2>
          <p className="text-gray-600 mb-8">Enter your Ticket ID to check the current status and view details.</p>

          <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g., TKT-171562..."
              className="w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-14 text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
            </button>
          </form>
          {error && <p className="mt-4 text-red-500 bg-red-50 py-2 px-4 rounded-lg inline-block">{error}</p>}
        </div>

        {ticket && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg run-animation-fade-in overflow-hidden">

            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-1">Ticket Details</h3>
                <p className="text-sm opacity-90">{ticket.id}</p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <MessageSquare className="w-4 h-4" /> Discussion
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <History className="w-4 h-4" /> Timeline
              </button>
            </div>

            <div className="p-8">
              {/* DETAILS & COMMENTS TAB */}
              {activeTab === "details" && (
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {ticket.description}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span><span className="font-semibold">Category:</span> {ticket.category}</span>
                      <span><span className="font-semibold">Created:</span> {formatDate(ticket.createdAt)}</span>
                    </div>
                    {ticket.remark && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="font-bold text-yellow-800 text-sm mb-1">Admin Remark</p>
                        <p className="text-yellow-900">{ticket.remark}</p>
                      </div>
                    )}
                  </div>

                  <hr />

                  {/* Comments Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Comments</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto mb-4 pr-2">
                      {comments.length === 0 && <p className="text-gray-400">No comments yet.</p>}
                      {comments.map((c) => (
                        <div key={c.id} className={`flex gap-3 ${c.user_email === session?.email ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${c.is_admin ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                            {c.is_admin ? <ShieldAlert className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className={`max-w-[80%] rounded-lg p-3 ${c.user_email === session?.email ? 'bg-green-50 text-green-900' : 'bg-gray-100 text-gray-800'}`}>
                            <div className="flex justify-between items-center gap-4 mb-1">
                              <span className="text-xs font-bold">{c.is_admin ? 'Admin' : 'You'}</span>
                              <span className="text-xs opacity-60">{formatDate(c.created_at)}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    {token ? (
                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Reply to this ticket..."
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" disabled={!newComment.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-500 text-center bg-gray-50 p-2 rounded">Log in to post comments.</p>
                    )}
                  </div>
                </div>
              )}

              {/* HISTORY TAB */}
              {activeTab === "history" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Ticket History</h3>
                  {history.length === 0 && <p className="text-gray-400">No history available.</p>}
                  <div className="relative border-l-2 border-blue-100 ml-3 space-y-8 pl-8 py-2">
                    {history.map((h, i) => (
                      <div key={h.id} className="relative">
                        <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600"></span>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            Status updated to <span className="text-blue-600 font-bold">{h.new_status}</span>
                          </p>
                          {h.old_status && <p className="text-xs text-gray-500 mt-1">Previous: {h.old_status}</p>}
                          <div className="flex justify-between items-center mt-2 border-t pt-2">
                            <span className="text-xs text-gray-500">by {h.changed_by}</span>
                            <span className="text-xs text-gray-400">{formatDate(h.change_time)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
