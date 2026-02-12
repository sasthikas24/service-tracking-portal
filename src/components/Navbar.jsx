import { useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import * as storage from '../utils/storage.js';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.clearSession();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            <h1 className="text-xl font-bold">Service Tracking Portal</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
