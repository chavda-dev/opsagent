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

export default function App() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const conn = useConnection();
  const lowStockCount = useLowStockAlerts();
  const navigate = useNavigate();

  // Ctrl+` toggles terminal
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
    <div className="flex h-screen bg-[#080810] text-slate-100 overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0e0e1a', border: '1px solid #1e1e30', color: '#e2e8f0', fontSize: 13 },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0e0e1a' } },
        }}
      />

      {/* Sidebar */}
      <Sidebar lowStockCount={lowStockCount} />

      {/* Main column */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          connStatus={conn}
          terminalOpen={terminalOpen}
          onToggleTerminal={() => setTerminalOpen(v => !v)}
          onReconnect={() => window.location.reload()}
        />

        {/* Page content + terminal side-by-side */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 overflow-hidden">
            <Routes>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/inventory"    element={<InventoryPage />} />
              <Route path="/orders"       element={<OrdersPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/analytics"    element={<AnalyticsPage />} />
              <Route path="/settings"     element={<SettingsPage />} />
            </Routes>
          </main>

          {/* Agent Terminal panel */}
          <AnimatePresence>
            {terminalOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
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
    </div>
  );
}
