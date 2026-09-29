import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Lock, Mail, X, CheckCircle2, ArrowRight, Sparkles, Key } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

export const AuthModal = ({ isOpen, onClose, initialRole = 'owner', onLoginSuccess }) => {
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickDemoLogin = (userType, artistId = 'shane') => {
    playClickSound();
    playSuccessChime();

    if (userType === 'owner') {
      onLoginSuccess({
        id: 'shane',
        name: 'Shane Vance',
        email: 'shane@shanestattoo.com',
        role: 'owner',
        title: 'Founder & Master Artist'
      });
    } else {
      const names = {
        elena: { name: 'Elena Ramos', role: 'employee', title: 'Resident Artist - Fine Line' },
        jax: { name: 'Jax Mercer', role: 'employee', title: 'Resident Artist - Neo-Traditional' },
        maya: { name: 'Maya Lin', role: 'employee', title: 'Resident Artist - Sacred Geometry' }
      };
      const user = names[artistId] || names.elena;
      onLoginSuccess({
        id: artistId,
        name: user.name,
        email: `${artistId}@shanestattoo.com`,
        role: 'employee',
        title: user.title
      });
    }
    onClose();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    playClickSound();

    if (role === 'owner') {
      onLoginSuccess({
        id: 'shane',
        name: 'Shane Vance',
        email: email || 'shane@shanestattoo.com',
        role: 'owner',
        title: 'Founder & Master Artist'
      });
    } else {
      onLoginSuccess({
        id: 'elena',
        name: 'Elena Ramos',
        email: email || 'elena@shanestattoo.com',
        role: 'employee',
        title: 'Resident Artist'
      });
    }
    playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#11111a] border border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#0a0a10] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {role === 'owner' ? (
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            ) : (
              <UserCheck className="w-5 h-5 text-rose-400" />
            )}
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              {role === 'owner' ? "Shane's Owner Command Portal" : 'Resident Artist Workstation'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-zinc-900 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switch Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1">
          <button
            onClick={() => {
              playClickSound();
              setRole('owner');
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase transition rounded-lg cursor-pointer ${
              role === 'owner'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shane (Owner / Taxes / CMS)
          </button>
          <button
            onClick={() => {
              playClickSound();
              setRole('employee');
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase transition rounded-lg cursor-pointer ${
              role === 'employee'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Artist Sign In
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 1-Click Instant Demo Access */}
          <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Evaluation Access
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">No password required</span>
            </div>

            {role === 'owner' ? (
              <button
                onClick={() => handleQuickDemoLogin('owner')}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Instant Login as Shane (Owner)</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickDemoLogin('employee', 'elena')}
                  className="py-2 px-1 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 font-semibold text-[11px] rounded-lg text-center cursor-pointer"
                >
                  Elena Ramos
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('employee', 'jax')}
                  className="py-2 px-1 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 font-semibold text-[11px] rounded-lg text-center cursor-pointer"
                >
                  Jax Mercer
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('employee', 'maya')}
                  className="py-2 px-1 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 font-semibold text-[11px] rounded-lg text-center cursor-pointer"
                >
                  Maya Lin
                </button>
              </div>
            )}
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">OR SIGN IN WITH CREDENTIALS</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 uppercase block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder={role === 'owner' ? 'shane@shanestattoo.com' : 'artist@shanestattoo.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 uppercase block mb-1">Security PIN / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer border border-zinc-700"
            >
              <Key className="w-4 h-4" />
              <span>Enter Secured Station</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
