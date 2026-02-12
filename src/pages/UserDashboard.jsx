import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import TicketTable from '../components/TicketTable.jsx';
import { getTickets, getSession } from '../utils/storage.js';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const session = getSession();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const allTickets = getTickets();
    const userTickets = allTickets.filter(ticket => ticket.userEmail === session.email);
    setTickets(userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/user/track?id=${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {session.email}</h2>
          <p className="text-gray-600">Manage and track your service tickets</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/user/raise')}
            className="flex items-center justify-center gap-3 bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-semibold">Raise New Complaint</span>
          </button>

          <button
            onClick={() => navigate('/user/track')}
            className="flex items-center justify-center gap-3 bg-white text-blue-600 p-6 rounded-xl hover:bg-gray-50 transition-colors border-2 border-blue-600 shadow-lg hover:shadow-xl"
          >
            <Search className="w-6 h-6" />
            <span className="text-lg font-semibold">Track Complaint</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Tickets</h3>
          <TicketTable tickets={tickets} onTicketClick={handleTicketClick} />
        </div>
      </div>
    </div>
  );
}
