import React from 'react';
import { Sparkles, Star, Award, Calendar, ArrowRight, ShieldCheck, Clock, Camera } from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export const ArtistRoster = ({ artists = [], onSelectArtistForBooking }) => {
  const handleBookArtist = (artist) => {
    playClickSound();
    onSelectArtistForBooking(artist);
  };

  return (
    <section id="artists" className="py-20 bg-[#09090f] relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Master Craftsmen & Visionaries</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase mb-4">
            Resident <span className="text-crimson-gradient">Tattoo Artists</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Every artist at Shane's Studio is a master in their specialized style with thousands of hours under the needle and a dedication to hospital-grade sterility.
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist) => {
            const isOwner = artist.id === 'shane';
            return (
              <div
                key={artist.id}
                className={`group relative bg-[#111119] rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isOwner
                    ? 'border-amber-500/50 hover:border-amber-400 shadow-xl shadow-amber-950/20'
                    : 'border-zinc-800 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-950/20'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-zinc-950 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111119] via-[#111119]/30 to-transparent"></div>

                  {/* Badges */}
                  {isOwner && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-amber-950/90 border border-amber-500/60 text-amber-300 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-lg">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Studio Founder
                    </div>
                  )}

                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-400 text-xs font-semibold flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{artist.rating}</span>
                    <span className="text-zinc-500 text-[10px]">({artist.reviewCount})</span>
                  </div>

                  {/* Hourly Rate banner bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-slate-400 font-medium">Rate:</span>
                    <span className="font-bebas text-lg text-white font-bold">${artist.hourlyRate} <span className="text-[10px] font-mono text-slate-400">/hr</span></span>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-wide group-hover:text-rose-400 transition mb-0.5">
                      {artist.name}
                    </h3>
                    <div className="text-xs text-rose-400 font-medium mb-2">{artist.role} • {artist.experience}</div>

                    <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                      {artist.bio}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {artist.specialties.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-700/80 text-slate-300 font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Awards */}
                    {artist.awards && artist.awards.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded-lg border border-amber-500/20 mb-2">
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{artist.awards[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => handleBookArtist(artist)}
                      className={`w-full py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isOwner
                          ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book with {artist.name.split(' ')[0]}</span>
                    </button>
                    <div className="text-center flex items-center justify-center gap-1 text-[11px] text-zinc-400 font-mono">
                      <Camera className="w-3 h-3 text-rose-400" />
                      <span>{artist.instagram}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
