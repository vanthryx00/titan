import React, { useState } from 'react';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Printer, 
  Download, 
  ShieldCheck, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Building,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { printTaxSummary } from '../../utils/pdfExport';
import { playClickSound, playSuccessChime } from '../../utils/soundEffects';

export const RevenueTaxTab = ({ taxData }) => {
  const [selectedTaxYear, setSelectedTaxYear] = useState(2026);
  const [active1099Modal, setActive1099Modal] = useState(null);

  const { summaryTotals, quarterlyTaxes1040ES, contractor1099List } = taxData;

  const handlePrintReport = () => {
    playClickSound();
    printTaxSummary(taxData);
  };

  const handleDownloadCSV = () => {
    playClickSound();
    playSuccessChime();

    const rows = [
      ['Category', 'IRS Line Reference', 'Amount (USD)'],
      ['Gross Tattoo & Piercing Receipts', 'Line 1', summaryTotals.grossReceiptsYTD],
      ['Merchandise & Apparel Sales', 'Line 1', summaryTotals.merchandiseGrossYTD],
      ['Total Gross Revenue', 'Total Line 1', summaryTotals.totalGrossRevenue],
      ['Returns and Refunds', 'Line 2', summaryTotals.returnsAndRefunds],
      ['Cost of Goods Sold (Inks, Needles, PPE)', 'Line 4', summaryTotals.costOfGoodsSold],
      ['Contract Labor (1099-NEC Artist Payouts)', 'Line 11', summaryTotals.deductions.contractLabor1099],
      ['Studio Lease / Rent & Utilities', 'Line 20', summaryTotals.deductions.studioLeaseRent + summaryTotals.deductions.utilitiesPowerWifiWater],
      ['Machinery & Autoclave Depreciation', 'Line 13', summaryTotals.deductions.depreciationMachinesAutoclave],
      ['Advertising & Website Marketing', 'Line 8', summaryTotals.deductions.advertisingSocialMarketing],
      ['Business Insurance & Biohazard Licensing', 'Line 16', summaryTotals.deductions.businessInsuranceLiability + summaryTotals.deductions.legalLicensingBiohazardFees],
      ['Merchant Processing & Sanitation Disposables', 'Line 27', summaryTotals.deductions.merchantProcessingFees + summaryTotals.deductions.studioMaintenanceSanitation],
      ['Total Itemized Deductions', 'Line 28', summaryTotals.totalItemizedDeductions],
      ['Net Taxable Business Income', 'Line 31', summaryTotals.netTaxableBusinessIncome]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shanes_Tattoo_Studio_Tax_Report_${selectedTaxYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-amber-500/30 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-400" />
            IRS & CPA Financial Preparation Hub
          </div>
          <h2 className="font-bebas text-3xl text-white tracking-wide">
            Yearly Revenue & Tax Coordinator
          </h2>
          <p className="text-xs text-slate-400">
            {taxData.businessLegalName} • EIN: {taxData.ein} • {taxData.taxEntity}
          </p>
        </div>

        {/* Year Selector & Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedTaxYear}
            onChange={(e) => {
              playClickSound();
              setSelectedTaxYear(parseInt(e.target.value));
            }}
            className="bg-zinc-900 border border-amber-500/40 text-xs font-bold text-amber-300 rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value={2026}>Tax Year 2026 (YTD)</option>
            <option value={2025}>Tax Year 2025 (Filed)</option>
            <option value={2024}>Tax Year 2024 (Filed)</option>
          </select>

          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            title="Download CSV for Excel / QuickBooks"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-950 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export Tax Packet</span>
          </button>
        </div>
      </div>

      {/* 3 Main Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1">
            Total Gross Receipts (YTD)
          </div>
          <div className="font-bebas text-4xl text-emerald-400 font-bold">
            ${summaryTotals.totalGrossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Tattoos: ${summaryTotals.grossReceiptsYTD.toLocaleString()} • Merch: ${summaryTotals.merchandiseGrossYTD.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1">
            Total Itemized Schedule C Deductions
          </div>
          <div className="font-bebas text-4xl text-rose-400 font-bold">
            ${summaryTotals.totalItemizedDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Artist 1099s, Studio Lease, Supplies & Depreciation
          </div>
        </div>

        <div className="bg-[#111119] border border-amber-500/40 rounded-2xl p-6 shadow-xl bg-gradient-to-br from-[#12121c] to-[#1c1813]">
          <div className="text-amber-400 text-xs font-semibold uppercase mb-1">
            Net Taxable Business Profit
          </div>
          <div className="font-bebas text-4xl text-amber-300 font-bold">
            ${summaryTotals.netTaxableBusinessIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Safe Harbor Quarterly Projections Active
          </div>
        </div>
      </div>

      {/* Schedule C (Form 1040) Itemized Deductions Coordinator */}
      <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-bebas text-2xl text-white tracking-wide flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Schedule C (Form 1040) Expense Itemization Coordinator
            </h3>
            <p className="text-xs text-slate-400">
              Tax write-offs and deductions structured to IRS Publication 535 standard.
            </p>
          </div>
          <span className="text-xs bg-amber-950 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40 font-mono">
            Line 28 Total: ${summaryTotals.totalItemizedDeductions.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Item 1 */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">Line 11: Contract Labor (1099-NEC Payouts)</div>
              <div className="text-[11px] text-slate-400">Elena Ramos, Jax Mercer, Maya Lin, Guest Spots</div>
            </div>
            <div className="font-mono text-base font-bold text-rose-400">
              ${summaryTotals.deductions.contractLabor1099.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">Line 20: Studio Lease & Commercial Rent</div>
              <div className="text-[11px] text-slate-400">1084 Boulevard of Arts, Suite 400 + Utilities</div>
            </div>
            <div className="font-mono text-base font-bold text-rose-400">
              ${(summaryTotals.deductions.studioLeaseRent + summaryTotals.deductions.utilitiesPowerWifiWater).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">Line 4: Cost of Goods Sold (Inks, Needles & Disposables)</div>
              <div className="text-[11px] text-slate-400">Kwadron cartridges, Dynamic Triple Black, Saniderm</div>
            </div>
            <div className="font-mono text-base font-bold text-rose-400">
              ${summaryTotals.costOfGoodsSold.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Item 4 */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">Line 13: Machinery & Equipment Depreciation</div>
              <div className="text-[11px] text-slate-400">StatIM 2000 Autoclave, Cheyenne Sol Nova guns</div>
            </div>
            <div className="font-mono text-base font-bold text-rose-400">
              ${summaryTotals.deductions.depreciationMachinesAutoclave.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Item 5 */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">Line 8: Advertising, Website & Flash Drops</div>
              <div className="text-[11px] text-slate-400">SEO campaign, Instagram ads, hosting servers</div>
            </div>
            <div className="font-mono text-base font-bold text-rose-400">
              ${summaryTotals.deductions.advertisingSocialMarketing.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Item 6 */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">Line 16: Insurance, Biohazard Disposal & State License</div>
              <div className="text-[11px] text-slate-400">Medical waste pickup, General liability & Malpractice</div>
            </div>
            <div className="font-mono text-base font-bold text-rose-400">
              ${(summaryTotals.deductions.businessInsuranceLiability + summaryTotals.deductions.legalLicensingBiohazardFees).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Quarterly Estimated Taxes (1040-ES) & 1099-NEC Contractor Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Taxes (1040-ES) */}
        <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              Quarterly Estimated Taxes (Form 1040-ES)
            </h3>
            <span className="text-[11px] text-emerald-400 font-mono">Safe Harbor Projections</span>
          </div>

          <div className="space-y-3">
            {quarterlyTaxes1040ES.map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{q.quarter}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {q.datePaid ? `Paid: ${q.datePaid}` : 'Estimated Payment Pending'}
                  </div>
                  {q.confirmationNum && (
                    <div className="text-[10px] text-cyan-400 font-mono">{q.confirmationNum}</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white">${q.estimatedAmount.toFixed(2)}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    q.status === 'Paid in Full'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1099-NEC Contractor Summary */}
        <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              1099-NEC Contractor Summary
            </h3>
            <span className="text-[11px] text-rose-400 font-mono">W-9 Records Active</span>
          </div>

          <div className="space-y-3">
            {contractor1099List.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{c.contractorName}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">Tax ID: {c.taxId}</div>
                  <div className="text-[10px] text-emerald-400">W-9 On File: Verified</div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-mono font-bold text-amber-400">
                    ${c.compensationYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      setActive1099Modal(c);
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-[11px] font-medium border border-zinc-700 cursor-pointer transition"
                  >
                    View 1099 Form
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 1099 Form Preview Modal */}
      {active1099Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#11111a] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-bebas text-2xl text-white">Form 1099-NEC Preview (2026)</h3>
              <button onClick={() => setActive1099Modal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 font-mono">
              <div><span className="text-zinc-500">PAYER:</span> Shane's Tattoo Studio LLC (EIN: XX-XXX8492)</div>
              <div><span className="text-zinc-500">RECIPIENT:</span> {active1099Modal.contractorName} ({active1099Modal.taxId})</div>
              <div><span className="text-zinc-500">ADDRESS:</span> {active1099Modal.address}</div>
              <div className="pt-2 border-t border-zinc-800 text-amber-400 font-bold text-sm">
                BOX 1 (Nonemployee Compensation): ${active1099Modal.compensationYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                alert(`Form 1099-NEC for ${active1099Modal.contractorName} queued for e-filing to IRS.`);
                setActive1099Modal(null);
              }}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl uppercase text-xs"
            >
              Confirm & Queue E-File To IRS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
