"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Order, Esim } from "@/types";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Search,
  CheckCircle2,
  Eye,
  Download,
  X,
  RefreshCw,
  Activity,
} from "lucide-react";
import QRCode from "qrcode";

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Order detail drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderEsims, setOrderEsims] = useState<Esim[]>([]);
  const [loadingEsims, setLoadingEsims] = useState(false);

  // Voucher preview inside order
  const [selectedQrEsim, setSelectedQrEsim] = useState<Esim | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await adminApi.getOrders();
        if (isMounted) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
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

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingEsims(true);
    try {
      const data = await adminApi.getOrderEsims(order.id);
      setOrderEsims(data);
    } catch (err) {
      console.error("Failed to fetch order eSIMs:", err);
    } finally {
      setLoadingEsims(false);
    }
  };

  const handleShowQr = async (esim: Esim) => {
    setSelectedQrEsim(esim);
    try {
      const url = await QRCode.toDataURL(esim.activationCode, { width: 256, margin: 2 });
      setQrDataUrl(url);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };

  const exportOrderCsv = (order: Order, esims: Esim[]) => {
    let csv = "ICCID,ActivationCode,Package,Retailer\n";
    esims.forEach((e) => {
      csv += `${e.iccid},"${e.activationCode}","${order.productName}","${order.retailerName}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${order.orderNumber}-esims.csv`;
    a.click();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.retailerName.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ordersPagination = usePagination(filteredOrders, { initialPageSize: 10 });
  const esimsPagination = usePagination(orderEsims, { initialPageSize: 10 });

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
              Orders Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Retailer Transactions</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Retailer Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit wholesale orders placed by retailers, package allocations, and transaction receipts.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white/90 border border-slate-200/80 rounded-xl hover:bg-white hover:shadow-md transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/75 backdrop-blur-2xl p-5 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search order number, retailer, package..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-bold mr-1">Status:</span>
          {["ALL", "COMPLETED", "PENDING", "CANCELLED"].map((st) => (
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
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-5">Order ID</th>
                <th className="py-4 px-5">Retailer</th>
                <th className="py-4 px-5">Package</th>
                <th className="py-4 px-5 text-center">Quantity</th>
                <th className="py-4 px-5 text-right">Unit Price</th>
                <th className="py-4 px-5 text-right">Total Amount</th>
                <th className="py-4 px-5 text-center">Payment</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {ordersPagination.paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-medium">
                    No orders found.
                  </td>
                </tr>
              ) : (
                ordersPagination.paginatedItems.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-black text-blue-600">{o.orderNumber}</td>
                    <td className="py-4 px-5 font-bold text-slate-900">{o.retailerName}</td>
                    <td className="py-4 px-5 font-medium text-slate-700">{o.productName}</td>
                    <td className="py-4 px-5 text-center font-extrabold text-slate-900">{o.quantity}</td>
                    <td className="py-4 px-5 text-right font-semibold text-slate-500">NOK {o.unitPrice}</td>
                    <td className="py-4 px-5 text-right font-black text-slate-900 text-sm">
                      NOK {o.total.toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => openOrderDetail(o)}
                        className="px-3 py-1.5 text-[11px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/80 inline-flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <TablePagination
            currentPage={ordersPagination.currentPage}
            totalPages={ordersPagination.totalPages}
            totalItems={ordersPagination.totalItems}
            pageSize={ordersPagination.pageSize}
            onPageChange={ordersPagination.setPage}
            onPageSizeChange={ordersPagination.setPageSize}
            pageSizeOptions={[10, 20, 50]}
            itemLabel="orders"
          />
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200 border-l border-white/80">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200/80 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Order Details
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedOrder.orderNumber}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Summary Card */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-4 shadow-inner">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Retailer</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{selectedOrder.retailerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Order Date</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Package</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{selectedOrder.productName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Quantity</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {selectedOrder.quantity} eSIMs
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Wholesale Total</span>
                  <span className="font-black text-blue-700 text-base mt-0.5 block">
                    NOK {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Payment Status</span>
                  <span className="font-extrabold text-emerald-700 mt-0.5 block">{selectedOrder.paymentStatus}</span>
                </div>
              </div>

              {/* Allocated eSIMs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm">Assigned eSIMs ({orderEsims.length})</h3>
                  {orderEsims.length > 0 && (
                    <button
                      type="button"
                      onClick={() => exportOrderCsv(selectedOrder, orderEsims)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-all shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>

                {loadingEsims ? (
                  <div className="p-12 text-center text-slate-400 font-semibold">Loading eSIM codes...</div>
                ) : (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white/80 shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] text-slate-400 uppercase font-extrabold sticky top-0">
                          <tr>
                            <th className="p-3">ICCID</th>
                            <th className="p-3">Activation Code (LPA)</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {esimsPagination.paginatedItems.map((esim) => (
                            <tr key={esim.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="p-3 font-mono font-bold text-slate-800">{esim.iccid}</td>
                              <td className="p-3 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                                {esim.activationCode}
                              </td>
                              <td className="p-3 text-center">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                                  {esim.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleShowQr(esim)}
                                  className="text-blue-600 hover:text-blue-800 font-extrabold text-[11px]"
                                >
                                  View QR
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2 border-t border-slate-100">
                      <TablePagination
                        currentPage={esimsPagination.currentPage}
                        totalPages={esimsPagination.totalPages}
                        totalItems={esimsPagination.totalItems}
                        pageSize={esimsPagination.pageSize}
                        onPageChange={esimsPagination.setPage}
                        onPageSizeChange={esimsPagination.setPageSize}
                        compact
                        pageSizeOptions={[5, 10, 25]}
                        itemLabel="eSIMs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR preview modal inside order */}
      {selectedQrEsim && qrDataUrl && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/90 text-center animate-in zoom-in-95">
            <h4 className="font-black text-slate-900 text-sm mb-1">{selectedQrEsim.productName}</h4>
            <p className="font-mono text-xs text-slate-500 mb-4 font-semibold">{selectedQrEsim.iccid}</p>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block mb-4 shadow-inner">
              <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 mx-auto rounded-xl" />
            </div>
            <button
              type="button"
              onClick={() => setSelectedQrEsim(null)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};