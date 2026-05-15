import { NavLink } from 'react-router-dom';
import {
  X, LayoutDashboard, Package, ShoppingCart, Calendar,
  BarChart3, Settings, Zap,
} from 'lucide-react';

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory',    icon: Package,         label: 'Inventory' },
  { to: '/orders',       icon: ShoppingCart,    label: 'Orders' },
  { to: '/appointments', icon: Calendar,        label: 'Appointments' },
  { to: '/analytics',    icon: BarChart3,       label: 'Analytics' },
];

export default function Sidebar({ lowStockCount, open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <nav className={[
        'fixed inset-y-0 left-0 z-50 flex flex-col w-[220px] shrink-0 bg-white border-r border-[#E5E7EB]',
        'transform transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:static md:inset-auto md:translate-x-0 md:z-auto',
      ].join(' ')}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[#E5E7EB] shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-[#111827] tracking-tight">OpsAgent</span>
          <button
            onClick={onClose}
            className="md:hidden ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280] transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav */}
        <div className="flex flex-col p-3 flex-1 gap-0.5">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
            Menu
          </p>
          {NAV.map(({ to, icon: Icon, label }) => {
            const showBadge = label === 'Inventory' && lowStockCount > 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{label}</span>
                    {showBadge && (
                      <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                        {lowStockCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Settings */}
        <div className="p-3 border-t border-[#E5E7EB]">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`
            }
          >
            <Settings size={15} strokeWidth={2} />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
}
