import React, { useState } from 'react';
import { Sparkles, Eye, CheckCircle2, Clock, DollarSign, X, ArrowRight, Flame } from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export const FlashGallery = ({ flashDesigns = [], onClaimFlash }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalFlash, setActiveModalFlash] = useState(null);

  const categories = ['All', 'Japanese Irezumi', 'Fine Line Botanical', 'Neo-Traditional', 'Sacred Geometry', 'Dark Realism'];

  const filteredFlash = selectedCategory === 'All' 
    ? flashDesigns 
    : flashDesigns.filter(f => f.category === selectedCategory);

  const handleOpenModal = (flash) => {
    playClickSound();
    setActiveModalFlash(flash);
  };

  const handleClaim = (flash) => {
    playClickSound();
    setActiveModalFlash(null);
    onClaimFlash(flash);
  };

  return (
    <section id="gallery" className="py-20 bg-[#09090f] relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Ready-to-Ink Original Art</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase mb-4">
            Exclusive <span className="text-crimson-gradient">Flash Gallery</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Original, one-of-a-kind flash sheets designed by Shane Vance and our resident artists. 
            Once a design is claimed and tattooed, it is retired forever.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClickSound();
                setSelectedCategory(cat);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 border border-rose-500'
                  : 'bg-zinc-900/80 text-slate-400 hover:text-slate-200 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Flash Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredFlash.map((flash) => (
            <div
              key={flash.id}
              className="group relative bg-[#12121c] border border-zinc-800/80 hover:border-rose-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/40 flex flex-col"
            >
              {/* Image Container with overlay */}
              <div className="relative aspect-[4/3] sm:aspect-square bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => handleOpenModal(flash)}>
                <img
                  src={flash.image}
                  alt={flash.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#12121c] via-transparent to-transparent opacity-80"></div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-rose-300">
                  {flash.category}
                </div>

                {/* Claimed status */}
                {flash.claimed ? (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-zinc-900/90 text-zinc-400 border border-zinc-700 text-[11px] font-bold uppercase">
                    CLAIMED / INKED
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold">
                    AVAILABLE
                  </div>
                )}

                {/* Quick preview hover button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                  <span className="px-4 py-2 rounded-xl bg-white/90 text-zinc-900 font-bold text-xs flex items-center gap-1.5 shadow-xl">
                    <Eye className="w-4 h-4" /> View Full Piece
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bebas text-2xl text-white tracking-wide group-hover:text-rose-400 transition">
                      {flash.title}
                    </h3>
                    <div className="text-right">
                      <span className="font-bebas text-2xl text-amber-400 font-bold tracking-wider">
                        ${flash.price}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {flash.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{flash.estTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>By {flash.artistName}</span>
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <button
                  disabled={flash.claimed}
                  onClick={() => handleClaim(flash)}
                  className={`w-full py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    flash.claimed
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-950'
                  }`}
                >
                  {flash.claimed ? (
                    'Design Inked / Taken'
                  ) : (
                    <>
                      <span>Claim Flash (${flash.deposit} Deposit)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Flash Detail Modal */}
      {activeModalFlash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#11111a] border border-rose-900/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Close */}
            <button
              onClick={() => setActiveModalFlash(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 text-slate-300 hover:text-white border border-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4">
              <img
                src={activeModalFlash.image}
                alt={activeModalFlash.title}
                className="max-h-[60vh] md:max-h-[80vh] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="inline-block px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs font-semibold mb-2">
                  {activeModalFlash.category}
                </div>
                <h3 className="font-bebas text-3xl text-white tracking-wide mb-2">
                  {activeModalFlash.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {activeModalFlash.description}
                </p>

                <div className="space-y-2 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 mb-6 text-xs text-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Master Artist:</span>
                    <span className="font-semibold text-rose-400">{activeModalFlash.artistName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensions:</span>
                    <span>{activeModalFlash.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Placement:</span>
                    <span>{activeModalFlash.placement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Duration:</span>
                    <span>{activeModalFlash.estTime}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-700">
                    <span className="text-slate-400 font-semibold">Total Price:</span>
                    <span className="font-bebas text-xl text-amber-400 font-bold">${activeModalFlash.price}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Deposit Required Today:</span>
                    <span className="font-semibold">${activeModalFlash.deposit}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  disabled={activeModalFlash.claimed}
                  onClick={() => handleClaim(activeModalFlash)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Claim This Flash Artwork
                </button>
                <div className="text-[11px] text-center text-slate-500">
                  Deposit is securely credited towards your session fee.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
