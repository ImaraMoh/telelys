"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Payment, Retailer } from "@/types";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Search,
  Plus,
  CheckCircle2,
  X,
  RefreshCw,
  Activity,
} from "lucide-react";

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    retailerId: "",
    amount: "",
    method: "BANK_TRANSFER" as const,
    reference: "",
    notes: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [payData, retData] = await Promise.all([
        adminApi.getPayments(),
        adminApi.getRetailers(),
      ]);
      setPayments(payData.payments);
      setRetailers(retData);
      if (retData.length > 0 && !form.retailerId) {
        setForm((prev) => ({ ...prev, retailerId: retData[0].id }));
      }
    } catch (err) {
      console.error("Failed to load payment data:", err);
    } finally {
      setLoading(false);
    }
  }, [form.retailerId]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const [payData, retData] = await Promise.all([
          adminApi.getPayments(),
          adminApi.getRetailers(),
        ]);
        if (isMounted) {
          setPayments(payData.payments);
          setRetailers(retData);
          if (retData.length > 0) {
            setForm((prev) => ({ ...prev, retailerId: retData[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load payment data:", err);
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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.recordPayment({
        retailerId: form.retailerId,
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference || `PAY-${Date.now().toString().slice(-6)}`,
        notes: form.notes,
      });
      setShowModal(false);
      setForm({
        retailerId: retailers[0]?.id || "",
        amount: "",
        method: "BANK_TRANSFER",
        reference: "",
        notes: "",
      });
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record payment";
      alert(message);
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.paymentReference.toLowerCase().includes(search.toLowerCase()) ||
      p.retailerName.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(search.toLowerCase())
  );

  const pagination = usePagination(filteredPayments, { initialPageSize: 10 });

  const totalCollected = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

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
              Finance Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Invoices & Deposits</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments & Invoicing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track bank wires, balance top-ups, credit deposits, and billing transactions.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 group">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-linear-to-br from-emerald-500/20 to-teal-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total B2B Funds Received</span>
          <div className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
            NOK {totalCollected.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md inline-block mt-2">
            Completed deposits
          </span>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 group">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-linear-to-br from-blue-500/20 to-indigo-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recorded Transactions</span>
          <div className="text-3xl font-black text-slate-900 mt-3 tracking-tight">{payments.length}</div>
          <span className="text-xs text-slate-700 font-semibold bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md inline-block mt-2">
            Prepaid & wire transfers
          </span>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 group">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-linear-to-br from-purple-500/20 to-blue-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Currency</span>
          <div className="text-3xl font-black text-blue-700 mt-3 tracking-tight">NOK (kr)</div>
          <span className="text-xs text-purple-700 font-semibold bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md inline-block mt-2">
            Norwegian Krone
          </span>
        </div>
      </div>

      {/* Search Bar & Refresh */}
      <div className="flex items-center justify-between gap-4 bg-white/75 backdrop-blur-2xl p-5 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search payment ID, retailer, or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2.5 text-slate-500 hover:text-slate-900 bg-white/90 border border-slate-200 rounded-xl transition-all hover:shadow-xs disabled:opacity-60"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-5">Receipt #</th>
                <th className="py-4 px-5">Retailer</th>
                <th className="py-4 px-5">Method</th>
                <th className="py-4 px-5">Reference</th>
                <th className="py-4 px-5 text-right">Amount</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {pagination.paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-black text-blue-600">{p.paymentReference}</td>
                    <td className="py-4 px-5 font-bold text-slate-900">{p.retailerName}</td>
                    <td className="py-4 px-5 text-slate-600 font-medium">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-[11px] font-bold">
                        {p.method.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-slate-500 font-semibold">{p.transactionId}</td>
                    <td className="py-4 px-5 text-right font-black text-slate-900 text-sm">
                      NOK {p.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-slate-400 font-semibold text-[11px]">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
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
            pageSizeOptions={[10, 20, 50]}
            itemLabel="payments"
          />
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">Record Inbound Retailer Payment</h3>
                <p className="text-xs text-slate-500 mt-0.5">Direct wire or balance credit adjustment.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Retailer *</label>
                <select
                  value={form.retailerId}
                  onChange={(e) => setForm({ ...form, retailerId: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-white/90 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-800"
                >
                  {retailers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.businessName} (Balance: NOK {r.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Received (NOK) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 25000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value as unknown as typeof form.method })}
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-white/90 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="BANK_TRANSFER">Bank Wire Transfer (SEPA / Straksbetaling)</option>
                  <option value="CREDIT_LINE">B2B Credit Line</option>
                  <option value="STRIPE">Stripe / Card Payment</option>
                  <option value="WALLET">Wallet Manual Deposit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank Reference / Wire ID</label>
                <input
                  type="text"
                  placeholder="e.g. DNB-WIRE-982103"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional accounting notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 resize-none font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Record & Credit Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};