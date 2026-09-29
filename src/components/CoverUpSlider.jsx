import React, { useState, useRef } from 'react';
import { Layers, Sparkles, MoveHorizontal, CheckCircle2, ArrowRight } from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export const CoverUpSlider = ({ onBookCoverUp }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(percent);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(percent);
  };

  return (
    <section className="py-20 bg-[#08080d] relative border-t border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>Master Cover-Up Transformations</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase mb-4">
            Turn Regret Into <span className="text-crimson-gradient">High Art</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Old, faded, or poorly executed tattoos don't have to be permanent mistakes. 
            Drag the slider to see how Shane Vance turns outdated ink into world-class masterpieces.
          </p>
        </div>

        {/* Interactive Comparison Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Slider */}
          <div className="lg:col-span-7">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl select-none cursor-ew-resize group"
            >
              {/* After Image (Full background) */}
              <img
                src="https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80"
                alt="After Cover Up - Master Japanese Dragon by Shane"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                ✨ After: Master Irezumi by Shane
              </div>

              {/* Before Image (Clipped overlay) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=80"
                  alt="Before Cover Up"
                  className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-75 brightness-75"
                  style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%', maxWidth: 'none' }}
                />
                <div className="absolute top-4 left-4 bg-black/80 text-rose-400 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  ❌ Before: Faded 2012 Tribal
                </div>
              </div>

              {/* Slider Divider Bar */}
              <div
                className="absolute inset-y-0 w-1 bg-rose-500 cursor-ew-resize z-20 shadow-[0_0_15px_rgba(225,29,72,0.8)]"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-rose-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xl">
                  <MoveHorizontal className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
              <span>◄ Drag slider to compare </span>
              <span className="font-mono text-rose-400">Position: {Math.round(sliderPos)}%</span>
            </div>
          </div>

          {/* Right Info Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bebas text-3xl text-white tracking-wide">
                The Shane Vance <span className="text-amber-400">Cover-Up Protocol</span>
              </h3>
              
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero-Ghosting Technology:</strong> Strategic dark value saturation and anatomy contouring ensures the old tattoo is 100% invisible.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Complimentary Consultation:</strong> We inspect your existing scar tissue, pigment depth, and skin tone before sketching the stencil.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>No Judgment Guarantee:</strong> Everyone has tattoos from the past they've outgrown. We treat every project with respect and confidentiality.</span>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => {
                    playClickSound();
                    onBookCoverUp();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                >
                  <span>Book Free Cover-Up Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
