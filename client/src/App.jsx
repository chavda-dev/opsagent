import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { useConnection } from './hooks/useConnection.js';
import { useLowStockAlerts } from './hooks/useLowStockAlerts.js';

import Sidebar from './components/layout/Sidebar.jsx';
import TopBar from './components/layout/TopBar.jsx';
import AgentTerminal from './components/layout/AgentTerminal.jsx';

import Dashboard from './pages/Dashboard.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function App() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const conn = useConnection();
  const lowStockCount = useLowStockAlerts();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setTerminalOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleDataChange = (collection) => {
    if (!collection) return;
    const routes = { inventory: '/inventory', orders: '/orders', appointments: '/appointments' };
    if (routes[collection]) navigate(routes[collection]);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#111827] overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#ffffff', border: '1px solid #E5E7EB', color: '#111827', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
          error: { iconTheme: { primary: '#EF4444', secondary: '#ffffff' } },
        }}
      />

      <Sidebar lowStockCount={lowStockCount} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar
          connStatus={conn}
          terminalOpen={terminalOpen}
          onToggleTerminal={() => setTerminalOpen(v => !v)}
          onReconnect={() => window.location.reload()}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 overflow-hidden min-w-0">
            <Routes>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/inventory"    element={<InventoryPage />} />
              <Route path="/orders"       element={<OrdersPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/analytics"    element={<AnalyticsPage />} />
              <Route path="/settings"     element={<SettingsPage />} />
            </Routes>
          </main>

          <AnimatePresence>
            {terminalOpen && !isMobile && (
              <motion.div
                key="terminal-desktop"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 280 }}
                className="shrink-0 overflow-hidden"
              >
                <AgentTerminal onDataChange={handleDataChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile terminal — full-screen slide-up */}
      <AnimatePresence>
        {terminalOpen && isMobile && (
          <motion.div
            key="terminal-mobile"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            <AgentTerminal onDataChange={handleDataChange} onClose={() => setTerminalOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
