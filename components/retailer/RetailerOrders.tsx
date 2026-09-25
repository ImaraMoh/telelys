"use client";

import React, { useState, useEffect, useCallback } from "react";
import { retailerApi } from "@/lib/api";
import { Order, Esim } from "@/types";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  CheckCircle2,
  Download,
  Eye,
  X,
  RefreshCw,
  Search,
  Activity,
} from "lucide-react";
import QRCode from "qrcode";

export const RetailerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderEsims, setOrderEsims] = useState<Esim[]>([]);
  const [loadingEsims, setLoadingEsims] = useState(false);

  // Voucher preview
  const [selectedQrEsim, setSelectedQrEsim] = useState<Esim | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await retailerApi.getOrders();
      setOrders(data);
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
        const data = await retailerApi.getOrders();
        if (isMounted) {
          setOrders(data);
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

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingEsims(true);
    try {
      const data = await retailerApi.getOrderEsims(order.id);
      setOrderEsims(data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const exportOrderCsv = (order: Order, esims: Esim[]) => {
    let csv = "ICCID,ActivationCode,Package\n";
    esims.forEach((e) => {
      csv += `${e.iccid},"${e.activationCode}","${order.productName}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-order-${order.orderNumber}.csv`;
    a.click();
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase())
  );

  const ordersPagination = usePagination(filteredOrders, { initialPageSize: 10 });
  const esimPagination = usePagination(orderEsims, { initialPageSize: 5 });

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
              Procurement Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Retailer Orders</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Purchase Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            History of wholesale eSIM package orders purchased from Telelys.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-all shadow-xs active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white/75 backdrop-blur-2xl p-4 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search order number or package name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl border border-slate-200/80 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium text-slate-900"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-4">Order #</th>
                <th className="py-4 px-4">Package</th>
                <th className="py-4 px-4 text-center">Quantity</th>
                <th className="py-4 px-4 text-right">Unit Cost</th>
                <th className="py-4 px-4 text-right">Total Paid</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-right">Date</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {ordersPagination.paginatedItems.map((o) => (
                <tr key={o.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-extrabold text-blue-700">
                    {o.orderNumber}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {o.productName}
                  </td>
                  <td className="py-4 px-4 text-center font-black text-slate-900">
                    {o.quantity}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500 font-semibold">
                    NOK {o.unitPrice}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                    NOK {o.total.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <CheckCircle2 className="w-3 h-3" />
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-slate-400 font-semibold">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => openOrderDetail(o)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-xl border border-blue-200/80 inline-flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View eSIMs</span>
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-2xl h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200 border-l border-white/80">
            <div className="p-6 border-b border-slate-200/80 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                  Order Summary
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedOrder.orderNumber}
                </h2>
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
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-4 shadow-2xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Package</span>
                  <span className="font-extrabold text-slate-900">{selectedOrder.productName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Quantity</span>
                  <span className="font-extrabold text-slate-900">{selectedOrder.quantity} units</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Total Paid</span>
                  <span className="font-black text-blue-700 text-sm">
                    NOK {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Payment</span>
                  <span className="font-extrabold text-emerald-700">Prepaid Wallet (Paid)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="font-black text-slate-900 text-sm">
                    Allocated eSIMs ({orderEsims.length})
                  </h3>
                  {orderEsims.length > 0 && (
                    <button
                      type="button"
                      onClick={() => exportOrderCsv(selectedOrder, orderEsims)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-extrabold border border-blue-200/80 hover:bg-blue-100/80 transition-all shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </button>
                  )}
                </div>

                {loadingEsims ? (
                  <div className="p-12 text-center text-slate-400 font-bold">Loading eSIMs...</div>
                ) : (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white/90 shadow-2xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider sticky top-0">
                        <tr>
                          <th className="p-3.5">ICCID</th>
                          <th className="p-3.5 text-center">Status</th>
                          <th className="p-3.5 text-right">QR / LPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {esimPagination.paginatedItems.map((esim) => (
                          <tr key={esim.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-slate-800">
                              {esim.iccid}
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                                {esim.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleShowQr(esim)}
                                className="text-blue-600 hover:text-blue-800 font-extrabold text-xs transition-colors"
                              >
                                View QR
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="p-3 border-t border-slate-100">
                      <TablePagination
                        currentPage={esimPagination.currentPage}
                        totalPages={esimPagination.totalPages}
                        totalItems={esimPagination.totalItems}
                        pageSize={esimPagination.pageSize}
                        onPageChange={esimPagination.setPage}
                        onPageSizeChange={esimPagination.setPageSize}
                        compact
                        pageSizeOptions={[5, 10, 20]}
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

      {/* QR preview */}
      {selectedQrEsim && qrDataUrl && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-white/90 animate-in zoom-in-95">
            <h4 className="font-black text-slate-900 text-sm mb-1">{selectedQrEsim.productName}</h4>
            <p className="font-mono text-xs text-slate-500 font-bold mb-4">{selectedQrEsim.iccid}</p>
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-2xl mb-5 shadow-inner border border-slate-100 p-2 bg-white" />
            <button
              type="button"
              onClick={() => setSelectedQrEsim(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-lg transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};