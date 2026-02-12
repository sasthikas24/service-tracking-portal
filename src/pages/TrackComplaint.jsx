import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getTicketById } from '../utils/storage.js';

export default function TrackComplaint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get('id') || '');
  const [ticket, setTicket] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('id')) {
      handleSearch();
    }
  }, []);

  const handleSearch = () => {
    setSearched(true);
    const foundTicket = getTicketById(ticketId.trim());
    setTicket(foundTicket);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Your Complaint</h2>

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

          {searched && !ticket && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h3>
              <p className="text-gray-600">Please check the ticket ID and try again</p>
            </div>
          )}

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
                    <p className="text-lg text-gray-900">{ticket.status}</p>
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
