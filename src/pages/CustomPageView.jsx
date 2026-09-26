import React from 'react';
import { Layers, ArrowLeft, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export const CustomPageView = ({ page, onBackToHome, onOpenBooking }) => {
  if (!page) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="font-bebas text-4xl text-white">Page Not Found</h2>
        <p className="text-xs text-slate-400">The custom page you are looking for does not exist or has been archived.</p>
        <button
          onClick={onBackToHome}
          className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase"
        >
          Back to Studio Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 animate-fade-in pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-[#0b0b12] border-b border-zinc-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              playClickSound();
              onBackToHome();
            }}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shane's Studio</span>
          </button>

          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
            /{page.slug}
          </span>
        </div>
      </div>

      {/* Dynamic Blocks Renderer */}
      <div className="space-y-16">
        {page.blocks?.map((block) => (
          <div key={block.id}>
            {/* Block Type 1: Hero Banner */}
            {block.type === 'hero' && (
              <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden py-16 px-4">
                {block.bgImage && (
                  <img
                    src={block.bgImage}
                    alt={block.heading}
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/60 to-transparent"></div>

                <div className="relative max-w-4xl mx-auto text-center z-10 space-y-4">
                  {block.badge && (
                    <div className="inline-block px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold uppercase tracking-wider">
                      {block.badge}
                    </div>
                  )}

                  <h1 className="font-bebas text-5xl sm:text-7xl text-white tracking-wide uppercase leading-tight">
                    {block.heading}
                  </h1>

                  <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    {block.subheading}
                  </p>

                  {block.ctaText && (
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          playClickSound();
                          onOpenBooking();
                        }}
                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-2xl flex items-center gap-2 mx-auto cursor-pointer transition hover:scale-105"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{block.ctaText}</span>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Block Type 2: Rich Text */}
            {block.type === 'text' && (
              <section className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-4">
                  <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">
                    {block.title}
                  </h2>
                  <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed space-y-2">
                    {block.content}
                  </div>
                </div>
              </section>
            )}

            {/* Block Type 3: Pricing Menu Table */}
            {block.type === 'pricing_table' && (
              <section className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <h3 className="font-bebas text-3xl text-amber-400 tracking-wide">
                      {block.title}
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono">Rates & Dates</span>
                  </div>

                  <div className="space-y-3">
                    {block.tiers?.map((tier, tidx) => (
                      <div
                        key={tidx}
                        className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="font-bold text-white text-base">{tier.name}</h4>
                          <div className="text-xs text-slate-400">{tier.specialty}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Availability: {tier.dates}</div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          <div className="font-bebas text-2xl text-amber-400 font-bold">
                            {tier.rate}
                          </div>
                          <button
                            onClick={() => {
                              playClickSound();
                              onOpenBooking();
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
