import React, { useState } from 'react';
import { 
  Calendar, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  ArrowLeft, 
  Printer, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Plus, 
  PenTool,
  Upload,
  Eye,
  Trash2
} from 'lucide-react';
import { printPayStub } from '../utils/pdfExport';
import { DigitalWaiverModal } from '../components/DigitalWaiverModal';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

export const EmployeePortal = ({ 
  currentUser, 
  appointments = [], 
  payStubs = [], 
  flashDesigns = [], 
  onAddFlash, 
  onToggleFlashClaimed,
  onNavigateToPublic, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [signedWaivers, setSignedWaivers] = useState([
    { id: 'WVR-901', fullName: 'Marcus Vance', artist: currentUser?.name, signedAt: '2026-09-24', status: 'Verified Active' },
    { id: 'WVR-902', fullName: 'Sophia Chen', artist: currentUser?.name, signedAt: '2026-09-22', status: 'Verified Active' }
  ]);
  const [isAddFlashOpen, setIsAddFlashOpen] = useState(false);
  const [newFlash, setNewFlash] = useState({
    title: '',
    category: 'Fine Line Botanical',
    price: 280,
    deposit: 75,
    size: '5" x 3"',
    estTime: '2.5 hrs',
    placement: 'Forearm / Ribs',
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
    description: 'Custom original flash design ready to ink.'
  });

  const artistId = currentUser?.id || 'elena';
  const myAppointments = appointments.filter(a => a.artistId === artistId || !a.artistId);
  const myPayStubs = payStubs.filter(s => s.artistId === artistId);
  const myFlash = flashDesigns.filter(f => f.artistId === artistId);

  const totalEarnedYTD = myPayStubs.reduce((sum, s) => sum + s.netPayout, 0);

  const handlePrintStub = (stub) => {
    playClickSound();
    printPayStub(stub);
  };

  const handleAddFlashSubmit = (e) => {
    e.preventDefault();
    playClickSound();
    playSuccessChime();

    const created = {
      id: 'flash-' + Date.now(),
      ...newFlash,
      artistId: artistId,
      artistName: currentUser?.name || 'Resident Artist',
      claimed: false
    };

    onAddFlash(created);
    setIsAddFlashOpen(false);
    setNewFlash({
      title: '',
      category: 'Fine Line Botanical',
      price: 280,
      deposit: 75,
      size: '5" x 3"',
      estTime: '2.5 hrs',
      placement: 'Forearm / Ribs',
      image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
      description: 'Custom original flash design ready to ink.'
    });
  };

  const handleWaiverSigned = (doc) => {
    setSignedWaivers([doc, ...signedWaivers]);
  };

  return (
    <div className="min-h-screen bg-[#07070b] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0c0c14]/95 backdrop-blur-xl border-b border-rose-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              playClickSound();
              onNavigateToPublic();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-semibold border border-zinc-700 cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Studio View</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bebas text-xl text-white tracking-wide leading-none">
                Artist Station & Workstation
              </div>
              <div className="text-[10px] text-rose-400 font-mono">
                {currentUser?.name || 'Elena Ramos'} • {currentUser?.title || 'Resident Artist'}
              </div>
            </div>
          </div>
        </div>

        {/* Action & Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playClickSound();
              setIsWaiverModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Client Consent Pad</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onLogout();
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[#0e0e17] border-b border-zinc-800 px-4 sm:px-8 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
          {[
            { id: 'schedule', label: 'My Inking Schedule & Bookings', icon: Calendar },
            { id: 'paystubs', label: 'My Earnings & Pay Stubs', icon: FileText },
            { id: 'flash', label: 'My Flash Art Drop', icon: Sparkles },
            { id: 'waivers', label: 'Client Consent Waivers', icon: ShieldCheck }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(item.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tab 1: Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-zinc-800 p-6 rounded-2xl shadow-xl">
              <div>
                <h3 className="font-bebas text-3xl text-white tracking-wide">
                  Upcoming Appointments for {currentUser?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Review client reference blueprints, anatomical placements, and deposit clearances.
                </p>
              </div>
              <div className="text-xs bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-700">
                <span className="text-slate-400">Active Bookings: </span>
                <strong className="text-rose-400 font-bold">{myAppointments.length} Sessions</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-mono">{appt.id}</span>
                      <h4 className="font-bebas text-2xl text-white tracking-wide">{appt.clientName}</h4>
                      <div className="text-xs text-rose-400 font-semibold">{appt.service}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold uppercase">
                      {appt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-zinc-500">Date & Time:</span>
                      <div className="font-semibold text-white">{appt.date} at {appt.time}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Placement:</span>
                      <div className="font-semibold text-amber-300">{appt.placement}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Phone:</span>
                      <div className="font-mono text-slate-300">{appt.clientPhone}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Deposit Paid:</span>
                      <div className="font-mono font-bold text-emerald-400">${appt.depositPaid}</div>
                    </div>
                  </div>

                  {appt.notes && (
                    <div className="text-xs text-slate-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                      <strong>Client Notes:</strong> {appt.notes}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      playClickSound();
                      setIsWaiverModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                  >
                    <PenTool className="w-3.5 h-3.5 text-rose-400" />
                    <span>Open Chair Consent Waiver</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Pay Stubs & Earnings */}
        {activeTab === 'paystubs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-zinc-800 p-6 rounded-2xl shadow-xl">
              <div>
                <h3 className="font-bebas text-3xl text-white tracking-wide">
                  My Earnings Statements & Pay Stubs
                </h3>
                <p className="text-xs text-slate-400">
                  Itemized commission records, needle deductions, tip pass-throughs, and 1099 accounting.
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase font-mono">My Total Inked YTD</div>
                <div className="font-bebas text-3xl text-emerald-400 font-bold">
                  ${totalEarnedYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {myPayStubs.map((stub) => (
                <div
                  key={stub.id}
                  className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-rose-400 font-bold text-sm">{stub.id}</span>
                      <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold">
                        {stub.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      Pay Period: <strong>{stub.payPeriodStart}</strong> to <strong>{stub.payPeriodEnd}</strong> (Disbursed {stub.paymentDate})
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Gross: ${stub.grossTattooRevenue} • Split: {Math.round(stub.commissionRate * 100)}% (${stub.artistTattooShare}) • Tips: +${stub.totalTips} • Deductions: -${stub.totalDeductions}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono">Net Paid</div>
                      <div className="font-bebas text-3xl text-emerald-400 font-bold">
                        ${stub.netPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePrintStub(stub)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-zinc-700 cursor-pointer transition shadow"
                    >
                      <Printer className="w-4 h-4 text-rose-400" />
                      <span>Print PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Flash Art Drop Manager */}
        {activeTab === 'flash' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-zinc-800 p-6 rounded-2xl shadow-xl">
              <div>
                <h3 className="font-bebas text-3xl text-white tracking-wide">
                  My Flash Drop Artwork Manager
                </h3>
                <p className="text-xs text-slate-400">
                  Upload new ready-to-ink designs, set deposit rates, and toggle claimed status.
                </p>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setIsAddFlashOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-950 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Flash Design</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myFlash.map((flash) => (
                <div
                  key={flash.id}
                  className="bg-[#111119] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
                >
                  <div className="relative aspect-square bg-black">
                    <img src={flash.image} alt={flash.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-zinc-900/90 text-rose-300 text-[10px] font-bold">
                      {flash.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bebas text-2xl text-white">{flash.title}</h4>
                      <span className="font-bebas text-2xl text-amber-400 font-bold">${flash.price}</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{flash.description}</p>

                    <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                      <button
                        onClick={() => {
                          playClickSound();
                          onToggleFlashClaimed(flash.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                          flash.claimed
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        }`}
                      >
                        {flash.claimed ? 'Claimed / Inked' : 'Mark Inked / Claim'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Flash Modal */}
            {isAddFlashOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                <div className="relative w-full max-w-lg bg-[#11111a] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h3 className="font-bebas text-2xl text-white">Upload New Original Flash</h3>
                    <button onClick={() => setIsAddFlashOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>

                  <form onSubmit={handleAddFlashSubmit} className="space-y-3">
                    <div>
                      <label className="font-bold text-slate-300 uppercase block mb-1">Design Title</label>
                      <input
                        type="text"
                        required
                        value={newFlash.title}
                        onChange={(e) => setNewFlash({ ...newFlash, title: e.target.value })}
                        placeholder="E.g. Lunar Serpent & Chrysanthemum"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-300 uppercase block mb-1">Total Price ($)</label>
                        <input
                          type="number"
                          required
                          value={newFlash.price}
                          onChange={(e) => setNewFlash({ ...newFlash, price: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-300 uppercase block mb-1">Hold Deposit ($)</label>
                        <input
                          type="number"
                          required
                          value={newFlash.deposit}
                          onChange={(e) => setNewFlash({ ...newFlash, deposit: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 uppercase block mb-1">Artwork Image URL</label>
                      <input
                        type="text"
                        required
                        value={newFlash.image}
                        onChange={(e) => setNewFlash({ ...newFlash, image: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 uppercase block mb-1">Description</label>
                      <textarea
                        rows="2"
                        value={newFlash.description}
                        onChange={(e) => setNewFlash({ ...newFlash, description: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddFlashOpen(false)}
                        className="px-4 py-2 bg-zinc-800 text-slate-300 rounded-xl font-bold uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl uppercase shadow-lg"
                      >
                        Publish Flash Drop
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Signed Waivers */}
        {activeTab === 'waivers' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-zinc-800 p-6 rounded-2xl shadow-xl">
              <div>
                <h3 className="font-bebas text-3xl text-white tracking-wide">
                  Chair Digital Consent & Health Waivers
                </h3>
                <p className="text-xs text-slate-400">
                  Legally executed digital signatures and medical screening records.
                </p>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setIsWaiverModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>Launch Signature Pad for Walk-In</span>
              </button>
            </div>

            <div className="space-y-3">
              {signedWaivers.map((wvr) => (
                <div
                  key={wvr.id}
                  className="bg-[#111119] border border-zinc-800 rounded-xl p-4 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white text-sm">{wvr.fullName}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Ref: {wvr.id} • Signed: {wvr.signedAt} • Artist: {wvr.artist}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-semibold font-mono">
                    ✓ {wvr.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Digital Consent Waiver Modal */}
      <DigitalWaiverModal
        isOpen={isWaiverModalOpen}
        onClose={() => setIsWaiverModalOpen(false)}
        artistName={currentUser?.name || "Shane Vance"}
        onWaiverSigned={handleWaiverSigned}
      />
    </div>
  );
};
