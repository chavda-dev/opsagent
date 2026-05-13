import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { fetchCollection } from '../api.js';

export function useLowStockAlerts() {
  const [lowStockCount, setLowStockCount] = useState(0);
  const prevIds = useRef(new Set());

  useEffect(() => {
    const check = async () => {
      try {
        const items = await fetchCollection('inventory');
        const low = items.filter(i => Number(i.quantity) < 10);
        const newIds = new Set(low.map(i => i._id));

        const newAlerts = low.filter(i => !prevIds.current.has(i._id));
        if (newAlerts.length > 0 && prevIds.current.size > 0) {
          toast.error(`${newAlerts.length} new low stock item${newAlerts.length > 1 ? 's' : ''} detected`, {
            duration: 5000,
            position: 'top-right',
          });
        }

        prevIds.current = newIds;
        setLowStockCount(low.length);
      } catch {}
    };

    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, []);

  return lowStockCount;
}
