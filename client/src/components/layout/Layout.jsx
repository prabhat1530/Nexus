import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-dark-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-24 lg:pb-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
