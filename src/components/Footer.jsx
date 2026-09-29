import React from 'react';
import { Flame, ShieldCheck, MapPin, Phone, Mail, Clock, Camera, Globe, Share2, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export const Footer = ({ onOpenAuth, onNavigate }) => {
  return (
    <footer className="bg-[#050508] border-t border-rose-950/40 text-slate-400 text-xs">
      {/* Upper Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand & Mission */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bebas text-2xl text-white tracking-wider uppercase block leading-none">
                Shane's Tattoo Shop
              </span>
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono">
                Living Artistry LLC
              </span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            Founded by master tattooist Shane Vance in 2008. Dedicated to custom fine art, anatomical flow, and unmatched clinical safety.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a href="#instagram" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-slate-300 hover:text-rose-400 hover:border-rose-500 transition" title="Instagram">
              <Camera className="w-4 h-4" />
            </a>
            <a href="#portfolio" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-slate-300 hover:text-rose-400 hover:border-rose-500 transition" title="Global Network">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#social" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-slate-300 hover:text-rose-400 hover:border-rose-500 transition" title="Share">
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Location & Hours */}
        <div className="space-y-3">
          <h4 className="font-bebas text-lg text-white tracking-wider uppercase">
            Studio Location & Hours
          </h4>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>1084 Boulevard of Arts, Suite 400<br/>Design District, NY 10012</span>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div>Tue – Sat: 12:00 PM – 9:00 PM</div>
                <div>Sun: 12:00 PM – 7:00 PM</div>
                <div className="text-zinc-500">Mon: Closed for Deep Autoclave Cycle</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Studio: (555) 742-6378</span>
            </div>
          </div>
        </div>

        {/* Clinical Safety & Accreditations */}
        <div className="space-y-3">
          <h4 className="font-bebas text-lg text-white tracking-wider uppercase">
            Hospital Grade Sterility
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            We enforce strict Department of Health bloodborne pathogen protocols:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>StatIM Medical Autoclave Spore Tested Weekly</span>
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Single-Use Pre-Sterilized Needles</span>
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vegan & Heavy-Metal Free Pure Pigments</span>
            </li>
          </ul>
        </div>

        {/* Quick Portals & Staff Logins */}
        <div className="space-y-3">
          <h4 className="font-bebas text-lg text-white tracking-wider uppercase">
            Staff & Management
          </h4>
          <p className="text-xs text-slate-400">
            Administrative coordination, payroll stubs, revenue analytics, and CMS page builder.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                playClickSound();
                onOpenAuth('owner');
              }}
              className="w-full py-2 px-3 rounded-lg bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-left flex items-center justify-between cursor-pointer transition"
            >
              <span className="font-semibold text-xs">Shane's Owner Portal</span>
              <span className="text-[10px] font-mono text-zinc-500">Tax & Payroll →</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onOpenAuth('employee');
              }}
              className="w-full py-2 px-3 rounded-lg bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 text-rose-300 text-left flex items-center justify-between cursor-pointer transition"
            >
              <span className="font-semibold text-xs">Artist Workstation</span>
              <span className="text-[10px] font-mono text-zinc-500">Stubs & Schedule →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copyright & Disclaimer Bar */}
      <div className="border-t border-zinc-900 bg-black/60 py-6 px-4 text-center text-zinc-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} Shane's Tattoo Studio LLC. All Rights Reserved. State Health License #NY-TAT-84920.
          </div>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-slate-300">Privacy & Health Disclosures</a>
            <span>•</span>
            <a href="#terms" className="hover:text-slate-300">Deposit & Cancellation Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
