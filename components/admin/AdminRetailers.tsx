"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Retailer, Order, Esim, Payment, WalletTransaction } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  RefreshCw,
  Activity,
} from "lucide-react";

export const AdminRetailers: React.FC = () => {
  const { t } = useAuth();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRetailerId, setSelectedRetailerId] = useState<string | null>(null);
  const [retailerDetail, setRetailerDetail] = useState<{
    retailer: Retailer;
    orders: Order[];
    stock: Esim[];
    payments: Payment[];
    transactions: WalletTransaction[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Credit Adjustment Modal
  const [creditModalRetailer, setCreditModalRetailer] = useState<Retailer | null>(null);
  const [creditForm, setCreditForm] = useState({
    type: "CREDIT",
    amount: "",
    reference: "",
    description: "",
  });
  const [adjusting, setAdjusting] = useState(false);

  // New Retailer Form
  const [newRetailer, setNewRetailer] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Norway",
    taxNumber: "",
    initialBalance: "",
  });

  const loadRetailers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getRetailers();
      setRetailers(data);
    } catch (err) {
      console.error("Failed to load retailers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await adminApi.getRetailers();
        if (isMounted) {
          setRetailers(data);
        }
      } catch (err) {
        console.error("Failed to load retailers:", err);
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

  const openDetail = useCallback(async (id: string) => {
    setSelectedRetailerId(id);
    setLoadingDetail(true);
    try {
      const data = await adminApi.getRetailerDetail(id);
      setRetailerDetail(data);
    } catch (err) {
      console.error("Failed to fetch retailer detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleToggleStatus = async (r: Retailer) => {
    const newStatus = r.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await adminApi.updateRetailer(r.id, { status: newStatus });
      setRetailers((prev) =>
        prev.map((item) => (item.id === r.id ? { ...item, status: newStatus } : item))
      );
      if (retailerDetail?.retailer.id === r.id) {
        setRetailerDetail((prev) =>
          prev ? { ...prev, retailer: { ...prev.retailer, status: newStatus } } : null
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update retailer status";
      alert(message);
    }
  };

  const handleCreateRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createRetailer({
        ...newRetailer,
        initialBalance: Number(newRetailer.initialBalance) || 0,
      });
      setShowCreateModal(false);
      setNewRetailer({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Norway",
        taxNumber: "",
        initialBalance: "",
      });
      await loadRetailers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create retailer";
      alert(message);
    }
  };

  const handleAdjustCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalRetailer) return;
    setAdjusting(true);
    try {
      await adminApi.adjustWalletCredit(creditModalRetailer.id, {
        type: creditForm.type,
        amount: Number(creditForm.amount),
        reference: creditForm.reference || "ADMIN-TOPUP",
        description: creditForm.description || "Manual B2B balance adjustment",
      });
      setCreditModalRetailer(null);
      setCreditForm({ type: "CREDIT", amount: "", reference: "", description: "" });
      await loadRetailers();
      if (selectedRetailerId === creditModalRetailer.id) {
        await openDetail(selectedRetailerId);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to adjust credit";
      alert(message);
    } finally {
      setAdjusting(false);
    }
  };

  const filteredRetailers = retailers.filter((r) => {
    const matchesSearch =
      r.businessName.toLowerCase().includes(search.toLowerCase()) ||
      r.contactName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const retailersPagination = usePagination(filteredRetailers, { initialPageSize: 10 });
  const txPagination = usePagination(retailerDetail?.transactions || [], { initialPageSize: 5 });
  const stockPagination = usePagination(retailerDetail?.stock || [], { initialPageSize: 5 });

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
              Partners Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• B2B Distribution</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Retailers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized B2B eSIM distribution partners, credit lines, and customer inventory.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={loadRetailers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white/90 border border-slate-200/80 rounded-xl hover:bg-white hover:shadow-md transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Retailer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/75 backdrop-blur-2xl p-5 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search business name, contact, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-bold mr-1">Status:</span>
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/90 text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900"
              }`}
            >
              {st === "ALL" ? "All" : st === "ACTIVE" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      {/* Retailers Table */}
      <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-5">Retailer</th>
                <th className="py-4 px-5">Contact</th>
                <th className="py-4 px-5">Location</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Available Balance</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {retailersPagination.paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                    No retailers found.
                  </td>
                </tr>
              ) : (
                retailersPagination.paginatedItems.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/20">
                          {r.businessName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{r.businessName}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{r.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 block">{r.contactName}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{r.email}</span>
                    </td>

                    <td className="py-4 px-5">
                      <span className="block font-semibold text-slate-800">
                        {r.city}, {r.country}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{r.phone}</span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all shadow-xs ${
                          r.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {r.status === "ACTIVE" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <span className="font-black text-slate-900 text-sm block">
                        NOK {r.balance.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">Credit Wallet</span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCreditModalRetailer(r);
                            setCreditForm({
                              type: "CREDIT",
                              amount: "",
                              reference: `TOPUP-${r.id.toUpperCase().slice(-4)}`,
                              description: `Balance top-up for ${r.businessName}`,
                            });
                          }}
                          className="px-3 py-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all shadow-2xs"
                          title="Add/Deduct Credit"
                        >
                          ± Balance
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetail(r.id)}
                          className="px-3 py-1.5 text-[11px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all shadow-2xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100">
          <TablePagination
            currentPage={retailersPagination.currentPage}
            totalPages={retailersPagination.totalPages}
            totalItems={retailersPagination.totalItems}
            pageSize={retailersPagination.pageSize}
            onPageChange={retailersPagination.setPage}
            onPageSizeChange={retailersPagination.setPageSize}
            itemLabel="retailers"
          />
        </div>
      </div>

      {/* Retailer Detail Drawer / Modal */}
      {selectedRetailerId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200 border-l border-white/80">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200/80 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Retailer Profile & Account
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {retailerDetail?.retailer.businessName || "Loading..."}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRetailerId(null);
                  setRetailerDetail(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail || !retailerDetail ? (
              <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="p-6 space-y-6 flex-1 text-xs">
                {/* Balance / Credit Card */}
                <div className="p-6 rounded-3xl bg-linear-to-tr from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl shadow-blue-500/10 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none"></div>
                  <div>
                    <span className="text-[11px] text-blue-200 uppercase font-extrabold tracking-wider">
                      Current Available Balance
                    </span>
                    <div className="text-3xl font-black mt-1 tracking-tight">
                      NOK {retailerDetail.retailer.balance.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      Prepaid balance available for instant eSIM package purchases.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCreditModalRetailer(retailerDetail.retailer);
                      setCreditForm({
                        type: "CREDIT",
                        amount: "",
                        reference: `TOPUP-${retailerDetail.retailer.id.toUpperCase().slice(-4)}`,
                        description: `Balance top-up for ${retailerDetail.retailer.businessName}`,
                      });
                    }}
                    className="px-4.5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Manage Balance
                  </button>
                </div>

                {/* Company Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-inner">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Contact Person</span>
                    <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                      {retailerDetail.retailer.contactName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Email Address</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{retailerDetail.retailer.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Phone Number</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{retailerDetail.retailer.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Address & Country</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {retailerDetail.retailer.address}, {retailerDetail.retailer.city} (
                      {retailerDetail.retailer.country})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Tax / VAT Number</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {retailerDetail.retailer.taxNumber || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Account Status</span>
                    <span
                      className={`font-black mt-0.5 block ${
                        retailerDetail.retailer.status === "ACTIVE"
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {retailerDetail.retailer.status}
                    </span>
                  </div>
                </div>

                {/* Quick Summary Counts */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Orders</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">
                      {retailerDetail.orders.length}
                    </span>
                  </div>
                  <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">eSIM Inventory</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">
                      {retailerDetail.stock.length} units
                    </span>
                  </div>
                  <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Purchases</span>
                    <span className="text-base font-black text-blue-700 mt-1 block">
                      NOK {retailerDetail.orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Credit Transaction History */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">
                    Recent Wallet & Credit Activity
                  </h3>
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white/80 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] text-slate-400 uppercase font-extrabold">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Description</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-right">New Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {txPagination.paginatedItems.map((tx) => (
                          <tr key={tx.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 text-slate-500 font-medium">
                              {new Date(tx.date).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                  tx.type === "CREDIT" || tx.type === "REFUND"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : "bg-blue-50 text-blue-700 border border-blue-200/60"
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700 font-medium">{tx.description}</td>
                            <td className="p-3 text-right font-bold">
                              {tx.type === "DEBIT" ? "-" : "+"}NOK {tx.amount.toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-black text-slate-900">
                              NOK {tx.balanceAfter.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-2 border-t border-slate-100">
                      <TablePagination
                        currentPage={txPagination.currentPage}
                        totalPages={txPagination.totalPages}
                        totalItems={txPagination.totalItems}
                        pageSize={txPagination.pageSize}
                        onPageChange={txPagination.setPage}
                        onPageSizeChange={txPagination.setPageSize}
                        pageSizeOptions={[5, 10, 20]}
                        itemLabel="transactions"
                        compact
                      />
                    </div>
                  </div>
                </div>

                {/* Assigned Stock sample */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">
                    Assigned eSIM Stock ({retailerDetail.stock.length} units)
                  </h3>
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white/80 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] text-slate-400 uppercase font-extrabold sticky top-0">
                        <tr>
                          <th className="p-3">Package</th>
                          <th className="p-3">ICCID</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Assigned Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stockPagination.paginatedItems.map((esim) => (
                          <tr key={esim.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 font-bold text-slate-800">{esim.productName}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-600 font-semibold">{esim.iccid}</td>
                            <td className="p-3 text-center">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                                {esim.status}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-400 text-[11px] font-semibold">
                              {esim.assignedAt ? new Date(esim.assignedAt).toLocaleDateString() : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-2 border-t border-slate-100">
                      <TablePagination
                        currentPage={stockPagination.currentPage}
                        totalPages={stockPagination.totalPages}
                        totalItems={stockPagination.totalItems}
                        pageSize={stockPagination.pageSize}
                        onPageChange={stockPagination.setPage}
                        onPageSizeChange={stockPagination.setPageSize}
                        pageSizeOptions={[5, 10, 20]}
                        itemLabel="eSIMs"
                        compact
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credit / Balance Adjustment Modal */}
      {creditModalRetailer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-white/90 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">Adjust Retailer Balance</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{creditModalRetailer.businessName}</p>
              </div>
              <button
                type="button"
                onClick={() => setCreditModalRetailer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustCredit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Type</label>
                <select
                  value={creditForm.type}
                  onChange={(e) => setCreditForm({ ...creditForm, type: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs font-semibold bg-white/90 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800"
                >
                  <option value="CREDIT">Add Funds (CREDIT) — Top Up</option>
                  <option value="DEBIT">Deduct Funds (DEBIT) — Charge / Withdrawal</option>
                  <option value="REFUND">Refund Credit (REFUND)</option>
                  <option value="ADJUSTMENT">Manual Accounting Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount (NOK)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 5000"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reference / Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. BANK-WIRE-2026-99"
                  value={creditForm.reference}
                  onChange={(e) => setCreditForm({ ...creditForm, reference: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description Note</label>
                <textarea
                  rows={2}
                  placeholder="Reason for balance update..."
                  value={creditForm.description}
                  onChange={(e) => setCreditForm({ ...creditForm, description: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-medium resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreditModalRetailer(null)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {adjusting ? "Updating Balance..." : "Apply Balance Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Retailer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">Register New B2B Retailer</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Onboard a new authorized partner.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRetailer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nordic Telecom AS"
                  value={newRetailer.businessName}
                  onChange={(e) => setNewRetailer({ ...newRetailer, businessName: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm font-bold bg-white/90 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={newRetailer.contactName}
                    onChange={(e) =>
                      setNewRetailer({ ...newRetailer, contactName: e.target.value })
                    }
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@company.com"
                    value={newRetailer.email}
                    onChange={(e) => setNewRetailer({ ...newRetailer, email: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+47 21 00 00 00"
                    value={newRetailer.phone}
                    onChange={(e) => setNewRetailer({ ...newRetailer, phone: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax / VAT Number</label>
                  <input
                    type="text"
                    placeholder="NO123456789MVA"
                    value={newRetailer.taxNumber}
                    onChange={(e) => setNewRetailer({ ...newRetailer, taxNumber: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Street and number"
                    value={newRetailer.address}
                    onChange={(e) => setNewRetailer({ ...newRetailer, address: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Oslo"
                    value={newRetailer.city}
                    onChange={(e) => setNewRetailer({ ...newRetailer, city: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Wallet Balance (NOK)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10000"
                  value={newRetailer.initialBalance}
                  onChange={(e) =>
                    setNewRetailer({ ...newRetailer, initialBalance: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Create Retailer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};