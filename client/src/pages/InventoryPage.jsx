import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Download, RefreshCcw } from 'lucide-react';
import { fetchCollection } from '../api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import Drawer from '../components/shared/Drawer.jsx';

const CATEGORIES = ['All', 'Dairy', 'Produce', 'Bakery', 'Meat', 'Beverages', 'Other'];

function exportCSV(data) {
  if (!data.length) return;
  const keys = ['name', 'quantity', 'unit', 'price', 'category'];
  const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'inventory.csv';
  a.click();
}

function ItemForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', price: '', category: '', ...initial });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const fields = [
    { key: 'name',     label: 'Name',     type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'unit',     label: 'Unit',     type: 'text', placeholder: 'kg, units, liters…' },
    { key: 'price',    label: 'Price ($)', type: 'number', step: '0.01' },
    { key: 'category', label: 'Category', type: 'text' },
  ];

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 flex flex-col gap-4">
      {fields.map(f => (
        <div key={f.key}>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
          <input
            type={f.type}
            step={f.step}
            placeholder={f.placeholder ?? f.label}
            value={form[f.key]}
            onChange={set(f.key)}
            required={f.key === 'name'}
            className="w-full bg-[#131320] border border-[#1e1e30] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-indigo-500/50 focus:bg-[#15152a] transition-all"
          />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save Item'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-[#1e1e30] text-slate-400 hover:text-slate-200 text-sm transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortKey, setSortKey] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchCollection('inventory').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = items;
    if (search) list = list.filter(i => JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(i => i.category === category);
    return [...list].sort((a, b) => {
      const va = a[sortKey] ?? '', vb = b[sortKey] ?? '';
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortAsc ? cmp : -cmp;
    });
  }, [items, search, category, sortKey, sortAsc]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await fetch('/api/inventory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity), price: Number(form.price) }),
      });
      setAddOpen(false);
      load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    if (!editItem?._id) return;
    setSaving(true);
    try {
      await fetch(`/api/inventory/${editItem._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity), price: Number(form.price) }),
      });
      setEditItem(null);
      load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const COLS = [
    { key: 'name',     label: 'Name' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit',     label: 'Unit' },
    { key: 'price',    label: 'Price' },
    { key: 'category', label: 'Category' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-[#1a1a2e]">
        <h1 className="text-sm font-semibold text-slate-200 mr-2">Inventory</h1>

        <div className="flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 rounded-lg bg-[#131320] border border-[#1e1e30]">
          <Search size={13} className="text-slate-600 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter items…"
            className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-700 outline-none"
          />
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-[#131320] border border-[#1e1e30] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => exportCSV(filtered)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e30] text-slate-500 hover:text-slate-300 text-xs transition-all">
            <Download size={12} />
            Export
          </button>
          <button onClick={load} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e1e30] text-slate-500 hover:text-slate-300 transition-all">
            <RefreshCcw size={12} />
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
          >
            <Plus size={13} />
            Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto scrollbar-thin px-6 py-0">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-600 text-sm">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No items found</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {COLS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="sticky top-0 bg-[#0c0c14] text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#1a1a2e] cursor-pointer hover:text-slate-300 select-none whitespace-nowrap z-10"
                  >
                    {label}
                    {sortKey === key && <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>}
                  </th>
                ))}
                <th className="sticky top-0 bg-[#0c0c14] border-b border-[#1a1a2e] z-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const low = Number(item.quantity) < 10;
                return (
                  <tr
                    key={item._id ?? i}
                    onClick={() => setEditItem(item)}
                    className={`border-b border-[#12121e] cursor-pointer transition-colors ${
                      low ? 'bg-red-500/[0.04] hover:bg-red-500/[0.07]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-4 py-2.5 text-slate-200 text-xs font-medium">{item.name}</td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className={low ? 'text-red-400 font-bold' : 'text-slate-300'}>{item.quantity}</span>
                      {low && <span className="ml-1.5 px-1 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/25 uppercase">low</span>}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{item.unit}</td>
                    <td className="px-4 py-2.5 text-slate-300 text-xs">${Number(item.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#1e1e30] text-slate-500">{item.category}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 text-xs text-right">Edit →</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-2 border-t border-[#1a1a2e] flex items-center justify-between text-[11px] text-slate-600">
        <span>{filtered.length} items</span>
        <span className="text-red-500/70">{filtered.filter(r => Number(r.quantity) < 10).length} low stock</span>
      </div>

      {/* Add drawer */}
      <Drawer open={addOpen} onClose={() => setAddOpen(false)} title="Add Inventory Item">
        <ItemForm onSave={handleAdd} onCancel={() => setAddOpen(false)} loading={saving} />
      </Drawer>

      {/* Edit drawer */}
      <Drawer open={!!editItem} onClose={() => setEditItem(null)} title={`Edit: ${editItem?.name ?? ''}`}>
        {editItem && (
          <ItemForm
            initial={editItem}
            onSave={handleEdit}
            onCancel={() => setEditItem(null)}
            loading={saving}
          />
        )}
      </Drawer>
    </div>
  );
}
