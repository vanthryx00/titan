import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  DollarSign, 
  Layers, 
  Calendar, 
  Package, 
  ShieldCheck, 
  LogOut, 
  Globe, 
  ArrowLeft,
  Flame
} from 'lucide-react';
import { OverviewTab } from './owner/OverviewTab';
import { PayStubsTab } from './owner/PayStubsTab';
import { RevenueTaxTab } from './owner/RevenueTaxTab';
import { PageBuilderTab } from './owner/PageBuilderTab';
import { AppointmentsTab } from './owner/AppointmentsTab';
import { InventoryTab } from './owner/InventoryTab';
import { playClickSound } from '../utils/soundEffects';

export const OwnerPortal = ({ 
  currentUser, 
  taxData, 
  payStubs = [], 
  onAddPayStub, 
  onDeletePayStub, 
  customPages = [], 
  onSavePage, 
  onDeletePage, 
  appointments = [], 
  onUpdateAppointmentStatus, 
  inventory = [], 
  onUpdateStock, 
  artists = [], 
  onNavigateToPublic, 
  onNavigateToCustomPage,
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'paystubs', label: 'Pay Stubs & Payroll', icon: FileText, badge: 'Core' },
    { id: 'tax', label: 'Yearly Revenue & Taxes', icon: DollarSign, badge: 'IRS' },
    { id: 'pagebuilder', label: 'Web Page Builder (CMS)', icon: Layers, badge: 'New' },
    { id: 'appointments', label: 'Schedule & Bookings', icon: Calendar },
    { id: 'inventory', label: 'Inks & Needle Supply', icon: Package }
  ];

  const handleTabClick = (tabId) => {
    playClickSound();
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-[#07070b] text-slate-100 flex flex-col">
      {/* Top Command Bar */}
      <header className="sticky top-0 z-40 bg-[#0c0c14]/95 backdrop-blur-xl border-b border-amber-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bebas text-xl text-white tracking-wide leading-none">
                Shane's Command Center
              </div>
              <div className="text-[10px] text-amber-400 font-mono">
                Owner & Master Tax Controller
              </div>
            </div>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-white">Shane Vance</div>
            <div className="text-[10px] text-zinc-400 font-mono">shane@shanestattoo.com</div>
          </div>
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

      {/* Navigation Tabs Bar */}
      <div className="bg-[#0e0e17] border-b border-zinc-800 px-4 sm:px-8 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                    isActive ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            taxData={taxData}
            payStubs={payStubs}
            appointments={appointments}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'paystubs' && (
          <PayStubsTab
            payStubs={payStubs}
            onAddPayStub={onAddPayStub}
            onDeletePayStub={onDeletePayStub}
            artists={artists}
          />
        )}

        {activeTab === 'tax' && (
          <RevenueTaxTab taxData={taxData} />
        )}

        {activeTab === 'pagebuilder' && (
          <PageBuilderTab
            customPages={customPages}
            onSavePage={onSavePage}
            onDeletePage={onDeletePage}
            onNavigateToPage={onNavigateToCustomPage}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTab
            appointments={appointments}
            onUpdateAppointmentStatus={onUpdateAppointmentStatus}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            inventory={inventory}
            onUpdateStock={onUpdateStock}
          />
        )}
      </main>
    </div>
  );
};
