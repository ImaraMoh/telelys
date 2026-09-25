"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Building2, Save, CheckCircle2, Globe, Activity } from "lucide-react";

export const RetailerSettings: React.FC = () => {
  const { retailer, lang, setLang } = useAuth();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    businessName: retailer?.businessName || "",
    contactName: retailer?.contactName || "",
    email: retailer?.email || "",
    phone: retailer?.phone || "",
    address: retailer?.address || "",
    city: retailer?.city || "",
    taxNumber: retailer?.taxNumber || "",
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

      {/* Header */}
      <div className="relative overflow-hidden bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Activity className="w-3 h-3 animate-pulse" />
              Partner Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Profile Settings</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Profile & Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage your partner profile information, billing details, and preferred portal language.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900 font-black shadow-lg shadow-emerald-500/5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {/* Settings Grid / Stack Container */}
      <div className="space-y-6">
        {/* Language Switcher Card */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-slate-900">Portal Language</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-extrabold text-slate-900 block mb-0.5">Preferred Display Language</span>
              <span className="text-slate-500 font-medium">
                Simple English or Norwegian terminology for all menus and labels.
              </span>
            </div>
            <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  lang === "en"
                    ? "bg-white text-blue-700 shadow-md shadow-slate-900/5"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("no")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  lang === "no"
                    ? "bg-white text-blue-700 shadow-md shadow-slate-900/5"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Norsk
              </button>
            </div>
          </div>
        </div>

        {/* Company Form */}
        <form onSubmit={handleSubmit} className="bg-white/75 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 space-y-5 text-xs">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-slate-900">Retailer Company Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Company Legal Name *</label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900 bg-white/90 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Tax / VAT Number</label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900 bg-white/90 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Primary Contact Name *</label>
              <input
                type="text"
                required
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900 bg-white/90 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Work Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900 bg-white/90 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900 bg-white/90 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900 bg-white/90 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};