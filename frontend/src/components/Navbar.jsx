import { useNavigate } from 'react-router-dom';
import { Ticket, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import * as storage from '../utils/storage.js';

const Navbar = () => {
  const navigate = useNavigate();
  const session = storage.getSession();

  const handleLogout = () => {
    storage.clearSession();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-morphism border-b border-white/20"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-200">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-800">
              ServicePortal
            </h1>
          </motion.div>

          <div className="flex items-center gap-6">
            <span className="hidden md:block text-sm font-medium text-surface-400">
              {session?.email}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-surface-200 text-surface-900 rounded-xl hover:bg-surface-50 transition-colors font-semibold text-sm shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
