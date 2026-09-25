"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { retailerApi } from '@/lib/api';
import {
  Wallet,
  Building2,
  X,
  Check,
  Copy,
  PlusCircle,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletTopUpModal: React.FC<WalletTopUpModalProps> = ({ isOpen, onClose }) => {
  const { retailer, refreshMe } = useAuth();
  const [amount, setAmount] = useState<number>(10000);
  const [loading, setLoading] = useState(false);
  const [copiedKID, setCopiedKID] = useState(false);
  const [copiedIBAN, setCopiedIBAN] = useState(false);

  if (!isOpen || !retailer) return null;

  const kidNumber = `2026${retailer.id.replace(/[^0-9]/g, '').padEnd(8, '0').slice(0, 8)}`;

  const handleSimulateTopUp = async (amt: number) => {
    setLoading(true);
    try {
      await retailerApi.topUpWallet(amt, 'PREPAID-TOPUP', 'Instant bank wire simulation top-up');
      await refreshMe();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Add Wallet Credit</h3>
              <p className="text-xs text-slate-500">
                Current Balance: <strong>NOK {retailer.balance.toLocaleString()}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Instant Demo Top-Up Option */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/80">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Instant Balance Top-Up (Simulation & Testing)</span>
            </div>
            <p className="text-slate-600 mb-3">
              Add credit immediately to your account to test eSIM package purchases:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  disabled={loading}
                  onClick={() => handleSimulateTopUp(amt)}
                  className="py-2 px-3 bg-white hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-lg border border-blue-200 shadow-2xs transition-colors"
                >
                  +NOK {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Official Bank Wire Information */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Official Wire Instructions (Invoicing)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Bank</span>
                <span className="font-semibold text-slate-800">DNB Bank ASA, Norway</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Beneficiary</span>
                <span className="font-semibold text-slate-800">Telelys AS</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">IBAN</span>
                  <span className="font-mono font-bold text-slate-800">NO93 1503 1234 5678</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('NO93150312345678');
                    setCopiedIBAN(true);
                    setTimeout(() => setCopiedIBAN(false), 2000);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-600"
                >
                  {copiedIBAN ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-blue-700 block font-semibold">Your KID / Reference</span>
                  <span className="font-mono font-bold text-slate-900">{kidNumber}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(kidNumber);
                    setCopiedKID(true);
                    setTimeout(() => setCopiedKID(false), 2000);
                  }}
                  className="p-1 text-blue-700 hover:text-blue-900"
                >
                  {copiedKID ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
