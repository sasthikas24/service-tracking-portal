import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, History, MessageSquare, User, ShieldAlert, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { getSession, getToken } from "../utils/storage.js";
import API_URL from "../utils/api.js";
import { mapTicketFromApi } from "../utils/ticketMapper.js";

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved"];

const labelStatus = (s) => {
  if (s === "Open") return "Open";
  if (s === "In Progress") return "In Progress";
  if (s === "Resolved") return "Resolved";
  return s;
};

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const token = getToken();

  // Data State
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);

  // Form State
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [newComment, setNewComment] = useState("");

  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details"); // details, comments, history
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session || session.role !== "admin") {
      navigate("/login");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("No token found");

      // 1. Get Ticket Details
      const resTicket = await fetch(`${API_URL}/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resTicket.ok) throw new Error("Failed to load ticket");
      const dataTicket = await resTicket.json();
      const mapped = mapTicketFromApi(dataTicket);

      setTicket(mapped);
      setStatus(mapped.status);
      setRemark(mapped.remark);

      // 2. Get Comments
      const resComments = await fetch(`${API_URL}/api/tickets/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resComments.ok) {
        setComments(await resComments.json());
      }

      // 3. Get History
      const resHistory = await fetch(`${API_URL}/api/tickets/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resHistory.ok) {
        setHistory(await resHistory.json());
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load ticket data. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, remark }),
      });

      if (!res.ok) throw new Error("Update failed");

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      loadData(); // Reload to get new history
    } catch (err) {
      alert("Error updating ticket: " + err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        // Reload comments only
        const resComments = await fetch(`${API_URL}/api/tickets/${id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resComments.ok) setComments(await resComments.json());
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">{error || "Ticket not found"}</div>;

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
          <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-down">
            Ticket updated successfully!
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">

          {/* LEFT COLUMN: Details & Actions */}
          <div className="md:col-span-2 space-y-6">
            {/* Ticket Info Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-1">Ticket Details</h3>
                  <p className="text-sm opacity-90">{ticket.id}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>

              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="font-semibold block">Category:</span> {ticket.category}
                  </div>
                  <div>
                    <span className="font-semibold block">User:</span> {ticket.userEmail}
                  </div>
                  <div>
                    <span className="font-semibold block">Created:</span> {formatDate(ticket.createdAt)}
                  </div>
                  <div>
                    <span className="font-semibold block">Updated:</span> {formatDate(ticket.updatedAt)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {ticket.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs for Comments & History */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Comments ({comments.length})
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <History className="w-4 h-4" /> Audit Log
                </button>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {comments.length === 0 && <p className="text-gray-400 text-center py-4">No comments yet.</p>}
                      {comments.map((c) => (
                        <div key={c.id} className={`flex gap-3 ${c.is_admin ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${c.is_admin ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                            {c.is_admin ? <ShieldAlert className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className={`max-w-[80%] rounded-lg p-3 ${c.is_admin ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
                            <div className="flex justify-between items-center gap-4 mb-1">
                              <span className="text-xs font-bold">{c.is_admin ? 'Admin' : c.user_email}</span>
                              <span className="text-xs opacity-60">{formatDate(c.created_at)}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type a comment..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button type="submit" disabled={!newComment.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {history.length === 0 && <p className="text-gray-400 text-center py-4">No history available.</p>}
                    {history.map((h) => (
                      <div key={h.id} className="flex gap-4 items-start pb-4 border-b last:border-0 border-gray-100">
                        <div className="mt-1">
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Status changed from <span className="text-red-500">{h.old_status || 'None'}</span> to <span className="text-green-600">{h.new_status}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            by {h.changed_by} on {formatDate(h.change_time)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Admin Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
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
                      <option key={s} value={s}>{labelStatus(s)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="remark" className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Remark
                  </label>
                  <textarea
                    id="remark"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Add notes, resolution details..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
