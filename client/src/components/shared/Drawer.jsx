import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Drawer({ open, onClose, title, children, width = 420 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          {/* Panel */}
          <motion.div
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ width }}
            className="fixed right-0 top-0 h-full bg-[#0e0e1a] border-l border-[#1e1e30] z-50 flex flex-col overflow-hidden"
          >
            <div className="shrink-0 flex items-center justify-between px-5 h-14 border-b border-[#1e1e30]">
              <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all">
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
