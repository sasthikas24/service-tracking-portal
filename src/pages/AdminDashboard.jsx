import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import TicketTable from '../components/TicketTable.jsx';
import { getTickets } from '../utils/storage.js';

const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Resolved'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, statusFilter, searchId]);

  const loadTickets = () => {
    const allTickets = getTickets();
    setTickets(allTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    if (statusFilter !== 'All') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (searchId.trim()) {
      filtered = filtered.filter(ticket =>
        ticket.id.toLowerCase().includes(searchId.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };

  const getStatusCounts = () => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'Open').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage all service tickets</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">Total Tickets</p>
            <p className="text-3xl font-bold text-gray-900">{counts.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">Open</p>
            <p className="text-3xl font-bold text-yellow-600">{counts.open}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{counts.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 font-semibold mb-1">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{counts.resolved}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search by Ticket ID
              </label>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter ticket ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <TicketTable tickets={filteredTickets} onTicketClick={handleTicketClick} />
        </div>
      </div>
    </div>
  );
}
