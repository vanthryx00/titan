import React, { useState } from 'react';
import { ShoppingBag, Star, Plus, Minus, Trash2, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

export const MerchStore = ({ products = [], cart = [], onAddToCart, onUpdateCartQty, onRemoveFromCart, onClearCart, isCartOpen, onCloseCart }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const categories = ['All', 'Aftercare', 'Apparel', 'Gift Card'];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    playClickSound();
    playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setCheckoutSuccess(true);
    setTimeout(() => {
      onClearCart();
      setCheckoutSuccess(false);
      onCloseCart();
    }, 2500);
  };

  return (
    <section id="merch" className="py-20 bg-[#08080d] relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio Merch & Care</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase mb-4">
            Shane's <span className="text-gold-gradient">Pro Shop</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Medical-grade botanical aftercare formulations, heavyweight limited-edition studio apparel, and gift cards.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClickSound();
                setActiveCategory(cat);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-600 text-white shadow-lg border border-amber-500'
                  : 'bg-zinc-900/80 text-slate-400 hover:text-slate-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="group bg-[#111119] border border-zinc-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {prod.badge && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-amber-950/90 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/50">
                    {prod.badge}
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-400 text-xs font-semibold flex items-center gap-1 border border-white/10">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{prod.rating}</span>
                  <span className="text-zinc-500 text-[10px]">({prod.reviews})</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-amber-400 font-mono uppercase mb-1">{prod.category}</div>
                  <h3 className="font-bebas text-2xl text-white tracking-wide group-hover:text-amber-400 transition mb-2">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <div className="font-bebas text-2xl text-white font-bold">
                    ${prod.price.toFixed(2)}
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      onAddToCart(prod);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-950"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-out Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-fade-in flex justify-end">
          <div className="relative w-full max-w-md bg-[#11111a] border-l border-zinc-800 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bebas text-2xl text-white tracking-wide">
                    Your Shopping Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                  </h3>
                </div>
                <button
                  onClick={onCloseCart}
                  className="p-1.5 rounded-full bg-zinc-900 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
                  <p className="text-sm">Your shopping bag is empty.</p>
                  <p className="text-xs text-zinc-500 mt-1">Add organic balms, studio hoodies, or gift cards.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.name}</div>
                        <div className="text-xs text-amber-400 font-bebas text-base">${item.price.toFixed(2)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => onUpdateCartQty(item.id, -1)}
                            className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono text-white">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateCartQty(item.id, 1)}
                            className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-zinc-600 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white font-mono">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Studio Pickup / Express Shipping:</span>
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                    <span>Total Amount:</span>
                    <span className="font-bebas text-2xl text-amber-400">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {checkoutSuccess ? (
                  <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Payment Processed! Order Confirmed.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-amber-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                  >
                    <span>Proceed to Simulated Express Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
