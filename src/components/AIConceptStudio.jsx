import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, Send, CheckCircle2, Download, Copy, Flame } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

const SAMPLE_CONCEPTS = [
  {
    id: 'ai-01',
    prompt: 'Hyper-detailed Japanese Ryu Dragon entwined with crimson chrysanthemums and dark windbars for full bicep',
    style: 'Japanese Irezumi',
    image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    tags: ['Dragon', 'Chrysanthemum', 'Bicep', 'Black & Red']
  },
  {
    id: 'ai-02',
    prompt: 'Micro-fine line celestial moth with astronomical moon phases and stippling constellations',
    style: 'Fine Line Botanical',
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
    tags: ['Moth', 'Astronomy', 'Spine', 'Single Needle']
  },
  {
    id: 'ai-03',
    prompt: 'Dark realism crowned raven with piercing gaze perched on gothic antique dagger',
    style: 'Dark Realism',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    tags: ['Raven', 'Dagger', 'Forearm', 'Charcoal Shading']
  },
  {
    id: 'ai-04',
    prompt: 'Complex 3D Metatron sacred geometric sleeve with dotwork mandalas and architectural flow',
    style: 'Sacred Geometry',
    image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
    tags: ['Mandala', 'Cube of Metatron', 'Dotwork', 'Sleeve']
  }
];

export const AIConceptStudio = ({ onBookWithConcept }) => {
  const [prompt, setPrompt] = useState('Cyberpunk neon samurai mask with blooming cherry blossom petals and glowing katana');
  const [selectedStyle, setSelectedStyle] = useState('Neo-Traditional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState(SAMPLE_CONCEPTS[0]);
  const [customGeneratedList, setCustomGeneratedList] = useState(SAMPLE_CONCEPTS);

  const styles = ['Japanese Irezumi', 'Dark Realism', 'Fine Line Botanical', 'Neo-Traditional', 'Sacred Geometry', 'Biomechanical'];

  const handleGenerate = () => {
    playClickSound();
    setIsGenerating(true);

    setTimeout(() => {
      // Pick a random or matched concept
      const randomConcept = SAMPLE_CONCEPTS[Math.floor(Math.random() * SAMPLE_CONCEPTS.length)];
      const newResult = {
        id: 'ai-' + Date.now(),
        prompt: prompt,
        style: selectedStyle,
        image: randomConcept.image,
        tags: [selectedStyle, 'Custom AI Prompt', 'Ready to Ink']
      };

      setCurrentResult(newResult);
      setCustomGeneratedList([newResult, ...customGeneratedList.slice(0, 3)]);
      setIsGenerating(false);
      playSuccessChime();
    }, 1200);
  };

  const handleSelectPreset = (presetText, style) => {
    playClickSound();
    setPrompt(presetText);
    if (style) setSelectedStyle(style);
  };

  const handleSendToBooking = () => {
    playClickSound();
    onBookWithConcept({
      conceptPrompt: currentResult.prompt,
      conceptStyle: currentResult.style,
      conceptImage: currentResult.image
    });
  };

  return (
    <section id="ai-studio" className="py-20 bg-[#07070b] relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI Concept Visualizer</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase mb-4">
            Custom <span className="text-cyan-400">Concept Studio</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Can't find the exact flash you want? Describe your dream tattoo idea, visualize the composition, and submit it directly to our artists for a custom stencil consultation.
          </p>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls */}
          <div className="lg:col-span-6 bg-[#111119] border border-cyan-900/40 rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Describe Your Tattoo Vision
              </label>
              <textarea
                rows="4"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Dark realism skull intertwined with antique pocket watch and roses on forearm..."
                className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl p-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition resize-none font-sans"
              />
            </div>

            {/* Style Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Preferred Aesthetic Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      playClickSound();
                      setSelectedStyle(style);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border cursor-pointer ${
                      selectedStyle === style
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Inspiration Preset Ideas */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Inspiration Ideas
              </div>
              <div className="space-y-1.5">
                {[
                  { text: 'Baroque skull surrounded by black heirloom roses and golden bees', style: 'Dark Realism' },
                  { text: 'Cyberpunk Oni demon mask with neon glowing circuits and kanji', style: 'Neo-Traditional' },
                  { text: 'Sacred Fibonacci spiral with fine dotwork galaxy stars', style: 'Sacred Geometry' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(item.text, item.style)}
                    className="w-full text-left p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 text-xs text-slate-300 flex items-center justify-between cursor-pointer transition"
                  >
                    <span className="truncate pr-2">"{item.text}"</span>
                    <span className="text-[10px] text-cyan-400 shrink-0 uppercase font-mono">{item.style}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-rose-600 hover:from-cyan-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-cyan-950/80 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Tattoo Stencil...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Concept Stencil</span>
                </>
              )}
            </button>
          </div>

          {/* Right Preview Output */}
          <div className="lg:col-span-6 bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Rendered Tattoo Blueprint
                  </span>
                </div>
                <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-md border border-cyan-700/50 font-mono">
                  {currentResult.style}
                </span>
              </div>

              {/* Concept Image Showcase */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-4 group">
                <img
                  src={currentResult.image}
                  alt="AI Concept"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-3 left-3 right-3 p-3 bg-zinc-900/90 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="text-[11px] text-cyan-300 font-semibold mb-0.5 uppercase tracking-wide">Concept Blueprint:</div>
                  <p className="text-xs text-white line-clamp-2">"{currentResult.prompt}"</p>
                </div>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {currentResult.tags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] bg-zinc-900 text-slate-300 px-2.5 py-1 rounded-md border border-zinc-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Booking CTA */}
            <div className="space-y-2">
              <button
                onClick={handleSendToBooking}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <Send className="w-4 h-4" />
                <span>Submit Concept to Shane / Artist for Booking</span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Our resident artists will refine this concept into a bespoke, anatomically contoured tattoo stencil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
