import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Printer, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Filter, 
  Users, 
  X,
  CreditCard,
  Building,
  ArrowDownRight
} from 'lucide-react';
import { printPayStub } from '../../utils/pdfExport';
import { playClickSound, playSuccessChime } from '../../utils/soundEffects';

export const PayStubsTab = ({ payStubs = [], onAddPayStub, onDeletePayStub, artists = [] }) => {
  const [selectedArtistFilter, setSelectedArtistFilter] = useState('all');
  const [activePreviewStub, setActivePreviewStub] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Pay Stub Form State
  const [formData, setFormData] = useState({
    artistId: 'elena',
    role: 'Resident Artist',
    payPeriodStart: '2026-09-08',
    payPeriodEnd: '2026-09-22',
    paymentDate: '2026-09-26',
    grossTattooRevenue: 6200,
    commissionRate: 0.65,
    totalTips: 750,
    hoursWorked: 45,
    suppliesDisposables: 130,
    ccProcessingShare: 85,
    medicalSanitaryPouch: 45,
    payoutMethod: 'Direct Deposit (Chase ****4912)',
    status: 'Paid',
    notes: 'Bi-weekly tattoo production & client tips.'
  });

  const filteredStubs = selectedArtistFilter === 'all'
    ? payStubs
    : payStubs.filter(s => s.artistId === selectedArtistFilter);

  // Computed calculations for new stub
  const artistShare = (Number(formData.grossTattooRevenue) || 0) * (Number(formData.commissionRate) || 0.65);
  const totalDeductions = (Number(formData.suppliesDisposables) || 0) + (Number(formData.ccProcessingShare) || 0) + (Number(formData.medicalSanitaryPouch) || 0);
  const netPayout = artistShare + (Number(formData.totalTips) || 0) - totalDeductions;

  const handleOpenCreate = () => {
    playClickSound();
    setIsCreateModalOpen(true);
  };

  const handleArtistSelectChange = (artistId) => {
    const artist = artists.find(a => a.id === artistId);
    setFormData({
      ...formData,
      artistId: artistId,
      role: artist?.role || 'Resident Artist',
      commissionRate: artistId === 'shane' ? 1.0 : 0.65,
      payoutMethod: artistId === 'shane' ? 'Owner Draw / Wire (Business Checking ****1099)' : `Direct Deposit (${artist?.name || 'Artist'})`
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    playClickSound();
    playSuccessChime();

    const artistObj = artists.find(a => a.id === formData.artistId) || { name: 'Resident Artist' };

    const newStub = {
      id: `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      artistId: formData.artistId,
      artistName: artistObj.name,
      role: formData.role,
      payPeriodStart: formData.payPeriodStart,
      payPeriodEnd: formData.payPeriodEnd,
      paymentDate: formData.paymentDate,
      status: formData.status,
      grossTattooRevenue: Number(formData.grossTattooRevenue),
      commissionRate: Number(formData.commissionRate),
      artistTattooShare: artistShare,
      totalTips: Number(formData.totalTips),
      hoursWorked: Number(formData.hoursWorked),
      boothFee: 0,
      deductions: {
        suppliesDisposables: Number(formData.suppliesDisposables),
        ccProcessingShare: Number(formData.ccProcessingShare),
        medicalSanitaryPouch: Number(formData.medicalSanitaryPouch)
      },
      totalDeductions: totalDeductions,
      taxWithholding: 0,
      netPayout: netPayout,
      payoutMethod: formData.payoutMethod,
      notes: formData.notes
    };

    onAddPayStub(newStub);
    setIsCreateModalOpen(false);
  };

  const handlePrint = (stub) => {
    playClickSound();
    printPayStub(stub);
  };

  const totalDisbursedYTD = payStubs.reduce((sum, s) => sum + s.netPayout, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Artist Payroll & Pay Stub Coordination
          </div>
          <h2 className="font-bebas text-3xl text-white tracking-wide">
            Studio Earnings & Pay Stubs
          </h2>
          <p className="text-xs text-slate-400">
            Coordinate weekly and bi-weekly payouts, commission splits, supply deductions, and 1099 disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-zinc-500 uppercase font-mono">Total YTD Payouts</div>
            <div className="font-bebas text-2xl text-emerald-400 font-bold">
              ${totalDisbursedYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-950 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Pay Stub</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-[#0c0c14] p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-bold text-slate-300 uppercase">Filter by Artist:</span>
          <select
            value={selectedArtistFilter}
            onChange={(e) => {
              playClickSound();
              setSelectedArtistFilter(e.target.value);
            }}
            className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Studio Artists</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong>{filteredStubs.length}</strong> payroll statements
        </div>
      </div>

      {/* Pay Stubs Table */}
      <div className="bg-[#111119] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b0b12] text-slate-400 border-b border-zinc-800 font-mono text-[11px] uppercase">
                <th className="p-4">Reference & Date</th>
                <th className="p-4">Artist Name</th>
                <th className="p-4">Pay Period</th>
                <th className="p-4 text-right">Gross Inked</th>
                <th className="p-4 text-right">Artist Split</th>
                <th className="p-4 text-right">Tips</th>
                <th className="p-4 text-right">Deductions</th>
                <th className="p-4 text-right font-bold text-white">Net Issued</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredStubs.map((stub) => (
                <tr key={stub.id} className="hover:bg-zinc-900/50 transition">
                  <td className="p-4">
                    <div className="font-mono text-rose-400 font-semibold">{stub.id}</div>
                    <div className="text-[10px] text-zinc-500">{stub.paymentDate}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{stub.artistName}</div>
                    <div className="text-[10px] text-zinc-400">{stub.role}</div>
                  </td>
                  <td className="p-4 font-mono text-slate-300">
                    {stub.payPeriodStart} → {stub.payPeriodEnd}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-300">
                    ${stub.grossTattooRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-mono text-amber-300">
                    ${stub.artistTattooShare.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({Math.round(stub.commissionRate * 100)}%)
                  </td>
                  <td className="p-4 text-right font-mono text-emerald-400">
                    +${stub.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-mono text-rose-400">
                    -${stub.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-bebas text-lg text-emerald-400 font-bold">
                    ${stub.netPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      {stub.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          playClickSound();
                          setActivePreviewStub(stub);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="View Detailed Stub"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePrint(stub)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/50 transition cursor-pointer"
                        title="Print Official Pay Stub"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {stub.id !== 'PAY-2026-0924-04' && (
                        <button
                          onClick={() => {
                            playClickSound();
                            if (confirm(`Delete pay stub ${stub.id}?`)) {
                              onDeletePayStub(stub.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Stub Preview Modal */}
      {activePreviewStub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#11111a] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="text-[10px] text-zinc-400 font-mono uppercase">Official Earnings Statement</div>
                <h3 className="font-bebas text-3xl text-white tracking-wide">
                  {activePreviewStub.artistName}
                </h3>
                <div className="text-xs text-rose-400 font-mono">Reference ID: {activePreviewStub.id}</div>
              </div>
              <button
                onClick={() => setActivePreviewStub(null)}
                className="p-1.5 rounded-full bg-zinc-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-3 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 text-xs">
              <div>
                <div className="text-zinc-500">Pay Period:</div>
                <div className="font-semibold text-white">{activePreviewStub.payPeriodStart} to {activePreviewStub.payPeriodEnd}</div>
              </div>
              <div>
                <div className="text-zinc-500">Disbursement Date:</div>
                <div className="font-semibold text-white">{activePreviewStub.paymentDate}</div>
              </div>
              <div>
                <div className="text-zinc-500">Classification:</div>
                <div className="font-semibold text-slate-300">1099 Independent Contractor</div>
              </div>
              <div>
                <div className="text-zinc-500">Payment Channel:</div>
                <div className="font-semibold text-emerald-400">{activePreviewStub.payoutMethod}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-300 uppercase">Itemized Revenue & Deductions</div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Tattoo Sales Generated:</span>
                  <span className="text-white">${activePreviewStub.grossTattooRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>Artist Commission Split ({Math.round(activePreviewStub.commissionRate * 100)}%):</span>
                  <span>+${activePreviewStub.artistTattooShare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Direct Client Tips (100% Passed):</span>
                  <span>+${activePreviewStub.totalTips.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-400 pt-2 border-t border-zinc-800">
                  <span>Needles, Inks & Disposables Deduction:</span>
                  <span>-${activePreviewStub.deductions?.suppliesDisposables?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Credit Card Processing Fee Share:</span>
                  <span>-${activePreviewStub.deductions?.ccProcessingShare?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Medical Sanitation Pouch Fee:</span>
                  <span>-${activePreviewStub.deductions?.medicalSanitaryPouch?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald-400 pt-3 border-t-2 border-zinc-700">
                  <span className="font-sans uppercase">NET PAYOUT ISSUED:</span>
                  <span>${activePreviewStub.netPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handlePrint(activePreviewStub)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF Pay Stub</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Pay Stub Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#11111a] border border-rose-900/50 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                <h3 className="font-bebas text-2xl text-white tracking-wide">
                  Generate New Artist Pay Stub
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-full bg-zinc-900 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Select Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Artist</label>
                  <select
                    value={formData.artistId}
                    onChange={(e) => handleArtistSelectChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  >
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                    ))}
                    <option value="guest-marco">Marco Silva (Guest Artist)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={formData.payoutMethod}
                    onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Pay Period Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Period Start</label>
                  <input
                    type="date"
                    value={formData.payPeriodStart}
                    onChange={(e) => setFormData({ ...formData, payPeriodStart: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Period End</label>
                  <input
                    type="date"
                    value={formData.payPeriodEnd}
                    onChange={(e) => setFormData({ ...formData, payPeriodEnd: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Earnings Split Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Gross Inked ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.grossTattooRevenue}
                    onChange={(e) => setFormData({ ...formData, grossTattooRevenue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Commission Split</label>
                  <select
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                  >
                    <option value="0.60">60% Artist / 40% Studio</option>
                    <option value="0.65">65% Artist / 35% Studio</option>
                    <option value="0.70">70% Artist / 30% Studio</option>
                    <option value="0.75">75% Artist / 25% Studio</option>
                    <option value="1.00">100% (Owner Draw)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Client Tips ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalTips}
                    onChange={(e) => setFormData({ ...formData, totalTips: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Supplies / Needles ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.suppliesDisposables}
                    onChange={(e) => setFormData({ ...formData, suppliesDisposables: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">CC Fee Share ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ccProcessingShare}
                    onChange={(e) => setFormData({ ...formData, ccProcessingShare: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Sanitation / PPE ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.medicalSanitaryPouch}
                    onChange={(e) => setFormData({ ...formData, medicalSanitaryPouch: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Live Calculated Net Banner */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-rose-500/50 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Calculated Net Payout:</div>
                  <div className="text-xs text-slate-400 font-mono">
                    ${artistShare.toFixed(2)} (Artist Split) + ${formData.totalTips} (Tips) - ${totalDeductions.toFixed(2)} (Deductions)
                  </div>
                </div>
                <div className="font-bebas text-3xl text-emerald-400 font-bold">
                  ${netPayout.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-xl font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl uppercase shadow-lg cursor-pointer"
                >
                  Approve & Issue Pay Stub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
