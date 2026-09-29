import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, RefreshCw, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../../utils/soundEffects';

export const InventoryTab = ({ inventory = [], onUpdateStock }) => {
  const [items, setItems] = useState(inventory);
  const [reorderedId, setReorderedId] = useState(null);

  const handleAdjustStock = (id, delta) => {
    playClickSound();
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, stock: Math.max(0, item.stock + delta) };
      }
      return item;
    });
    setItems(updated);
    if (onUpdateStock) onUpdateStock(updated);
  };

  const handleQuickReorder = (item) => {
    playClickSound();
    playSuccessChime();
    setReorderedId(item.id);
    setTimeout(() => {
      handleAdjustStock(item.id, 50);
      setReorderedId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Package className="w-4 h-4" />
            Medical Disposables & Ink Cartridge Supply
          </div>
          <h2 className="font-bebas text-3xl text-white tracking-wide">
            Studio Inventory & Supply Tracking
          </h2>
          <p className="text-xs text-slate-400">
            Real-time batch tracking for sterile Kwadron needle cartridges, pure vegan pigments, and PPE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Low Stock Alerts: <strong className="text-amber-400 font-bold">{items.filter(i => i.stock <= i.minThreshold).length} items</strong>
          </span>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item) => {
          const isLow = item.stock <= item.minThreshold;
          return (
            <div
              key={item.id}
              className={`bg-[#111119] border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition ${
                isLow ? 'border-amber-500/50 bg-amber-950/10' : 'border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">{item.category}</span>
                  {isLow ? (
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/50 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Reorder
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/50 font-bold">
                      Optimal
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white mb-1">{item.item}</h4>
                <div className="text-[11px] text-zinc-400 mb-3">Supplier: {item.supplier}</div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center mb-4">
                  <div className="text-xs text-slate-400">In Stock:</div>
                  <div className={`font-bebas text-2xl font-bold ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {item.stock} <span className="text-xs font-mono text-zinc-500">{item.unit}</span>
                  </div>
                </div>
              </div>

              {/* Adjust Stock Controls */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleAdjustStock(item.id, -5)}
                    className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleAdjustStock(item.id, 5)}
                    className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    +5
                  </button>
                </div>

                <button
                  onClick={() => handleQuickReorder(item)}
                  className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  {reorderedId === item.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>PO Submitted!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Quick Supplier PO (+50)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
