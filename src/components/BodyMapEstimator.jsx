import React, { useState } from 'react';
import { 
  Activity, 
  DollarSign, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight, 
  HelpCircle,
  Flame,
  Layers
} from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

const BODY_ZONES = [
  {
    id: 'ribs',
    name: 'Ribcage & Sternum',
    view: 'front',
    painScore: 9,
    painLabel: 'Intense / Stinging & Bone Vibration',
    painColor: '#e11d48',
    healingTime: '14 - 21 Days',
    sensitivityNotes: 'Thin skin over rib bones. Breathing rhythm techniques advised. Very rewarding.',
    multiplier: 1.25,
    coords: { x: '50%', y: '40%' }
  },
  {
    id: 'forearm-outer',
    name: 'Outer Forearm',
    view: 'front',
    painScore: 3,
    painLabel: 'Mild / Easy Scratching',
    painColor: '#10b981',
    healingTime: '10 - 14 Days',
    sensitivityNotes: 'One of the least painful placements. Great for first-time collectors and high detail.',
    multiplier: 1.0,
    coords: { x: '24%', y: '48%' }
  },
  {
    id: 'bicep-inner',
    name: 'Inner Bicep',
    view: 'front',
    painScore: 7,
    painLabel: 'Moderate to High / Pinching Heat',
    painColor: '#f59e0b',
    healingTime: '12 - 16 Days',
    sensitivityNotes: 'Soft sensitive skin near armpit nerve clusters. Avoid tight sleeves while healing.',
    multiplier: 1.15,
    coords: { x: '30%', y: '38%' }
  },
  {
    id: 'collarbone',
    name: 'Collarbone / Upper Chest',
    view: 'front',
    painScore: 7.5,
    painLabel: 'Sharp Bone Resonance',
    painColor: '#f97316',
    healingTime: '12 - 16 Days',
    sensitivityNotes: 'High vibration on clavicle bone. Beautiful flow for script and botanical garlands.',
    multiplier: 1.1,
    coords: { x: '50%', y: '28%' }
  },
  {
    id: 'thigh-outer',
    name: 'Outer Thigh',
    view: 'front',
    painScore: 4,
    painLabel: 'Low to Moderate Pressure',
    painColor: '#34d399',
    healingTime: '14 - 18 Days',
    sensitivityNotes: 'Thick muscle cushion. Perfect real estate for large-scale neo-traditional art.',
    multiplier: 1.05,
    coords: { x: '38%', y: '62%' }
  },
  {
    id: 'neck-throat',
    name: 'Neck & Throat',
    view: 'front',
    painScore: 9.5,
    painLabel: 'Extreme / Stinging Sensitivity',
    painColor: '#be123c',
    healingTime: '14 - 20 Days',
    sensitivityNotes: 'High nerve concentration. Constant head movement requires disciplined aftercare.',
    multiplier: 1.35,
    coords: { x: '50%', y: '20%' }
  },
  {
    id: 'spine',
    name: 'Spine & Middle Back',
    view: 'back',
    painScore: 8.5,
    painLabel: 'Deep Bone Vibration',
    painColor: '#ea580c',
    healingTime: '14 - 21 Days',
    sensitivityNotes: 'Nerve centers along vertebrae create intense radiating sensations. Stunning aesthetic.',
    multiplier: 1.25,
    coords: { x: '50%', y: '36%' }
  },
  {
    id: 'shoulder-blade',
    name: 'Shoulder Blade / Scapula',
    view: 'back',
    painScore: 5.5,
    painLabel: 'Moderate Dull Ache',
    painColor: '#fbbf24',
    healingTime: '12 - 16 Days',
    sensitivityNotes: 'Tolerable over muscle, sharp over bone edges. Ideal for Japanese mask motifs.',
    multiplier: 1.05,
    coords: { x: '35%', y: '30%' }
  },
  {
    id: 'calf',
    name: 'Calf & Shin',
    view: 'back',
    painScore: 6,
    painLabel: 'Moderate Muscle Ache / Shin Vibration',
    painColor: '#fb923c',
    healingTime: '14 - 18 Days',
    sensitivityNotes: 'Calf muscle is easy; front shin bone is significantly sharper.',
    multiplier: 1.05,
    coords: { x: '37%', y: '78%' }
  },
  {
    id: 'hand-fingers',
    name: 'Hands & Knuckles',
    view: 'front',
    painScore: 9,
    painLabel: 'Sharp Stinging & Quick Swelling',
    painColor: '#e11d48',
    healingTime: '14 - 24 Days',
    sensitivityNotes: 'High movement and friction area. Touch-ups may be required after initial heal.',
    multiplier: 1.3,
    coords: { x: '18%', y: '58%' }
  }
];

export const BodyMapEstimator = ({ onBookWithEstimate }) => {
  const [selectedView, setSelectedView] = useState('front');
  const [selectedZone, setSelectedZone] = useState(BODY_ZONES[0]);
  const [sizeIndex, setSizeIndex] = useState(2); // 0=Tiny, 1=Small, 2=Medium, 3=Large, 4=Sleeve, 5=Full Back
  const [complexity, setComplexity] = useState('detailed'); // 'minimal', 'detailed', 'hyper'
  const [artistTier, setArtistTier] = useState('resident'); // 'resident' or 'master'

  const sizeOptions = [
    { label: 'Tiny Flash (1"- 2")', baseHrs: 1.0, basePrice: 150, sizeDesc: 'Wrist, Ankle or Behind Ear' },
    { label: 'Small Piece (3"- 4")', baseHrs: 2.0, basePrice: 280, sizeDesc: 'Forearm, Collarbone or Calf' },
    { label: 'Medium Art (5"- 7")', baseHrs: 3.5, basePrice: 480, sizeDesc: 'Bicep, Thigh, or Upper Chest' },
    { label: 'Large Piece (8"- 10")', baseHrs: 5.5, basePrice: 850, sizeDesc: 'Half Sleeve, Ribs, or Shoulder' },
    { label: 'Full Sleeve / Leg (Multi-Session)', baseHrs: 18.0, basePrice: 2600, sizeDesc: 'Complete Sleeve (3-4 Sessions)' },
    { label: 'Full Backpiece Masterpiece', baseHrs: 30.0, basePrice: 4800, sizeDesc: 'Neck to Glutes Master Japanese' }
  ];

  const complexityMultipliers = {
    minimal: { name: 'Single Needle / Simple Linework', mult: 0.85 },
    detailed: { name: 'Shaded Black & Grey / Neo-Trad', mult: 1.0 },
    hyper: { name: 'Hyper-Realism / Full Saturation Color', mult: 1.35 }
  };

  const artistRates = {
    resident: { name: 'Resident Artist ($165 - $180/hr)', mult: 1.0 },
    master: { name: 'Shane Vance - Master Tier ($220/hr)', mult: 1.3 }
  };

  const currentSize = sizeOptions[sizeIndex];
  const calculatedHours = (currentSize.baseHrs * complexityMultipliers[complexity].mult).toFixed(1);
  const rawPrice = currentSize.basePrice * 
    selectedZone.multiplier * 
    complexityMultipliers[complexity].mult * 
    artistRates[artistTier].mult;

  const lowEstimate = Math.round(rawPrice * 0.9);
  const highEstimate = Math.round(rawPrice * 1.15);
  const recommendedDeposit = Math.max(75, Math.round(lowEstimate * 0.25 / 25) * 25);

  const handleZoneSelect = (zone) => {
    playClickSound();
    setSelectedZone(zone);
  };

  const handleBookCTA = () => {
    playClickSound();
    onBookWithEstimate({
      placement: selectedZone.name,
      size: currentSize.label,
      styleComplexity: complexityMultipliers[complexity].name,
      artistTier: artistRates[artistTier].name,
      estimatedPriceRange: `$${lowEstimate} - $${highEstimate}`,
      depositAmount: recommendedDeposit,
      estimatedHours: calculatedHours
    });
  };

  return (
    <section id="estimator" className="py-20 bg-[#08080d] relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Studio Calculator</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase mb-4">
            Tattoo <span className="text-gold-gradient">Pain & Cost</span> Estimator
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Click on anatomical zones to see medical pain ratings, healing timelines, and generate instant transparent price estimates.
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Body Map */}
          <div className="lg:col-span-5 bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative flex flex-col items-center">
            {/* View Switcher Toggle */}
            <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-700 mb-6">
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedView('front');
                }}
                className={`px-5 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                  selectedView === 'front'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Front Anatomy
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedView('back');
                }}
                className={`px-5 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                  selectedView === 'back'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Back Anatomy
              </button>
            </div>

            {/* Silhouette Figure with Interactive Hotspots */}
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[1/2] bg-zinc-950/80 rounded-2xl border border-zinc-800/80 p-4 flex items-center justify-center overflow-hidden">
              {/* SVG Stylized Human Figure */}
              <svg viewBox="0 0 200 400" className="w-full h-full text-zinc-700/60 fill-current select-none drop-shadow">
                {selectedView === 'front' ? (
                  // Front Human Silhouette
                  <g>
                    {/* Head & Neck */}
                    <circle cx="100" cy="45" r="24" fill="#222230" stroke="#333348" strokeWidth="2" />
                    <rect x="92" y="66" width="16" height="20" rx="3" fill="#222230" />
                    
                    {/* Torso & Shoulders */}
                    <path d="M 60 90 Q 100 80 140 90 L 132 180 Q 100 185 68 180 Z" fill="#222230" stroke="#333348" strokeWidth="2" />
                    
                    {/* Arms */}
                    <path d="M 58 90 L 40 160 L 32 230 L 22 230 L 30 155 L 48 90 Z" fill="#222230" />
                    <path d="M 142 90 L 160 160 L 168 230 L 178 230 L 170 155 L 152 90 Z" fill="#222230" />

                    {/* Hips & Legs */}
                    <path d="M 68 180 L 132 180 L 126 270 L 120 380 L 102 380 L 100 240 L 98 380 L 80 380 L 74 270 Z" fill="#222230" stroke="#333348" strokeWidth="2" />
                  </g>
                ) : (
                  // Back Human Silhouette
                  <g>
                    {/* Head & Back Neck */}
                    <circle cx="100" cy="45" r="24" fill="#222230" stroke="#333348" strokeWidth="2" />
                    <rect x="92" y="66" width="16" height="20" rx="3" fill="#222230" />
                    
                    {/* Back Torso */}
                    <path d="M 60 90 Q 100 85 140 90 L 132 180 Q 100 185 68 180 Z" fill="#222230" stroke="#333348" strokeWidth="2" />
                    
                    {/* Spine line */}
                    <line x1="100" y1="85" x2="100" y2="180" stroke="#444458" strokeDasharray="3,3" strokeWidth="2" />

                    {/* Arms */}
                    <path d="M 58 90 L 40 160 L 32 230 L 22 230 L 30 155 L 48 90 Z" fill="#222230" />
                    <path d="M 142 90 L 160 160 L 168 230 L 178 230 L 170 155 L 152 90 Z" fill="#222230" />

                    {/* Glutes & Back Legs */}
                    <path d="M 68 180 L 132 180 L 126 270 L 120 380 L 102 380 L 100 240 L 98 380 L 80 380 L 74 270 Z" fill="#222230" stroke="#333348" strokeWidth="2" />
                  </g>
                )}
              </svg>

              {/* Clickable Zone Pinpoints on SVG */}
              {BODY_ZONES.filter(z => z.view === selectedView).map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneSelect(zone)}
                    style={{ left: zone.coords.x, top: zone.coords.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 ring-4 ring-rose-500/50 scale-125 z-20'
                        : 'bg-zinc-800 hover:bg-rose-500/80 border border-zinc-600 hover:scale-110 z-10'
                    }`}
                    title={zone.name}
                  >
                    <span className="block w-2.5 h-2.5 rounded-full bg-white shadow-xs"></span>
                  </button>
                );
              })}
            </div>

            {/* Quick zone picker list */}
            <div className="w-full mt-4 flex flex-wrap gap-1.5 justify-center">
              {BODY_ZONES.filter(z => z.view === selectedView).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleZoneSelect(zone)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    selectedZone.id === zone.id
                      ? 'bg-rose-950 border border-rose-500 text-rose-300'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {zone.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Dynamic Pain & Cost Calculations */}
          <div className="lg:col-span-7 space-y-6">
            {/* Selected Zone Pain Card */}
            <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4 mb-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Selected Placement</div>
                  <h3 className="font-bebas text-3xl text-white tracking-wide">{selectedZone.name}</h3>
                </div>
                
                {/* Pain Score Pill */}
                <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-700 self-start sm:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Pain Scale</div>
                    <div className="font-bebas text-2xl" style={{ color: selectedZone.painColor }}>
                      {selectedZone.painScore} / 10
                    </div>
                  </div>
                  <div className="w-12 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${selectedZone.painScore * 10}%`, 
                        backgroundColor: selectedZone.painColor 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Sensation description & healing time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 text-xs">
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                  <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> Sensation Profile
                  </div>
                  <div className="text-slate-200 font-medium">{selectedZone.painLabel}</div>
                </div>

                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                  <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Healing Timeline
                  </div>
                  <div className="text-slate-200 font-medium">{selectedZone.healingTime}</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic pt-2">
                💡 <span className="font-medium text-slate-300">{selectedZone.sensitivityNotes}</span>
              </p>
            </div>

            {/* Customization Sliders & Selectors */}
            <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
              {/* Size Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Tattoo Dimensions / Scale
                  </label>
                  <span className="text-xs font-semibold text-rose-400 font-mono">
                    {currentSize.label}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={sizeIndex}
                  onChange={(e) => {
                    playClickSound();
                    setSizeIndex(parseInt(e.target.value, 10));
                  }}
                  className="w-full accent-rose-600 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>Tiny (2")</span>
                  <span>Small</span>
                  <span>Medium</span>
                  <span>Large</span>
                  <span>Sleeve</span>
                  <span>Full Back</span>
                </div>
              </div>

              {/* Style & Complexity */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Artistic Complexity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(complexityMultipliers).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        playClickSound();
                        setComplexity(key);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                        complexity === key
                          ? 'bg-rose-950/60 border-rose-500 text-white shadow'
                          : 'bg-zinc-900/60 border-zinc-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-[11px] leading-snug">{value.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Artist Tier */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Artist Selection Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      setArtistTier('resident');
                    }}
                    className={`p-3 rounded-xl text-left border transition text-xs cursor-pointer ${
                      artistTier === 'resident'
                        ? 'bg-rose-950/60 border-rose-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-rose-300">Resident Artist</div>
                    <div className="text-[11px] text-slate-400">Elena, Jax, or Maya ($165-$180/hr)</div>
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      setArtistTier('master');
                    }}
                    className={`p-3 rounded-xl text-left border transition text-xs cursor-pointer ${
                      artistTier === 'master'
                        ? 'bg-amber-950/60 border-amber-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-amber-300">Shane Vance (Master)</div>
                    <div className="text-[11px] text-slate-400">18+ Yrs Exp / Large Scale ($220/hr)</div>
                  </button>
                </div>
              </div>

              {/* Result & Quote Box */}
              <div className="bg-gradient-to-br from-zinc-900 to-[#191924] p-5 rounded-2xl border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Estimated Project Cost
                  </div>
                  <div className="font-bebas text-4xl sm:text-5xl text-amber-400 tracking-wider">
                    ${lowEstimate} - ${highEstimate}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Est. Time: <strong className="text-slate-200">{calculatedHours} Hours</strong></span>
                    <span>•</span>
                    <span>Hold Deposit: <strong className="text-emerald-400">${recommendedDeposit}</strong></span>
                  </div>
                </div>

                <button
                  onClick={handleBookCTA}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <span>Book With This Spec</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
