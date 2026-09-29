import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, CheckCircle2, XCircle, Search, Filter, Plus } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../../utils/soundEffects';

export const AppointmentsTab = ({ appointments = [], onUpdateAppointmentStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAppts = appointments.filter(a => {
    const matchSearch = a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.artistName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (apptId, newStatus) => {
    playClickSound();
    playSuccessChime();
    onUpdateAppointmentStatus(apptId, newStatus);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111119] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Studio Booking & Walk-in Pipeline
          </div>
          <h2 className="font-bebas text-3xl text-white tracking-wide">
            Master Studio Schedule & Deposits
          </h2>
          <p className="text-xs text-slate-400">
            Monitor confirmed client appointments, deposit receipts, and chair allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-700 text-xs">
            <span className="text-slate-400">Total Deposits Held: </span>
            <strong className="text-emerald-400 font-mono">
              ${appointments.reduce((sum, a) => sum + (a.depositPaid || 0), 0)}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#0c0c14] p-3 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, service, or artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending Deposit">Pending Deposit</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-[#111119] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b0b12] text-slate-400 border-b border-zinc-800 font-mono text-[11px] uppercase">
                <th className="p-4">Appt ID & Date</th>
                <th className="p-4">Client Contact</th>
                <th className="p-4">Artist Assigned</th>
                <th className="p-4">Service & Placement</th>
                <th className="p-4 text-right">Deposit Paid</th>
                <th className="p-4 text-right">Est. Balance</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredAppts.map((appt) => (
                <tr key={appt.id} className="hover:bg-zinc-900/50 transition">
                  <td className="p-4">
                    <div className="font-mono text-rose-400 font-semibold">{appt.id}</div>
                    <div className="text-white font-medium">{appt.date}</div>
                    <div className="text-[10px] text-amber-400 font-mono">{appt.time}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{appt.clientName}</div>
                    <div className="text-[10px] text-zinc-400">{appt.clientEmail}</div>
                    <div className="text-[10px] text-zinc-500">{appt.clientPhone}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-200">{appt.artistName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{appt.durationHours} Hours</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{appt.service}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{appt.placement}</div>
                  </td>
                  <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                    ${appt.depositPaid}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-300">
                    ${appt.estimatedTotal}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      appt.status === 'Confirmed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {appt.status !== 'Completed' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 text-[11px] font-semibold cursor-pointer"
                        >
                          Mark Complete
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
    </div>
  );
};
