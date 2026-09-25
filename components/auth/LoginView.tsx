"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Radio, ShieldCheck, Building2, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, lang, setLang, t } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'RETAILER'>('ADMIN');
  const [email, setEmail] = useState('admin@telelys.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (role: 'ADMIN' | 'RETAILER') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'ADMIN') {
      setEmail('admin@telelys.com');
      setPassword('admin123');
    } else {
      setEmail('nordic@connect.no');
      setPassword('retailer123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoRetailers = [
    { name: 'Nordic Connect AS', email: 'nordic@connect.no', balance: 'NOK 8,450' },
    { name: 'Travel Data Hub AB', email: 'info@traveldatahub.se', balance: 'NOK 14,200' },
    { name: 'RoamNet Oy', email: 'support@roamnet.fi', balance: 'NOK 19,500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top language selector */}
      <div className="absolute top-6 right-6 flex items-center bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs text-xs">
        <button
          onClick={() => setLang('en')}
          className={`px-2 py-1 rounded font-medium ${
            lang === 'en' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          English
        </button>
        <span className="text-slate-300 mx-1">|</span>
        <button
          onClick={() => setLang('no')}
          className={`px-2 py-1 rounded font-medium ${
            lang === 'no' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Norsk
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md mb-4">
          <Radio className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          TELELYS
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          B2B eSIM Retailer Management & Distribution Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('ADMIN')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Telelys Admin
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('RETAILER')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'RETAILER'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Retailer Partner
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-xs ${
                selectedRole === 'ADMIN'
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Log In to {selectedRole === 'ADMIN' ? 'Telelys Admin' : 'Retailer Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helpers for rapid evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click Test Accounts</span>
            </div>
            {selectedRole === 'ADMIN' ? (
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@telelys.com');
                  setPassword('admin123');
                }}
                className="w-full text-left p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-xs transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-purple-900 block">admin@telelys.com</span>
                  <span className="text-purple-600 text-[11px]">Full Telelys Operations Management</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium text-[10px]">
                  Default
                </span>
              </button>
            ) : (
              <div className="space-y-1.5">
                {demoRetailers.map((r) => (
                  <button
                    key={r.email}
                    type="button"
                    onClick={() => {
                      setEmail(r.email);
                      setPassword('retailer123');
                    }}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                      email === r.email
                        ? 'border-blue-400 bg-blue-50/80 font-semibold text-blue-900'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-medium block">{r.name}</span>
                      <span className="text-slate-400 text-[11px] font-normal">{r.email}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      {r.balance}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
