import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Calendar,
  BarChart3, Settings, Zap,
} from 'lucide-react';

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory',    icon: Package,         label: 'Inventory' },
  { to: '/orders',       icon: ShoppingCart,    label: 'Orders' },
  { to: '/appointments', icon: Calendar,        label: 'Appointments' },
  { to: '/analytics',    icon: BarChart3,       label: 'Analytics' },
];

export default function Sidebar({ lowStockCount }) {
  return (
    <nav className="flex flex-col w-[200px] shrink-0 h-full bg-[#0c0c14] border-r border-[#1a1a2e]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[#1a1a2e] shrink-0">
        <div className="w-7 h-7 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Zap size={14} className="text-indigo-400" />
        </div>
        <span className="text-sm font-bold text-white tracking-tight">OpsAgent</span>
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-0.5 p-2 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const showBadge = label === 'Inventory' && lowStockCount > 0;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon size={15} />
              <span className="font-medium">{label}</span>
              {showBadge && (
                <span className="ml-auto bg-red-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {lowStockCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-[#1a1a2e]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`
          }
        >
          <Settings size={15} />
          <span className="font-medium">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
