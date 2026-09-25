import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  LogOut,
  Wallet,
  Building2,
  ShieldCheck,
  ChevronDown,
  ArrowRightLeft,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenWalletModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWalletModal }) => {
  const { user, retailer, lang, setLang, t, logout, demoLogin } = useAuth();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const demoAccounts = [
    { name: 'Telelys Admin', email: 'admin@telelys.com', role: 'ADMIN' },
    { name: 'Nordic Connect AS', email: 'nordic@connect.no', role: 'RETAILER' },
    { name: 'Travel Data Hub AB', email: 'info@traveldatahub.se', role: 'RETAILER' },
    { name: 'RoamNet Oy', email: 'support@roamnet.fi', role: 'RETAILER' },
  ];

  return (
    <header className="sticky top-0 z-30 h-18 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700/60 px-7 flex items-center justify-between transition-all shadow-md">
      {/* Left info badge */}
      <div className="flex items-center gap-3">
        {user?.userType === 'ADMIN' ? (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-blue-800/80 border border-blue-600/60 text-purple-200 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-semibold tracking-wide text-white">{t.adminRole}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-blue-800/80 border border-blue-600/60 text-blue-200 shadow-inner">
            <Building2 className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-semibold tracking-wide text-white">
              {retailer?.businessName || t.retailerRole}
            </span>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Retailer Wallet Balance Pill */}
        {user?.userType === 'RETAILER' && retailer && (
          <div className="flex items-center gap-3 bg-blue-950/40 hover:bg-blue-950/60 border border-blue-700/50 px-4 py-2 rounded-xl transition-all shadow-inner text-white">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="text-sm">
              <span className="text-blue-300 block text-xs uppercase font-medium tracking-wider">
                {t.availableBalance}
              </span>
              <span className="font-bold text-white tracking-tight text-sm">
                NOK {retailer.balance.toLocaleString()}
              </span>
            </div>
            {onOpenWalletModal && (
              <button
                onClick={onOpenWalletModal}
                title="Add Balance / View Credit"
                className="ml-1 text-blue-300 hover:text-white hover:bg-blue-800/60 p-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-600"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Language Selector Pill */}
        <div className="flex items-center bg-blue-950/40 p-0.5 rounded-xl border border-blue-700/50 text-sm">
          {(['en', 'no'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                lang === l
                  ? 'bg-white text-blue-900 shadow-xs font-bold'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Notification Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2.5 text-blue-200 hover:text-white hover:bg-blue-800/50 rounded-xl transition-all relative border border-blue-700/40"
            title="System updates"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-blue-900"></span>
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 text-slate-800 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-sm text-slate-900">System Status</span>
                </div>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Operational
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                eSIM Provisioning and SM-DP+ servers are running at 100% capacity.
              </p>
              <p className="text-xs text-slate-400 font-medium">Low latency gateway • Oslo datacenter</p>
            </div>
          )}
        </div>

        {/* Quick Demo Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            className="flex items-center gap-2.5 pl-3.5 pr-3 py-2 text-sm font-medium text-blue-100 bg-blue-800/40 hover:bg-blue-800/70 border border-blue-700/50 rounded-xl transition-all"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-300" />
            <span>Switch Role</span>
            <ChevronDown className={`w-4 h-4 text-blue-300 transition-transform ${showSwitchMenu ? 'rotate-180' : ''}`} />
          </button>

          {showSwitchMenu && (
            <div className="absolute right-0 mt-3 w-76 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 p-2.5 z-50 text-slate-800">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Instant Demo Switcher
              </div>
              <div className="space-y-1">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => {
                      demoLogin(acc.email);
                      setShowSwitchMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm flex flex-col rounded-xl transition-all ${
                      user?.email === acc.email
                        ? 'bg-blue-50/80 text-blue-900 font-medium border border-blue-100'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold">{acc.name}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100/80 border border-slate-200/60 px-2 py-0.5 rounded-md">
                        {acc.role}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400 font-normal">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile info & logout */}
        <div className="flex items-center gap-3.5 pl-4 border-l border-blue-700/60 ml-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-blue-950 flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name?.slice(0, 2).toUpperCase() || 'TL'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-sm font-semibold text-white leading-tight">
              {user?.name}
            </span>
            <span className="block text-xs text-blue-300 leading-tight font-normal">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="p-2.5 text-blue-200 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/30"
            title={t.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};