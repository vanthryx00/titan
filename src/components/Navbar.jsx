import React, { useState } from 'react';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  Menu, 
  X, 
  Sparkles, 
  Layers, 
  DollarSign, 
  ChevronDown 
} from 'lucide-react';
import { playClickSound, toggleTattooMachineSound } from '../utils/soundEffects';

export const Navbar = ({ 
  currentUser, 
  onOpenAuth, 
  onLogout, 
  onNavigate, 
  activeView, 
  cartCount, 
  onOpenCart, 
  onOpenBooking,
  customPages = [] 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);

  const handleAudioToggle = () => {
    playClickSound();
    const active = toggleTattooMachineSound();
    setIsAudioActive(active);
  };

  const handleNavClick = (view, targetId = null) => {
    playClickSound();
    setMobileMenuOpen(false);
    setPagesDropdownOpen(false);
    onNavigate(view, targetId);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#08080d]/90 backdrop-blur-xl border-b border-rose-950/40">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-950 via-zinc-950 to-amber-950/60 border-b border-rose-900/30 text-xs py-1.5 px-4 text-center text-slate-300 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-rose-400 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Open Today 12:00 PM – 9:00 PM</span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-400 font-semibold">2 Walk-in Chairs Open Now</span>
        </div>
        
        <div className="mx-auto sm:mx-0 flex items-center gap-3">
          <span className="text-slate-300 font-medium tracking-wide">
            🏆 Rated #1 Custom Studio in the Metro 2026
          </span>
          <span className="hidden md:inline text-rose-400/80">• Sterile Hospital Grade</span>
        </div>

        {/* Quick Role Switcher Banner */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-rose-900/50 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-700/50 flex items-center gap-1 font-semibold">
                <UserCheck className="w-3 h-3 text-rose-400" />
                {currentUser.name} ({currentUser.role === 'owner' ? 'Owner' : 'Artist'})
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  onLogout();
                }}
                className="text-xs text-slate-400 hover:text-white underline ml-1 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuth('owner');
                }}
                className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Owner Portal
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuth('employee');
                }}
                className="text-[11px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 transition flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3 h-3 text-rose-400" />
                Artist Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('landing')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-900 via-rose-950 to-zinc-950 border border-rose-500/40 group-hover:border-rose-400 transition shadow-lg shadow-rose-950/60">
            <Flame className="w-7 h-7 text-rose-500 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -inset-0.5 bg-rose-500/20 rounded-xl blur-xs group-hover:opacity-100 opacity-50 transition"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bebas text-2xl sm:text-3xl tracking-wider text-white uppercase group-hover:text-rose-400 transition">
                Shane's
              </span>
              <span className="font-cinzel text-xs font-bold text-amber-400 tracking-widest uppercase px-1.5 py-0.5 bg-amber-950/40 border border-amber-500/30 rounded">
                Tattoo Shop
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-widest font-mono uppercase">
              Living Art • Custom Inks
            </p>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          <button
            onClick={() => handleNavClick('landing', 'gallery')}
            className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            Flash Gallery
          </button>
          <button
            onClick={() => handleNavClick('landing', 'artists')}
            className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            Artists
          </button>
          <button
            onClick={() => handleNavClick('landing', 'estimator')}
            className="px-3 py-2 text-sm font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg transition flex items-center gap-1.5 cursor-pointer border border-amber-500/20"
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            Pain & Cost Estimator
          </button>
          <button
            onClick={() => handleNavClick('landing', 'ai-studio')}
            className="px-3 py-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-lg transition flex items-center gap-1.5 cursor-pointer border border-cyan-500/20"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            AI Concept Studio
          </button>
          <button
            onClick={() => handleNavClick('landing', 'aftercare')}
            className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            Healing Guide
          </button>
          <button
            onClick={() => handleNavClick('landing', 'merch')}
            className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            Shop & Merch
          </button>

          {/* Dynamic Custom Pages Dropdown */}
          {customPages && customPages.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-rose-400" />
                <span>Special Pages</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {pagesDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#11111a] border border-rose-900/50 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-2xl">
                  <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-zinc-800">
                    Created via Owner CMS
                  </div>
                  {customPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => handleNavClick('custom-page', page.slug)}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-rose-950/40 hover:text-rose-300 flex flex-col gap-0.5 cursor-pointer transition"
                    >
                      <span>{page.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">/{page.slug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right CTA / Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Ambient Tattoo Gun Sound Toggle */}
          <button
            onClick={handleAudioToggle}
            title={isAudioActive ? 'Mute Tattoo Gun Sound' : 'Play Tattoo Machine Sound'}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs ${
              isAudioActive
                ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-zinc-900/80 border-zinc-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-4 h-4 text-rose-400" />
                <span className="hidden xl:inline text-[11px] font-mono">Machine: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span className="hidden xl:inline text-[11px] font-mono">Audio FX</span>
              </>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => {
              playClickSound();
              onOpenCart();
            }}
            className="relative p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/60 text-slate-300 hover:text-white hover:border-zinc-500 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#08080d]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Portal Switchers */}
          {currentUser?.role === 'owner' && (
            <button
              onClick={() => handleNavClick('owner-dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold text-xs hover:bg-amber-500/30 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Owner Portal
            </button>
          )}

          {currentUser?.role === 'employee' && (
            <button
              onClick={() => handleNavClick('employee-dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 font-semibold text-xs hover:bg-rose-500/30 transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-rose-400" />
              Artist Portal
            </button>
          )}

          {/* Book Consultation Primary Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenBooking();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-lg shadow-rose-950/80 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Book Session</span>
            <span className="sm:hidden">Book</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a10] border-b border-rose-900/50 px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick('landing', 'gallery')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5 font-medium text-sm"
          >
            Flash Gallery
          </button>
          <button
            onClick={() => handleNavClick('landing', 'artists')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5 font-medium text-sm"
          >
            Artist Roster
          </button>
          <button
            onClick={() => handleNavClick('landing', 'estimator')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-amber-300 bg-amber-950/20 font-medium text-sm flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            Pain & Cost Estimator
          </button>
          <button
            onClick={() => handleNavClick('landing', 'ai-studio')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-cyan-300 bg-cyan-950/20 font-medium text-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Concept Studio
          </button>
          <button
            onClick={() => handleNavClick('landing', 'aftercare')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5 font-medium text-sm"
          >
            Healing & Aftercare Guide
          </button>
          <button
            onClick={() => handleNavClick('landing', 'merch')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5 font-medium text-sm"
          >
            Merch & Studio Shop
          </button>

          {/* Dynamic Pages */}
          {customPages.map((p) => (
            <button
              key={p.id}
              onClick={() => handleNavClick('custom-page', p.slug)}
              className="w-full text-left px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-950/40 text-xs font-mono"
            >
              ★ {p.title}
            </button>
          ))}

          <div className="pt-3 border-t border-zinc-800 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('owner');
              }}
              className="flex-1 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40 text-center"
            >
              Shane's Owner Login
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('employee');
              }}
              className="flex-1 py-2 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/40 text-center"
            >
              Artist Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
