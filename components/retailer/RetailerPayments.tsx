"use client";

import React, { useState, useEffect, useCallback } from "react";
import { retailerApi } from "@/lib/api";
import { WalletTransaction } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  Activity,
} from "lucide-react";

interface RetailerPaymentsProps {
  onOpenWalletModal?: () => void;
}

export const RetailerPayments: React.FC<RetailerPaymentsProps> = ({ onOpenWalletModal }) => {
  const { retailer } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [, setLoading] = useState(true);
  const [copiedKID, setCopiedKID] = useState(false);
  const [copiedIBAN, setCopiedIBAN] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await retailerApi.getWalletTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await retailerApi.getWalletTransactions();
        if (isMounted) {
          setTransactions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const kidNumber = `2026${(retailer?.id ?? "").replace(/[^0-9]/g, "").padEnd(8, "0").slice(0, 8)}`;

  const pagination = usePagination(transactions, { initialPageSize: 10 });

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
              Finance Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Wallet & Payments</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Wallet Balance & Payments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor your prepaid purchasing credit and review your billing statements.
          </p>
        </div>
        {onOpenWalletModal && (
          <div className="relative z-10">
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Funds / Top-Up</span>
            </button>
          </div>
        )}
      </div>

      {/* Balance & Wire Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance Hero Card */}
        <div className="bg-linear-to-tr from-slate-900 via-slate-800 to-blue-950 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider">
                Available Wallet Balance
              </span>
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black tracking-tight mt-3">
              NOK {retailer?.balance.toLocaleString()}
            </div>
            <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
              Funds are instantly deducted when you order eSIM packages. No transaction fees.
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Account ID: {retailer?.id}</span>
            {onOpenWalletModal && (
              <button
                type="button"
                onClick={onOpenWalletModal}
                className="font-bold text-blue-300 hover:text-white underline flex items-center gap-1 transition-colors"
              >
                Top-Up Instructions →
              </button>
            )}
          </div>
        </div>

        {/* Bank Wire Details */}
        <div className="lg:col-span-2 bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black text-slate-900">
                  Official Telelys Bank Wire Information
                </h2>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                SEPA & Straksbetaling
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Transfer funds directly to Telelys AS. Please include your unique KID/Customer Reference
              so deposits credit automatically.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-0.5">Beneficiary Name</span>
                <span className="font-extrabold text-slate-900 text-sm">Telelys AS</span>
              </div>

              <div className="p-3.5 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-0.5">Bank Name & Country</span>
                <span className="font-extrabold text-slate-900 text-sm">DNB Bank ASA • Norway</span>
              </div>

              <div className="p-3.5 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-0.5">IBAN / Account Number</span>
                  <span className="font-mono font-black text-slate-900 text-sm">NO93 1503 1234 5678</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("NO93150312345678");
                    setCopiedIBAN(true);
                    setTimeout(() => setCopiedIBAN(false), 2000);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-xl hover:bg-blue-50 transition-colors"
                  title="Copy IBAN"
                >
                  {copiedIBAN ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-blue-700 block text-[11px] font-black uppercase tracking-wider mb-0.5">
                    Your Unique KID / Reference (Important!)
                  </span>
                  <span className="font-mono font-black text-slate-900 text-sm">{kidNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(kidNumber);
                    setCopiedKID(true);
                    setTimeout(() => setCopiedKID(false), 2000);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-xl hover:bg-blue-100/60 transition-colors"
                  title="Copy KID"
                >
                  {copiedKID ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden flex flex-col justify-between">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div>
            <h2 className="text-base font-black text-slate-900">Wallet Transaction History</h2>
            <p className="text-xs text-slate-500 font-medium">All package purchases, wire credits, and adjustments</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Description</th>
                <th className="py-4 px-4">Reference</th>
                <th className="py-4 px-4 text-right">Amount</th>
                <th className="py-4 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {pagination.paginatedItems.map((tx) => {
                const isDebit = tx.type === "DEBIT";

                return (
                  <tr key={tx.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-4 text-slate-400 font-semibold">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                          isDebit
                            ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                        }`}
                      >
                        {isDebit ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-blue-600" />
                            <span>Purchase (Debit)</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            <span>Deposit (Credit)</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{tx.description}</td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500 font-bold">
                      {tx.reference}
                    </td>
                    <td
                      className={`py-4 px-4 text-right font-black text-sm ${
                        isDebit ? "text-slate-900" : "text-emerald-700"
                      }`}
                    >
                      {isDebit ? "-" : "+"}NOK {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">
                      NOK {tx.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <TablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            pageSizeOptions={[10, 25, 50]}
            itemLabel="transactions"
          />
        </div>
      </div>
    </div>
  );
};