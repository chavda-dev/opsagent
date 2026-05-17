import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Download, RefreshCcw, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { fetchCollection, searchInventory } from '../api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import Drawer from '../components/shared/Drawer.jsx';

function exportCSV(data) {
  if (!data.length) return;
  const keys = ['name', 'quantity', 'unit', 'price', 'category', 'supplier', 'status'];
  const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'inventory.csv';
  a.click();
}

const INPUT_CLS = 'w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-indigo-400 focus:bg-white transition-all';

function ItemForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', price: '', category: '', supplier: '', ...initial });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const fields = [
    { key: 'name',     label: 'Item Name',  type: 'text' },
    { key: 'quantity', label: 'Quantity',   type: 'number' },
    { key: 'unit',     label: 'Unit',       type: 'text', placeholder: 'kg, units, liters…' },
    { key: 'price',    label: 'Price ($)',  type: 'number', step: '0.01' },
    { key: 'category', label: 'Category',   type: 'text' },
    { key: 'supplier', label: 'Supplier',   type: 'text' },
  ];

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 flex flex-col gap-4">
      {fields.map(f => (
        <div key={f.key}>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
          <input
            type={f.type}
            step={f.step}
            placeholder={f.placeholder ?? f.label}
            value={form[f.key]}
            onChange={set(f.key)}
            required={f.key === 'name'}
            className={INPUT_CLS}
          />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Saving…' : 'Save Item'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] text-sm transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const COLS = [
  { key: 'name',     label: 'Item Name' },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Stock' },
  { key: 'unit',     label: 'Unit' },
  { key: 'price',    label: 'Price' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'status',   label: 'Status' },
];

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
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchCollection('inventory').then(setItems).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  // Debounced AI search — fires 500ms after user stops typing
  useEffect(() => {
    if (!search.trim()) {
      setAiResults(null);
      setAiLoading(false);
      return;
    }
    setAiLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchInventory(search.trim());
        setAiResults(data.results ?? []);
      } catch {
        setAiResults(null); // fall back to local string filter on error
      } finally {
        setAiLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort()], [items]);

  const filtered = useMemo(() => {
    // Use AI results when available; fall back to local string filter during debounce or on error
    let list = aiResults !== null
      ? aiResults
      : (search ? items.filter(i => JSON.stringify(i).toLowerCase().includes(search.toLowerCase())) : items);
    if (category !== 'All') list = list.filter(i => i.category === category);
    return [...list].sort((a, b) => {
      const va = a[sortKey] ?? '', vb = b[sortKey] ?? '';
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortAsc ? cmp : -cmp;
    });
  }, [aiResults, items, search, category, sortKey, sortAsc]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={11} className="text-[#D1D5DB]" />;
    return sortAsc ? <ChevronUp size={11} className="text-indigo-500" /> : <ChevronDown size={11} className="text-indigo-500" />;
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

  const lowCount = filtered.filter(r => Number(r.quantity) < 10).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E5E7EB] bg-white flex-wrap">
        <div>
          <h1 className="text-base font-bold text-[#111827]">Inventory</h1>
          <p className="text-xs text-[#9CA3AF]">
            {filtered.length} items{lowCount > 0 ? ` · ${lowCount} low stock` : ''}
            {aiResults !== null && <span className="ml-1.5 text-indigo-500 font-medium">· AI search</span>}
          </p>
        </div>

        <div className={`flex items-center gap-2 flex-1 min-w-[140px] max-w-xs px-3 py-2 rounded-lg border sm:ml-4 transition-all ${
          search ? 'bg-white border-indigo-300 ring-1 ring-indigo-100' : 'bg-[#F3F4F6] border-[#E5E7EB]'
        }`}>
          <Search size={13} className="text-[#9CA3AF] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search inventory…"
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder-[#9CA3AF] outline-none min-w-0"
          />
          {aiLoading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin shrink-0" />
          ) : (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-500 border border-indigo-100 shrink-0 whitespace-nowrap">
              <Sparkles size={8} />
              AI
            </span>
          )}
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="hidden sm:block bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#374151] outline-none cursor-pointer hover:border-[#D1D5DB] transition-all"
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] text-xs font-medium transition-all"
          >
            <Download size={12} />
            Export
          </button>
          <button
            onClick={load}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-all"
          >
            <RefreshCcw size={12} />
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus size={13} />
            Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#9CA3AF] text-sm">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-[#9CA3AF] text-sm">No items found</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                {COLS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => key !== 'status' && toggleSort(key)}
                    className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] select-none whitespace-nowrap ${key !== 'status' ? 'cursor-pointer hover:text-[#374151]' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {key !== 'status' && <SortIcon col={key} />}
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3 bg-[#F8F9FA]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const low = Number(item.quantity) < 10;
                const pct = Math.min(100, Math.round((Number(item.quantity) / (item.reorderLevel || 50)) * 100));
                return (
                  <tr
                    key={item._id ?? i}
                    onClick={() => setEditItem(item)}
                    className={`border-b border-[#F3F4F6] cursor-pointer transition-colors group ${
                      low ? 'bg-red-50/50 hover:bg-red-50' : 'bg-white hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <td className="px-5 py-3.5 text-[#111827] font-semibold text-sm">{item.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${low ? 'text-red-600' : 'text-[#111827]'}`}>
                            {item.quantity}
                          </span>
                          {low && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-600 border border-red-200 uppercase">
                              low
                            </span>
                          )}
                        </div>
                        <div className="w-16 h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct < 30 ? 'bg-red-500' : pct < 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280] text-sm">{item.unit}</td>
                    <td className="px-5 py-3.5 text-[#374151] font-semibold">${Number(item.price || 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-[#6B7280] text-sm">{item.supplier || '—'}</td>
                    <td className="px-5 py-3.5">{item.status && <StatusBadge value={item.status} />}</td>
                    <td className="px-5 py-3.5 text-[#9CA3AF] text-xs text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit →
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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
