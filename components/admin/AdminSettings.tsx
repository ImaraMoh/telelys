"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, Save, CheckCircle2, Globe, Shield, Activity } from "lucide-react";

export const AdminSettings: React.FC = () => {
  const { lang, setLang } = useAuth();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    systemName: "Telelys B2B eSIM Management System",
    supportEmail: "support@telelys.com",
    currency: "NOK",
    lowStockThreshold: 50,
    autoProvision: true,
    allowWalletPurchases: true,
    notificationEmails: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50/70 via-slate-50 to-indigo-50/50 p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Decorative Mesh Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-150 h-150 bg-linear-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-[-10%] -z-10 w-125 h-125 bg-linear-to-tr from-cyan-400/15 to-blue-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header Bar */}
      <div className="relative overflow-hidden bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Activity className="w-3 h-3 animate-pulse" />
              Settings Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Platform Defaults</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Global Telelys operations configuration, low stock alerts, and platform defaults.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 backdrop-blur-md border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-800 font-extrabold shadow-lg shadow-emerald-500/5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration changes saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
            <Settings className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900">General Operations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Portal Platform Name</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Official Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Default Currency</label>
              <input
                type="text"
                disabled
                value="NOK (Norwegian Krone)"
                className="w-full p-3 border border-slate-200 rounded-2xl bg-slate-100 font-bold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Low Stock Threshold (eSIMs)</label>
              <input
                type="number"
                min="5"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })
                }
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Portal Language */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
            <Globe className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900">Language & Localization</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-slate-900 block mb-0.5">Default Portal Language</span>
              <span className="text-slate-500 font-medium">
                Choose the system language display. Uses clear, friendly, non-technical words.
              </span>
            </div>
            <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-4 py-2 rounded-xl font-extrabold transition-all ${
                  lang === "en"
                    ? "bg-white text-blue-700 shadow-md shadow-blue-500/10"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("no")}
                className={`px-4 py-2 rounded-xl font-extrabold transition-all ${
                  lang === "no"
                    ? "bg-white text-blue-700 shadow-md shadow-blue-500/10"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Norsk (Norwegian)
              </button>
            </div>
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
            <Shield className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900">Automation & Fulfillment</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-start sm:items-center gap-3.5 cursor-pointer p-3 rounded-2xl hover:bg-blue-50/40 transition-colors">
              <input
                type="checkbox"
                checked={settings.autoProvision}
                onChange={(e) => setSettings({ ...settings, autoProvision: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 mt-0.5 sm:mt-0"
              />
              <div>
                <span className="font-extrabold text-slate-900 block">
                  Instant Auto-Allocation of eSIMs
                </span>
                <span className="text-slate-500 font-medium">
                  Automatically assign available inventory to retailers upon order confirmation.
                </span>
              </div>
            </label>

            <label className="flex items-start sm:items-center gap-3.5 cursor-pointer p-3 rounded-2xl hover:bg-blue-50/40 transition-colors">
              <input
                type="checkbox"
                checked={settings.allowWalletPurchases}
                onChange={(e) =>
                  setSettings({ ...settings, allowWalletPurchases: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 mt-0.5 sm:mt-0"
              />
              <div>
                <span className="font-extrabold text-slate-900 block">
                  Enable Prepaid Wallet Balance Checkout
                </span>
                <span className="text-slate-500 font-medium">
                  Allow retailers to order instantly using their deposited account credit.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 text-xs font-extrabold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};