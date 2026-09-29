import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  Flame, 
  ShieldCheck, 
  Star, 
  Clock, 
  ArrowRight, 
  Layers, 
  Activity, 
  Zap 
} from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export const Hero = ({ onOpenBooking, onScrollTo }) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 bg-[#07070a]">
        {/* Gradients and radial glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-rose-600/15 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none"></div>
        
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-noise opacity-70"></div>
        
        {/* Overlay decorative lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#16162208_1px,transparent_1px),linear-gradient(to_bottom,#16162208_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Live Studio Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-rose-500/30 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-xl shadow-rose-950/40 animate-fade-in">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-200">
            Shane's Ink Sanctuary & Piercing Lab • <span className="text-amber-400 font-semibold">2 Walk-in Spots Available</span>
          </span>
          <span className="hidden sm:inline text-zinc-500">|</span>
          <span className="hidden sm:inline text-rose-400 font-mono text-xs">Sterile Grade Autoclave</span>
        </div>

        {/* Massive Headline */}
        <div className="space-y-4 max-w-5xl mx-auto mb-8">
          <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white uppercase leading-[0.9] drop-shadow-2xl">
            Ink That <span className="text-crimson-gradient">Commands</span> <br className="hidden sm:inline" />
            <span className="text-gold-gradient font-cinzel italic tracking-normal">Respect</span> & Legends.
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed pt-2">
            Founded by master tattooist <span className="text-white font-semibold underline decoration-rose-500/60 decoration-2">Shane Vance</span>. 
            Home to award-winning resident artists specializing in Large-Scale Japanese Irezumi, Surgical Fine Line, Hyper-Realism, and Bold Neo-Traditional.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-14">
          <button
            onClick={() => {
              playClickSound();
              onOpenBooking();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-base uppercase tracking-wider shadow-2xl shadow-rose-700/50 hover:shadow-rose-600/80 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Calendar className="w-5 h-5 text-rose-200 group-hover:rotate-6 transition-transform" />
            <span>Book Consultation</span>
            <ArrowRight className="w-4 h-4 text-rose-200 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              onScrollTo('estimator');
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-semibold text-base transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/60"
          >
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Pain & Cost Estimator</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex flex-col items-center">
            <div className="font-bebas text-3xl sm:text-4xl text-rose-400 tracking-wider">18,500+</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tattoos Completed</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex flex-col items-center">
            <div className="font-bebas text-3xl sm:text-4xl text-amber-400 tracking-wider">4.98 ★</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">1,420+ Verified Reviews</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex flex-col items-center">
            <div className="font-bebas text-3xl sm:text-4xl text-cyan-400 tracking-wider">100% Sterile</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Autoclave & Medical Disposables</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex flex-col items-center">
            <div className="font-bebas text-3xl sm:text-4xl text-emerald-400 tracking-wider">18+ Years</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Master Artistry Since 2008</div>
          </div>
        </div>
      </div>
    </section>
  );
};
