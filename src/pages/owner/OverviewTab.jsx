import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar, 
  Package, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { playClickSound } from '../../utils/soundEffects';

export const OverviewTab = ({ taxData, payStubs = [], appointments = [], onNavigateTab }) => {
  const { summaryTotals, monthlyRevenue2026 } = taxData;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#14121a] via-[#1a141c] to-[#121219] p-6 rounded-2xl border border-amber-500/30 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Executive Financial Command
          </div>
          <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">
            Welcome Back, Master Shane
          </h2>
          <p className="text-xs text-slate-400">
            Shane's Tattoo Studio LLC • Real-Time Financials, Tax Deductions & Page Builder CMS
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              playClickSound();
              onNavigateTab('paystubs');
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Pay Stubs</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onNavigateTab('tax');
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition"
          >
            <DollarSign className="w-4 h-4" />
            <span>Tax & Schedule C</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onNavigateTab('pagebuilder');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition"
          >
            <Layers className="w-4 h-4" />
            <span>Build Web Page</span>
          </button>
        </div>
      </div>

      {/* 4 Core Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#111119] border border-zinc-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Total Gross Revenue (YTD)</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bebas text-3xl sm:text-4xl text-white tracking-wider">
            ${summaryTotals.totalGrossRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% vs 2025 Fiscal
          </div>
        </div>

        <div className="bg-[#111119] border border-zinc-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Net Taxable Business Profit</span>
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bebas text-3xl sm:text-4xl text-amber-400 tracking-wider">
            ${summaryTotals.netTaxableBusinessIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            After $347k itemized deductions
          </div>
        </div>

        <div className="bg-[#111119] border border-zinc-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Artist 1099 Disbursements</span>
            <div className="p-2 rounded-lg bg-rose-950/60 text-rose-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bebas text-3xl sm:text-4xl text-rose-400 tracking-wider">
            ${summaryTotals.deductions.contractLabor1099.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            4 Resident & Guest Artists
          </div>
        </div>

        <div className="bg-[#111119] border border-zinc-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Quarterly 1040-ES Status</span>
            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bebas text-3xl sm:text-4xl text-cyan-400 tracking-wider">
            Q1 - Q3 Paid
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            Safe Harbor Projections Met
          </div>
        </div>
      </div>

      {/* Revenue Performance Chart */}
      <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div>
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              2026 Monthly Studio Gross vs Artist Payouts
            </h3>
            <p className="text-xs text-slate-400">Track studio revenue retention, artist commission disbursements, and operational overhead.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs inline-block"></span> Gross Revenue
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 bg-rose-500 rounded-xs inline-block"></span> Artist Payouts
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block"></span> Net Studio Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue2026} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222230" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#11111a', borderColor: '#333345', borderRadius: '10px', fontSize: '12px' }}
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="grossRevenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Gross Revenue" />
              <Bar dataKey="artistPayouts" fill="#e11d48" radius={[4, 4, 0, 0]} name="Artist Payouts" />
              <Bar dataKey="netShopProfit" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Net Shop Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Summary Split Tables: Recent Pay Stubs & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pay Stubs */}
        <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              Recent Payroll Statements
            </h3>
            <button
              onClick={() => onNavigateTab('paystubs')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              Manage All →
            </button>
          </div>

          <div className="space-y-2.5">
            {payStubs.slice(0, 4).map((stub) => (
              <div
                key={stub.id}
                className="flex items-center justify-between p-3 bg-zinc-900/70 rounded-xl border border-zinc-800 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{stub.artistName}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">{stub.id} • {stub.payPeriodStart} to {stub.payPeriodEnd}</div>
                </div>
                <div className="text-right">
                  <div className="font-bebas text-lg text-emerald-400 font-bold">${stub.netPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="text-[10px] text-zinc-400">{stub.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Studio Appointments */}
        <div className="bg-[#111119] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              Studio Appointments Pipeline
            </h3>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              View Schedule →
            </button>
          </div>

          <div className="space-y-2.5">
            {appointments.slice(0, 4).map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between p-3 bg-zinc-900/70 rounded-xl border border-zinc-800 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{appt.clientName}</div>
                  <div className="text-[11px] text-zinc-400">{appt.service} ({appt.placement})</div>
                  <div className="text-[10px] text-rose-400 font-mono">Artist: {appt.artistName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-white">{appt.date}</div>
                  <div className="text-[11px] text-amber-400 font-mono">{appt.time}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">Deposit: ${appt.depositPaid}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
