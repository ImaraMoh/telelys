"use client";

import React, { useState, useEffect, useCallback } from "react";
import { retailerApi } from "@/lib/api";
import { Esim } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Search,
  QrCode,
  Download,
  CheckCircle2,
  Send,
  X,
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
  Activity,
} from "lucide-react";
import QRCode from "qrcode";

export const RetailerStock: React.FC = () => {
  const { setActiveTab } = useAuth();
  const [esims, setEsims] = useState<Esim[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Customer Delivery Modal
  const [deliveringEsim, setDeliveringEsim] = useState<Esim | null>(null);
  const [customerForm, setCustomerForm] = useState({
    customerName: "",
    customerEmail: "",
    notes: "",
  });
  const [savingDelivery, setSavingDelivery] = useState(false);

  // QR & Voucher Modal
  const [viewingEsim, setViewingEsim] = useState<Esim | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStock = useCallback(async () => {
    try {
      setLoading(true);
      const data = await retailerApi.getMyStock({
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setEsims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await retailerApi.getMyStock({
          status: statusFilter === "ALL" ? undefined : statusFilter,
        });
        if (isMounted) {
          setEsims(data);
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
  }, [statusFilter]);

  const handleOpenVoucher = async (esim: Esim) => {
    setViewingEsim(esim);
    setCopied(false);
    try {
      const url = await QRCode.toDataURL(esim.activationCode, {
        width: 280,
        margin: 2,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSupplyToCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringEsim) return;
    setSavingDelivery(true);
    try {
      await retailerApi.markEsimSold(deliveringEsim.id, {
        customerName: customerForm.customerName,
        customerEmail: customerForm.customerEmail,
        notes: customerForm.notes,
      });
      setDeliveringEsim(null);
      setCustomerForm({ customerName: "", customerEmail: "", notes: "" });
      await loadStock();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update eSIM";
      alert(message);
    } finally {
      setSavingDelivery(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    let csv = "ICCID,ActivationCode,Package,Status,CustomerName,CustomerEmail\n";
    filteredEsims.forEach((e) => {
      csv += `${e.iccid},"${e.activationCode}","${e.productName}","${e.status}","${e.customerName || ""}","${e.customerEmail || ""}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-esim-inventory.csv`;
    a.click();
  };

  const filteredEsims = esims.filter((e) => {
    const matchesSearch =
      e.iccid.includes(search) ||
      (e.productName ? e.productName.toLowerCase().includes(search.toLowerCase()) : false) ||
      (e.customerName && e.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (e.customerEmail && e.customerEmail.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const pagination = usePagination(filteredEsims, { initialPageSize: 10 });

  const availableCount = esims.filter((e) => e.status === "ASSIGNED").length;
  const soldCount = esims.filter((e) => e.status === "SOLD" || e.status === "ACTIVATED").length;

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
              Inventory Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• eSIM Stock</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My eSIM Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage your purchased packages, supply eSIM vouchers to end customers, and download codes.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-all shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy More eSIMs</span>
          </button>
        </div>
      </div>

      {/* Stock Quick Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Ready in My Inventory</span>
          <div className="text-3xl font-black text-blue-700 tracking-tight mt-2">{availableCount} eSIMs</div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">Available to give to customers</span>
        </div>
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Sold / Given to Customers</span>
          <div className="text-3xl font-black text-emerald-600 tracking-tight mt-2">{soldCount} eSIMs</div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">Customer lines delivered</span>
        </div>
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Total eSIMs Purchased</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight mt-2">{esims.length} eSIMs</div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">Total lifetime allocations</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/75 backdrop-blur-2xl p-4 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search ICCID, package, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl border border-slate-200/80 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-bold">Status:</span>
          {[
            { id: "ALL", label: "All" },
            { id: "ASSIGNED", label: "Ready in Inventory" },
            { id: "SOLD", label: "Sold to Customer" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === st.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/90 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {st.label}
            </button>
          ))}
          <button
            type="button"
            onClick={loadStock}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl ml-1 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-4">Package</th>
                <th className="py-4 px-4">ICCID Number</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4">Customer Info</th>
                <th className="py-4 px-4 text-right">Added to Stock</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {pagination.totalItems === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    No eSIMs found in your inventory matching this filter.
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((e) => (
                  <tr key={e.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-slate-900 block">{e.productName}</span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {e.iccid}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                          e.status === "ASSIGNED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                        }`}
                      >
                        {e.status === "ASSIGNED" ? (
                          "In My Inventory"
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Sold to Customer</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {e.customerName ? (
                        <div>
                          <span className="font-bold text-slate-900 block">{e.customerName}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{e.customerEmail}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium italic">Not yet assigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right text-slate-400 font-semibold">
                      {e.assignedAt ? new Date(e.assignedAt).toLocaleDateString() : "—"}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {e.status === "ASSIGNED" && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeliveringEsim(e);
                              setCustomerForm({ customerName: "", customerEmail: "", notes: "" });
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl border border-emerald-200/80 flex items-center gap-1.5 transition-all shadow-2xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Supply to Customer</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenVoucher(e)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-xl border border-blue-200/80 flex items-center gap-1.5 transition-all shadow-2xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View QR</span>
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
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            pageSizeOptions={[10, 25, 50]}
            itemLabel="eSIMs"
          />
        </div>
      </div>

      {/* Supply to Customer Modal */}
      {deliveringEsim && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-white/90 animate-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">Supply eSIM to Customer</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{deliveringEsim.productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setDeliveringEsim(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSupplyToCustomer} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 font-mono text-xs text-slate-800 font-bold shadow-2xs">
                ICCID: <span className="font-black text-blue-700">{deliveringEsim.iccid}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lars Hansen"
                  value={customerForm.customerName}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, customerName: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="lars@example.no"
                  value={customerForm.customerEmail}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, customerEmail: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Sale Notes / Receipt ID
                </label>
                <input
                  type="text"
                  placeholder="Store receipt # or travel order"
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeliveringEsim(null)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDelivery}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {savingDelivery ? "Saving..." : "Mark as Supplied to Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Voucher Modal */}
      {viewingEsim && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-white/90 animate-in zoom-in-95 text-center my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                Telelys eSIM Voucher
              </span>
              <button
                type="button"
                onClick={() => setViewingEsim(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-black text-slate-900">{viewingEsim.productName}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Scan with smartphone camera to install mobile data plan
            </p>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 inline-block my-4 shadow-inner">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="eSIM QR Code"
                  className="w-48 h-48 mx-auto rounded-xl shadow-2xs"
                />
              )}
            </div>

            {/* LPA code */}
            <div className="text-left bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 mb-5 text-xs shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">
                  Manual Activation Code (LPA)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(viewingEsim.activationCode)}
                  className="text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 text-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-slate-900 font-bold break-all text-[11px] select-all bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                {viewingEsim.activationCode}
              </p>
            </div>

            <div className="flex gap-2.5">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`telelys-voucher-${viewingEsim.iccid}.png`}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Voucher Image</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setViewingEsim(null)}
                className="px-4 py-3 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-2xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};