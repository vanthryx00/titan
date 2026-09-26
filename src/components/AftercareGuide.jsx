import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, Square, Printer, Droplets, Sun, AlertTriangle, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export const AftercareGuide = () => {
  const [checkedItems, setCheckedItems] = useState({
    day1: false,
    day2: false,
    day3: false,
    day4: false,
    day5: false,
    day6: false
  });

  const toggleCheck = (key) => {
    playClickSound();
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrintAftercare = () => {
    playClickSound();
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shane's Tattoo Shop - Official Aftercare Protocol</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            h1 { color: #e11d48; margin-bottom: 5px; }
            .section { margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
            .rule { font-weight: bold; color: #0f172a; }
            .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>SHANE'S TATTOO SHOP</h1>
          <p><strong>Official Medical-Grade Tattoo Aftercare Protocol</strong></p>
          <hr/>
          <div class="section">
            <h3>DAYS 1 - 3: Saniderm / Second-Skin Care</h3>
            <p>Leave the medical wrap on for 2 to 3 full days. Plasma/ink pooling inside the wrap is 100% normal. Remove under lukewarm running shower water gently peeling downwards.</p>
          </div>
          <div class="section">
            <h3>DAYS 4 - 7: Washing & Hydration</h3>
            <p>Wash 2-3 times daily with unscented antibacterial soap (Dial Gold). Pat dry with fresh paper towel (NEVER bath towels). Apply a grain-of-rice thin layer of Shane's Healing Balm or Aquaphor.</p>
          </div>
          <div class="section">
            <h3>DAYS 8 - 14: The Peeling & Flaking Phase</h3>
            <p>Your tattoo will peel like a sunburn. <strong>DO NOT PICK, SCRATCH, OR PEEL FLAKES.</strong> Switch to light unscented lotion (Cetaphil / Lubriderm).</p>
          </div>
          <div class="warning">
            <strong>CRITICAL RESTRICTIONS (30 DAYS):</strong><br/>
            NO swimming pools, hot tubs, ocean, or baths (shower only).<br/>
            NO direct sunlight or tanning beds.<br/>
            NO tight abrasive clothing over healing ink.
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center;">Shane's Tattoo Studio • Emergency Ink Line: (555) 742-6378</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <section id="aftercare" className="py-20 bg-[#09090f] relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lifelong Ink Longevity</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase mb-4">
            Master <span className="text-emerald-400">Aftercare & Healing</span> Protocol
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Your tattoo is an open wound and an investment for life. 50% of the final outcome depends on your adherence to Shane's clinical healing guide.
          </p>
        </div>

        {/* 4 Phases Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Phase 1 */}
          <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">PHASE 01 • DAYS 1-3</div>
              <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Second Skin Guard</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Keep the sterile Saniderm bandage on for 48 to 72 hours. Plasma pooling is natural. Remove slowly under lukewarm water.
              </p>
            </div>
            <div className="text-[11px] bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 text-slate-400">
              💧 Shower allowed • No soaking in tub
            </div>
          </div>

          {/* Phase 2 */}
          <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div>
              <div className="text-xs font-mono text-amber-400 mb-1">PHASE 02 • DAYS 4-7</div>
              <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Gentle Cleanse & Balm</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Wash twice daily with unscented antibacterial soap. Pat dry with paper towels. Apply a razor-thin layer of Shane's Soothing Balm.
              </p>
            </div>
            <div className="text-[11px] bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 text-slate-400">
              🧴 Less is more: never suffocate ink
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
            <div>
              <div className="text-xs font-mono text-rose-400 mb-1">PHASE 03 • DAYS 8-14</div>
              <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">The Peeling Phase</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Skin will flake like a sunburn. Under NO circumstances should you pick or scratch peeling flakes. Switch to fragrance-free lotion.
              </p>
            </div>
            <div className="text-[11px] bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 text-slate-400">
              🚫 Zero scratching • Slap gently if itchy
            </div>
          </div>

          {/* Phase 4 */}
          <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div>
              <div className="text-xs font-mono text-emerald-400 mb-1">PHASE 04 • DAY 15+</div>
              <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Long-Term UV Shield</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Epidermis is fully regenerated. Protect bold pigments and contrast by applying SPF 50+ mineral sunscreen whenever outdoors.
              </p>
            </div>
            <div className="text-[11px] bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 text-slate-400">
              ☀️ Sun is the #1 enemy of tattoo ink
            </div>
          </div>
        </div>

        {/* Interactive Checklist & Print CTA */}
        <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <h3 className="font-bebas text-3xl text-white tracking-wide flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-emerald-400" />
              Interactive Client Daily Healing Checklist
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'day1', label: 'Washed hands before touching fresh tattoo' },
                { id: 'day2', label: 'Patted dry with fresh disposable paper towel' },
                { id: 'day3', label: 'Applied paper-thin coat of healing ointment' },
                { id: 'day4', label: 'Drank 2.5L+ water to keep skin hydrated' },
                { id: 'day5', label: 'Avoided direct sun exposure & hot tubs' },
                { id: 'day6', label: 'Wore loose-fitting, breathable cotton clothing' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-2 rounded-xl text-left border flex items-center gap-2 transition cursor-pointer ${
                    checkedItems[item.id]
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-zinc-900/60 border-zinc-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {checkedItems[item.id] ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                  )}
                  <span className="text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-2 shrink-0">
            <button
              onClick={handlePrintAftercare}
              className="px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Clinical Guide</span>
            </button>
            <div className="text-[10px] text-center text-slate-500">
              Complimentary sterile sheet included with all sessions
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
