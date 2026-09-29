import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Image, 
  Type, 
  DollarSign, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Smartphone, 
  Monitor,
  Globe,
  Save,
  X
} from 'lucide-react';
import { playClickSound, playSuccessChime } from '../../utils/soundEffects';

export const PageBuilderTab = ({ customPages = [], onSavePage, onDeletePage, onNavigateToPage }) => {
  const [pages, setPages] = useState(customPages);
  const [activeEditingPage, setActiveEditingPage] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' or 'mobile'
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Blank template for new page
  const createNewPageTemplate = () => ({
    id: 'page-' + Date.now(),
    title: 'New Studio Event or Flash Promo',
    slug: 'promo-' + Math.floor(Math.random() * 900),
    metaDescription: 'Exclusive tattoo event and flash drop at Shane\'s Tattoo Shop.',
    status: 'Published',
    publishedAt: new Date().toISOString().split('T')[0],
    blocks: [
      {
        id: 'b-' + Date.now() + '-1',
        type: 'hero',
        heading: 'Friday the 13th Flash Special',
        subheading: 'Limited-edition midnight flash designs starting at $100. Walk-ins only.',
        badge: '⚡ Annual Studio Tradition',
        bgImage: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80',
        ctaText: 'Claim Your Spot',
        ctaLink: '#book'
      },
      {
        id: 'b-' + Date.now() + '-2',
        type: 'text',
        title: 'Event Rules & Priority Line Passes',
        content: `All flash pieces will be tattooed on arms and legs. First 20 collectors in line receive a free Shane's Hustle Butter aftercare kit and studio beanie.`
      },
      {
        id: 'b-' + Date.now() + '-3',
        type: 'pricing_table',
        title: 'Featured Flash Pricing Tiers',
        tiers: [
          { name: 'Small Micro-Flash (2" x 2")', specialty: 'Daggers, skulls, botanical sprigs', rate: '$100 Flat', dates: 'Walk-ins from 12pm' },
          { name: 'Medium Flash Piece (4" x 4")', specialty: 'Japanese masks, neo-trad panthers', rate: '$180 Flat', dates: 'Walk-ins from 12pm' }
        ]
      }
    ]
  });

  const handleStartCreate = () => {
    playClickSound();
    const newP = createNewPageTemplate();
    setActiveEditingPage(newP);
    setIsEditorOpen(true);
  };

  const handleStartEdit = (page) => {
    playClickSound();
    setActiveEditingPage(JSON.parse(JSON.stringify(page)));
    setIsEditorOpen(true);
  };

  const handleSaveCurrentPage = () => {
    if (!activeEditingPage.title || !activeEditingPage.slug) {
      alert('Please provide a Page Title and URL Slug');
      return;
    }

    playClickSound();
    playSuccessChime();

    onSavePage(activeEditingPage);
    setIsEditorOpen(false);
  };

  const handleAddBlock = (type) => {
    playClickSound();
    const newBlockId = 'b-' + Date.now();
    let newBlock = null;

    if (type === 'hero') {
      newBlock = {
        id: newBlockId,
        type: 'hero',
        heading: 'New Headline Banner',
        subheading: 'Engaging subtitle describing this tattoo event or offering.',
        badge: '✨ Exclusive Studio Feature',
        bgImage: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=80',
        ctaText: 'Book Now',
        ctaLink: '#book'
      };
    } else if (type === 'text') {
      newBlock = {
        id: newBlockId,
        type: 'text',
        title: 'Story & Service Details',
        content: 'Write detailed information about the event, artist background, sterile procedures, or special promotions.'
      };
    } else if (type === 'pricing_table') {
      newBlock = {
        id: newBlockId,
        type: 'pricing_table',
        title: 'Custom Rate & Service Menu',
        tiers: [
          { name: 'Custom Session', specialty: 'Full Color or Black & Grey', rate: '$180/hr', dates: 'Tue - Sat' },
          { name: 'Flash Special', specialty: 'Pre-drawn original art', rate: '$250 Flat', dates: 'Walk-ins' }
        ]
      };
    }

    if (newBlock) {
      setActiveEditingPage({
        ...activeEditingPage,
        blocks: [...activeEditingPage.blocks, newBlock]
      });
    }
  };

  const handleRemoveBlock = (blockId) => {
    playClickSound();
    setActiveEditingPage({
      ...activeEditingPage,
      blocks: activeEditingPage.blocks.filter(b => b.id !== blockId)
    });
  };

  const handleMoveBlock = (index, direction) => {
    playClickSound();
    const blocks = [...activeEditingPage.blocks];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    const temp = blocks[index];
    blocks[index] = blocks[targetIdx];
    blocks[targetIdx] = temp;

    setActiveEditingPage({ ...activeEditingPage, blocks });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-cyan-900/40 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            No-Limits CMS Web Page Builder
          </div>
          <h2 className="font-bebas text-3xl text-white tracking-wide">
            Build Additional Web Pages & Events
          </h2>
          <p className="text-xs text-slate-400">
            Create limitless landing pages, guest spot showcases, piercing lounges, and midnight flash marathons.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-rose-600 hover:from-cyan-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-950 cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Brand-New Web Page</span>
        </button>
      </div>

      {/* Existing Pages List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {customPages.map((page) => (
          <div
            key={page.id}
            className="bg-[#111119] border border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  /{page.slug}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  {page.status}
                </span>
              </div>

              <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">
                {page.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {page.metaDescription}
              </p>

              <div className="text-[11px] text-zinc-500 font-mono mb-4">
                {page.blocks?.length || 0} Content Blocks • Published {page.publishedAt}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  playClickSound();
                  onNavigateToPage(page.slug);
                }}
                className="flex-1 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Live</span>
              </button>

              <button
                onClick={() => handleStartEdit(page)}
                className="p-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 cursor-pointer"
                title="Edit in Visual Page Builder"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {customPages.length > 1 && (
                <button
                  onClick={() => {
                    playClickSound();
                    if (confirm(`Delete page "${page.title}"?`)) {
                      onDeletePage(page.id);
                    }
                  }}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 cursor-pointer"
                  title="Delete Page"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Page Builder Full Editor Modal */}
      {isEditorOpen && activeEditingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-hidden">
          <div className="relative w-full max-w-6xl bg-[#0e0e16] border border-cyan-900/50 rounded-2xl shadow-2xl flex flex-col h-[95vh] overflow-hidden">
            {/* Editor Top Bar */}
            <div className="p-4 bg-[#08080d] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bebas text-2xl text-white tracking-wide leading-none">
                    Visual CMS Page Studio
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Routing: <strong className="text-cyan-400">/{activeEditingPage.slug}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Device Switcher */}
                <div className="hidden sm:flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800 text-xs">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 rounded flex items-center gap-1 ${previewDevice === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 rounded flex items-center gap-1 ${previewDevice === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

                <button
                  onClick={handleSaveCurrentPage}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish & Save Page</span>
                </button>

                <button onClick={() => setIsEditorOpen(false)} className="p-1.5 rounded-full bg-zinc-900 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main 2-Column Split: Left Controls / Right Live Preview */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* Left Column: Form & Blocks Editor */}
              <div className="lg:col-span-5 p-6 border-r border-zinc-800 overflow-y-auto space-y-6 bg-[#11111a]">
                {/* Meta Settings */}
                <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
                  <div className="font-bold text-slate-300 uppercase">Page Meta & URL Routing</div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Page Title</label>
                    <input
                      type="text"
                      value={activeEditingPage.title}
                      onChange={(e) => setActiveEditingPage({ ...activeEditingPage, title: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">URL Path Slug</label>
                    <input
                      type="text"
                      value={activeEditingPage.slug}
                      onChange={(e) => setActiveEditingPage({ ...activeEditingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '') })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-cyan-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">SEO Description</label>
                    <textarea
                      rows="2"
                      value={activeEditingPage.metaDescription}
                      onChange={(e) => setActiveEditingPage({ ...activeEditingPage, metaDescription: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white resize-none"
                    />
                  </div>
                </div>

                {/* Blocks Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase">Content Blocks ({activeEditingPage.blocks.length})</span>
                    
                    {/* Add Block Dropdown */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleAddBlock('hero')}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] font-semibold rounded-lg border border-zinc-700 flex items-center gap-1 cursor-pointer"
                      >
                        + Hero Banner
                      </button>
                      <button
                        onClick={() => handleAddBlock('text')}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-rose-300 text-[11px] font-semibold rounded-lg border border-zinc-700 flex items-center gap-1 cursor-pointer"
                      >
                        + Rich Text
                      </button>
                      <button
                        onClick={() => handleAddBlock('pricing_table')}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[11px] font-semibold rounded-lg border border-zinc-700 flex items-center gap-1 cursor-pointer"
                      >
                        + Pricing Menu
                      </button>
                    </div>
                  </div>

                  {/* Block List Items */}
                  <div className="space-y-3">
                    {activeEditingPage.blocks.map((block, idx) => (
                      <div
                        key={block.id}
                        className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <span className="font-bold text-cyan-400 uppercase">
                            Block #{idx + 1}: {block.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveBlock(idx, -1)}
                              className="p-1 rounded bg-zinc-900 text-slate-400 hover:text-white disabled:opacity-30"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={idx === activeEditingPage.blocks.length - 1}
                              onClick={() => handleMoveBlock(idx, 1)}
                              className="p-1 rounded bg-zinc-900 text-slate-400 hover:text-white disabled:opacity-30"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveBlock(block.id)}
                              className="p-1 rounded bg-zinc-900 text-rose-400 hover:bg-rose-950"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Block Specific Form Fields */}
                        {block.type === 'hero' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-zinc-500">Headline</label>
                              <input
                                type="text"
                                value={block.heading}
                                onChange={(e) => {
                                  const updated = [...activeEditingPage.blocks];
                                  updated[idx].heading = e.target.value;
                                  setActiveEditingPage({ ...activeEditingPage, blocks: updated });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-500">Subheading</label>
                              <input
                                type="text"
                                value={block.subheading}
                                onChange={(e) => {
                                  const updated = [...activeEditingPage.blocks];
                                  updated[idx].subheading = e.target.value;
                                  setActiveEditingPage({ ...activeEditingPage, blocks: updated });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-500">Background Image URL</label>
                              <input
                                type="text"
                                value={block.bgImage}
                                onChange={(e) => {
                                  const updated = [...activeEditingPage.blocks];
                                  updated[idx].bgImage = e.target.value;
                                  setActiveEditingPage({ ...activeEditingPage, blocks: updated });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'text' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-zinc-500">Title</label>
                              <input
                                type="text"
                                value={block.title}
                                onChange={(e) => {
                                  const updated = [...activeEditingPage.blocks];
                                  updated[idx].title = e.target.value;
                                  setActiveEditingPage({ ...activeEditingPage, blocks: updated });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-500">Content / Story Markdown</label>
                              <textarea
                                rows="3"
                                value={block.content}
                                onChange={(e) => {
                                  const updated = [...activeEditingPage.blocks];
                                  updated[idx].content = e.target.value;
                                  setActiveEditingPage({ ...activeEditingPage, blocks: updated });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white resize-none"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'pricing_table' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-zinc-500">Table Title</label>
                              <input
                                type="text"
                                value={block.title}
                                onChange={(e) => {
                                  const updated = [...activeEditingPage.blocks];
                                  updated[idx].title = e.target.value;
                                  setActiveEditingPage({ ...activeEditingPage, blocks: updated });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Real-time Device Preview */}
              <div className="lg:col-span-7 bg-[#07070a] p-6 overflow-y-auto flex items-center justify-center">
                <div className={`transition-all duration-300 w-full ${previewDevice === 'mobile' ? 'max-w-sm border-8 border-zinc-800 rounded-3xl p-2 bg-[#09090f] shadow-2xl' : 'max-w-2xl'}`}>
                  {/* Live Rendered Custom Page Preview */}
                  <div className="bg-[#09090f] rounded-xl overflow-hidden border border-zinc-800 space-y-6 pb-8">
                    {activeEditingPage.blocks.map((block) => (
                      <div key={block.id}>
                        {block.type === 'hero' && (
                          <div className="relative py-12 px-6 text-center overflow-hidden bg-black">
                            {block.bgImage && (
                              <img src={block.bgImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                            )}
                            <div className="relative z-10 space-y-3">
                              {block.badge && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-600/50 text-[10px] font-bold">
                                  {block.badge}
                                </span>
                              )}
                              <h1 className="font-bebas text-3xl sm:text-4xl text-white uppercase">{block.heading}</h1>
                              <p className="text-xs text-slate-300 max-w-md mx-auto">{block.subheading}</p>
                              {block.ctaText && (
                                <button className="px-5 py-2 rounded-lg bg-rose-600 text-white font-bold text-xs uppercase shadow">
                                  {block.ctaText}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {block.type === 'text' && (
                          <div className="px-6 space-y-2">
                            <h3 className="font-bebas text-2xl text-white">{block.title}</h3>
                            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{block.content}</p>
                          </div>
                        )}

                        {block.type === 'pricing_table' && (
                          <div className="px-6 space-y-3">
                            <h3 className="font-bebas text-2xl text-amber-400">{block.title}</h3>
                            <div className="space-y-2">
                              {block.tiers?.map((tier, tidx) => (
                                <div key={tidx} className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                                  <div>
                                    <div className="font-bold text-white">{tier.name}</div>
                                    <div className="text-[11px] text-slate-400">{tier.specialty}</div>
                                  </div>
                                  <div className="text-right font-mono text-amber-400 font-bold">{tier.rate}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
