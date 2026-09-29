import React, { useState } from 'react';
import { Clock, UserPlus, CheckCircle2, Flame, Users, Smartphone, ShieldCheck } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

export const WalkInKiosk = () => {
  const [queue, setQueue] = useState([
    { id: 'w1', name: 'Marcus D.', artist: 'Elena Ramos', service: 'Flash Moth (Forearm)', waitMins: 15, status: 'In Station' },
    { id: 'w2', name: 'Taylor K.', artist: 'Jax Mercer', service: 'Neo-Trad Dagger', waitMins: 35, status: 'Prepping Stencil' },
    { id: 'w3', name: 'Jordan S.', artist: 'First Available', service: 'Fine Line Script', waitMins: 55, status: 'On Waitlist' }
  ]);

  const [formData, setFormData] = useState({ name: '', phone: '', service: 'Small Flash Art', artistPref: 'First Available' });
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  const handleJoinQueue = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    playClickSound();
    playSuccessChime();

    const newEntry = {
      id: 'w-' + Date.now(),
      name: formData.name,
      artist: formData.artistPref,
      service: formData.service,
      waitMins: 75,
      status: 'SMS Confirmed'
    };

    setQueue([...queue, newEntry]);
    setJoinedSuccess(true);
    setTimeout(() => {
      setJoinedSuccess(false);
      setFormData({ name: '', phone: '', service: 'Small Flash Art', artistPref: 'First Available' });
    }, 4000);
  };

  return (
    <section className="py-20 bg-[#07070b] relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Real-Time Studio Queue</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase mb-4">
            Live <span className="text-crimson-gradient">Walk-In Board</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Spontaneous ink? We keep dedicated walk-in chairs open Tuesday through Sunday. 
            Check live queue times and join the waitlist from your phone.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Live Board */}
          <div className="lg:col-span-7 bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-bebas text-2xl text-white tracking-wide">Live Studio Status</span>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2.5 py-1 rounded-full font-semibold">
                🟢 2 Chairs Inking Now
              </span>
            </div>

            {/* Queue items */}
            <div className="space-y-3">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-rose-400">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.service} • Artist: <strong className="text-slate-300">{item.artist}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono">Est. Wait</div>
                      <div className="text-xs font-mono font-bold text-amber-400">~{item.waitMins} min</div>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-md font-semibold ${
                      item.status === 'In Station'
                        ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                        : 'bg-zinc-800 text-slate-300 border border-zinc-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 text-xs text-slate-400 flex items-center justify-between">
              <span>⏱️ Average walk-in turnaround: <strong>45 mins</strong></span>
              <span className="text-rose-400 font-medium">Walk-ins cut off at 7:30 PM</span>
            </div>
          </div>

          {/* Right Join Form */}
          <div className="lg:col-span-5 bg-[#111119] border border-rose-900/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bebas text-3xl text-white tracking-wide flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-rose-500" />
              Join Today's SMS Waitlist
            </h3>
            <p className="text-xs text-slate-300">
              Enter your mobile number to hold your spot. We'll text you 15 minutes before your station is prepped and sterilized.
            </p>

            {joinedSuccess ? (
              <div className="p-6 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bebas text-2xl text-white">You're On The Board!</h4>
                <p className="text-xs text-emerald-300">
                  SMS confirmation sent. Please arrive at the studio within 15 minutes of your buzzer text.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinQueue} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Mobile Phone (For SMS Alert)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Desired Tattoo Style / Concept
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Studio Flash Art Piece">Studio Flash Art Piece</option>
                    <option value="Small Custom Script / Linework">Small Custom Script / Linework</option>
                    <option value="Cover-Up Assessment">Cover-Up Assessment</option>
                    <option value="Titanium Body Piercing">Titanium Body Piercing</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-rose-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join Live Walk-In Queue</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
