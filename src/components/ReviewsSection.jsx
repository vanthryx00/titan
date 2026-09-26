import React, { useState } from 'react';
import { Star, ShieldCheck, ThumbsUp, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

export const ReviewsSection = ({ reviews = [] }) => {
  const [reviewList, setReviewList] = useState(reviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    author: '',
    artist: 'Shane Vance',
    title: '',
    text: '',
    rating: 5
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.author || !newReview.text) return;

    playClickSound();
    playSuccessChime();

    const created = {
      id: 'rev-' + Date.now(),
      author: newReview.author,
      rating: newReview.rating,
      date: 'Just now',
      artist: newReview.artist,
      title: newReview.title || 'Incredible Tattoo Experience',
      text: newReview.text,
      image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=400&q=80',
      verified: true
    };

    setReviewList([created, ...reviewList]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsFormOpen(false);
      setNewReview({ author: '', artist: 'Shane Vance', title: '', text: '', rating: 5 });
    }, 2000);
  };

  return (
    <section className="py-20 bg-[#09090f] relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>1,420+ Verified 5-Star Reviews</span>
            </div>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase">
              Collector <span className="text-gold-gradient">Testimonials</span>
            </h2>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setIsFormOpen(!isFormOpen);
            }}
            className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-400" />
            <span>Leave Collector Review</span>
          </button>
        </div>

        {/* Review Form Drawer */}
        {isFormOpen && (
          <div className="bg-[#111119] border border-amber-500/40 rounded-2xl p-6 mb-10 shadow-2xl animate-fade-in">
            <h3 className="font-bebas text-2xl text-white tracking-wide mb-4">
              Write Your Tattoo Experience Review
            </h3>

            {submitted ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Thank you! Your verified review has been published.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Marcus Vance"
                    value={newReview.author}
                    onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Tattoo Artist</label>
                  <select
                    value={newReview.artist}
                    onChange={(e) => setNewReview({ ...newReview, artist: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                  >
                    <option value="Shane Vance">Shane Vance (Owner & Master)</option>
                    <option value='Elena "Viper" Ramos'>Elena "Viper" Ramos</option>
                    <option value='Jax "Kross" Mercer'>Jax "Kross" Mercer</option>
                    <option value="Maya Lin">Maya Lin</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Headline</label>
                  <input
                    type="text"
                    placeholder="E.g., Masterpiece Japanese Ryu Sleeve!"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Detailed Review</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Tell future collectors about the artist's technique, studio cleanliness, and healing outcome..."
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase shadow-lg"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewList.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#111119] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-500">{rev.date}</span>
                </div>

                <h4 className="font-bebas text-2xl text-white tracking-wide mb-2">
                  {rev.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed mb-4 italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{rev.author}</span>
                    {rev.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified Collector" />
                    )}
                  </div>
                  <div className="text-[10px] text-rose-400 font-mono">Inked by {rev.artist}</div>
                </div>

                <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700">
                  <img src={rev.image} alt="Tattoo result" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
