"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api";
import type { Esim, Product, Retailer } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";

import {
  Upload,
  Plus,
  Search,
  QrCode,
  Download,
  X,
  RefreshCw,
  Copy,
  Check,
  Activity,
  Sparkles,
} from "lucide-react";

import QRCode from "qrcode";

export const AdminEsimStock: React.FC = () => {
  const { t } = useAuth();

  const [esims, setEsims] = useState<Esim[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");

  // Modals
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [selectedQrEsim, setSelectedQrEsim] = useState<Esim | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Single eSIM form
  const [singleForm, setSingleForm] = useState({
    productId: "",
    iccid: "",
    activationCode: "",
    qrCode: "",
  });

  // Bulk import
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<{
    totalRows: number;
    successfullyImported: number;
    failedRows: number;
    duplicateRows: number;
    errors: {
      row: number;
      iccid?: string;
      message: string;
    }[];
  } | null>(null);
  const [importing, setImporting] = useState(false);

  // Load stock data
  const loadStock = useCallback(async () => {
    try {
      setLoading(true);

      const [stockData, prodData, retData] = await Promise.all([
        adminApi.getEsims({
          status: statusFilter === "ALL" ? undefined : statusFilter,
          productId: productFilter === "ALL" ? undefined : productFilter,
        }),
        adminApi.getProducts(),
        adminApi.getRetailers(),
      ]);

      setEsims(stockData.esims ?? []);
      setSummary(stockData.summary ?? {});
      setProducts(prodData ?? []);
      setRetailers(retData ?? []);

      if (prodData?.length > 0 && !singleForm.productId) {
        setSingleForm((prev) => ({
          ...prev,
          productId: prodData[0].id,
        }));
      }
    } catch (err) {
      console.error("Failed to load eSIM stock:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, productFilter, singleForm.productId]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const [stockData, prodData, retData] = await Promise.all([
          adminApi.getEsims({
            status: statusFilter === "ALL" ? undefined : statusFilter,
            productId: productFilter === "ALL" ? undefined : productFilter,
          }),
          adminApi.getProducts(),
          adminApi.getRetailers(),
        ]);

        if (isMounted) {
          setEsims(stockData.esims ?? []);
          setSummary(stockData.summary ?? {});
          setProducts(prodData ?? []);
          setRetailers(retData ?? []);

          if (prodData?.length > 0 && !singleForm.productId) {
            setSingleForm((prev) => ({
              ...prev,
              productId: prodData[0].id,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load eSIM stock:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [statusFilter, productFilter]);

  // QR generation
  const handleViewQr = async (esim: Esim) => {
    setSelectedQrEsim(esim);
    setQrDataUrl(null);
    setCopied(false);

    try {
      const dataUrl = await QRCode.toDataURL(esim.activationCode, {
        width: 256,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      });

      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };

  // Clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Create single eSIM
  const handleCreateSingle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await adminApi.createEsim(singleForm);
      setShowSingleModal(false);
      setSingleForm({
        productId: products[0]?.id ?? "",
        iccid: "",
        activationCode: "",
        qrCode: "",
      });
      await loadStock();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add eSIM";
      alert(message);
    }
  };

  // Bulk import
  const handleProcessImport = async () => {
    if (!importText.trim()) {
      alert("Please paste CSV rows or use the sample template.");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const lines = importText
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const rows: {
        iccid: string;
        activationCode: string;
        qrCode?: string;
        productSku: string;
      }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (i === 0 && line.toLowerCase().includes("iccid")) {
          continue;
        }

        const parts = line
          .split(",")
          .map((part) => part.trim().replace(/^["']|["']$/g, ""));

        if (parts.length >= 2 && parts[0]) {
          const iccid = parts[0];
          const activationCode =
            parts[1] || `LPA:1$smdp.telelys.com$${iccid}`;

          rows.push({
            iccid,
            activationCode,
            productSku: parts[2] || "TEL-5GB-30D",
            qrCode: parts[3] || activationCode,
          });
        }
      }

      if (rows.length === 0) {
        throw new Error(
          "No valid CSV rows detected. Ensure columns are ICCID, ActivationCode, ProductSKU."
        );
      }

      const result = await adminApi.importEsims(rows);
      setImportResult(result);
      await loadStock();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      alert(message);
    } finally {
      setImporting(false);
    }
  };

  const loadSampleCsv = () => {
    const sample = `ICCID,ActivationCode,ProductSKU
894701202699900101,LPA:1$smdp.telelys.com$TEL-5GB-99901,TEL-5GB-30D
894701202699900102,LPA:1$smdp.telelys.com$TEL-5GB-99902,TEL-5GB-30D
894701202699900103,LPA:1$smdp.telelys.com$TEL-3GB-99903,TEL-3GB-15D
894701202699900104,LPA:1$smdp.telelys.com$TEL-10GB-99904,TEL-10GB-30D
894701202699900105,LPA:1$smdp.telelys.com$TEL-1GB-99905,TEL-1GB-7D`;

    setImportText(sample);
  };

  // Search filtering
  const normalizedSearch = search.trim().toLowerCase();
  const filteredEsims = esims.filter((esim) => {
    if (!normalizedSearch) return true;
    return (
      esim.iccid.toLowerCase().includes(normalizedSearch) ||
      (esim.productName?.toLowerCase().includes(normalizedSearch) ?? false) ||
      (esim.retailerName?.toLowerCase().includes(normalizedSearch) ?? false)
    );
  });

  const pagination = usePagination(filteredEsims, {
    initialPageSize: 10,
  });

  const getStatusClass = (status: Esim["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/80";
      case "RESERVED":
        return "bg-amber-50 text-amber-700 border border-amber-200/80";
      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border border-blue-200/80";
      case "SOLD":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200/80";
      case "ACTIVATED":
        return "bg-purple-50 text-purple-700 border border-purple-200/80";
      case "EXPIRED":
        return "bg-slate-100 text-slate-600 border border-slate-200/80";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200/80";
    }
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50/70 via-slate-50 to-indigo-50/50 p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Decorative Mesh Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-150 h-150 bg-linear-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-[-10%] -z-10 w-125 h-125 bg-linear-to-tr from-cyan-400/15 to-blue-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* =====================================================
          HEADER BAR
      ====================================================== */}
      <div className="relative overflow-hidden bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Activity className="w-3 h-3 animate-pulse" />
              Inventory Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• eSIM Stock Pool</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            eSIM Stock Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage eSIM credentials, bulk-load new stock, and monitor retailer assignments.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => {
              setImportResult(null);
              setShowImportModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white/90 border border-slate-200/80 rounded-xl hover:bg-white hover:shadow-md transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSingleModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single eSIM</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          SUMMARY METRIC CARDS WITH BUBBLES
      ====================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-lg shadow-blue-500/5 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Stock</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{summary.totalStock ?? 0}</span>
        </div>

        <div className="relative overflow-hidden bg-emerald-50/80 backdrop-blur-xl p-4 rounded-2xl border border-emerald-200/80 text-center shadow-lg shadow-emerald-500/5">
          <span className="text-[10px] uppercase font-extrabold text-emerald-700 block tracking-wider">Available</span>
          <span className="text-xl font-black text-emerald-800 mt-1 block">{summary.available ?? 0}</span>
        </div>

        <div className="relative overflow-hidden bg-blue-50/80 backdrop-blur-xl p-4 rounded-2xl border border-blue-200/80 text-center shadow-lg shadow-blue-500/5">
          <span className="text-[10px] uppercase font-extrabold text-blue-700 block tracking-wider">In Retailers</span>
          <span className="text-xl font-black text-blue-800 mt-1 block">{summary.assigned ?? 0}</span>
        </div>

        <div className="relative overflow-hidden bg-indigo-50/80 backdrop-blur-xl p-4 rounded-2xl border border-indigo-200/80 text-center shadow-lg shadow-indigo-500/5">
          <span className="text-[10px] uppercase font-extrabold text-indigo-700 block tracking-wider">Sold</span>
          <span className="text-xl font-black text-indigo-800 mt-1 block">{summary.sold ?? 0}</span>
        </div>

        <div className="relative overflow-hidden bg-purple-50/80 backdrop-blur-xl p-4 rounded-2xl border border-purple-200/80 text-center shadow-lg shadow-purple-500/5">
          <span className="text-[10px] uppercase font-extrabold text-purple-700 block tracking-wider">Activated</span>
          <span className="text-xl font-black text-purple-800 mt-1 block">{summary.activated ?? 0}</span>
        </div>

        <div className="relative overflow-hidden bg-amber-50/80 backdrop-blur-xl p-4 rounded-2xl border border-amber-200/80 text-center shadow-lg shadow-amber-500/5">
          <span className="text-[10px] uppercase font-extrabold text-amber-700 block tracking-wider">Reserved</span>
          <span className="text-xl font-black text-amber-800 mt-1 block">{summary.reserved ?? 0}</span>
        </div>

        <div className="relative overflow-hidden bg-slate-100/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-extrabold text-slate-500 block tracking-wider">Expired</span>
          <span className="text-xl font-black text-slate-700 mt-1 block">{summary.expired ?? 0}</span>
        </div>
      </div>

      {/* =====================================================
          FILTERS SECTION
      ====================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/75 backdrop-blur-2xl p-5 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search ICCID, package, or retailer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="ALL">All Packages</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="RESERVED">RESERVED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="SOLD">SOLD</option>
            <option value="ACTIVATED">ACTIVATED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button
            type="button"
            onClick={loadStock}
            className="p-2.5 text-slate-500 hover:text-slate-900 bg-white/90 border border-slate-200 rounded-xl transition-all hover:shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* =====================================================
          DATA TABLE SECTION
      ====================================================== */}
      <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-700">Loading eSIM stock inventory...</p>
          </div>
        ) : filteredEsims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">No eSIMs found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">No inventory matches your current search and filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-4 px-5">Package</th>
                    <th className="py-4 px-5">ICCID Number</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5">Assigned Retailer</th>
                    <th className="py-4 px-5">Order Ref</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {pagination.paginatedItems.map((esim) => (
                    <tr key={esim.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900">{esim.productName || "eSIM Package"}</div>
                        {esim.productSku && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{esim.productSku}</div>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-slate-700">{esim.iccid}</td>
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold shadow-xs ${getStatusClass(esim.status)}`}>
                          {esim.status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {esim.retailerName ? (
                          <span className="font-bold text-slate-900">{esim.retailerName}</span>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Telelys Stock Pool</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                        {esim.orderId ? esim.orderId.toUpperCase() : "—"}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewQr(esim)}
                          className="px-3 py-1.5 text-[11px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/80 inline-flex items-center gap-1.5 shadow-2xs transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          QR / LPA
                        </button>
                      </td>
                    </tr>
                  ))}
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
                pageSizeOptions={[10, 25, 50, 100]}
                itemLabel="eSIMs"
              />
            </div>
          </>
        )}
      </div>

      {/* ================================================================== */}
      {/* PREMIUM CONTAINED QR CODE MODAL */}
      {/* ================================================================== */}
      {selectedQrEsim && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 text-center my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Digital eSIM Voucher
              </span>
              <button
                type="button"
                onClick={() => setSelectedQrEsim(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Package & ICCID Info */}
            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 leading-snug">
                {selectedQrEsim.productName || "eSIM Package"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ICCID: <span className="font-mono font-bold text-slate-800">{selectedQrEsim.iccid}</span>
              </p>
            </div>

            {/* QR Code Frame Container */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/80 inline-block mb-4 shadow-inner">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="eSIM QR Code" className="w-40 h-40 mx-auto rounded-xl shadow-xs" />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400 font-bold animate-pulse">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Activation Code Box */}
            <div className="text-left bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 mb-4 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                  Activation Code (LPA)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedQrEsim.activationCode)}
                  className="text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-slate-800 break-all text-[10px] select-all bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs leading-relaxed">
                {selectedQrEsim.activationCode}
              </p>
            </div>

            {/* Status & Metadata Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-5 px-1 font-semibold bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/60">
              <span>Status: <strong className="text-slate-900">{selectedQrEsim.status}</strong></span>
              {selectedQrEsim.retailerName && (
                <span className="truncate max-w-[150px]">Owner: <strong className="text-slate-900">{selectedQrEsim.retailerName}</strong></span>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`telelys-esim-${selectedQrEsim.iccid}.png`}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download QR
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedQrEsim(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* BULK IMPORT MODAL */}
      {/* ================================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">Bulk eSIM Inventory Import</h3>
                <p className="text-xs text-slate-500 mt-0.5">Paste CSV with ICCID, ActivationCode, and ProductSKU.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Paste CSV Contents</span>
                <button
                  type="button"
                  onClick={loadSampleCsv}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  Load Sample Template
                </button>
              </div>

              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`ICCID,ActivationCode,ProductSKU\n894701202611122233,LPA:1$smdp.telelys.com$TEST01,TEL-5GB-30D`}
                className="w-full p-3.5 border border-slate-200 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none bg-slate-50/50"
              />

              {importResult && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Rows</span>
                      <span className="font-black text-slate-900">{importResult.totalRows}</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60 shadow-xs">
                      <span className="text-emerald-700 text-[10px] uppercase font-bold block">Imported</span>
                      <span className="font-black text-emerald-800">{importResult.successfullyImported}</span>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 shadow-xs">
                      <span className="text-amber-700 text-[10px] uppercase font-bold block">Duplicates</span>
                      <span className="font-black text-amber-800">{importResult.duplicateRows}</span>
                    </div>
                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200/60 shadow-xs">
                      <span className="text-rose-700 text-[10px] uppercase font-bold block">Failed</span>
                      <span className="font-black text-rose-800">{importResult.failedRows}</span>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                      <span className="font-bold text-slate-700 block mb-1">Row Validation Notes:</span>
                      {importResult.errors.map((error, index) => (
                        <p key={`${error.row}-${index}`} className="text-rose-600 text-[11px] font-medium">
                          • Row {error.row}: {error.message} {error.iccid ? `(${error.iccid})` : ""}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={importing}
                  onClick={handleProcessImport}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {importing ? "Validating & Importing..." : "Validate & Import eSIMs"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SINGLE eSIM MODAL */}
      {/* ================================================================== */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">Register Single eSIM</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add an eSIM directly to Telelys stock.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSingleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign to Package *</label>
                <select
                  required
                  value={singleForm.productId}
                  onChange={(e) =>
                    setSingleForm((prev) => ({
                      ...prev,
                      productId: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-white/90 focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs font-semibold text-slate-800"
                >
                  <option value="" disabled>Select package</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ICCID *</label>
                <input
                  type="text"
                  required
                  minLength={18}
                  maxLength={22}
                  placeholder="8947012026..."
                  value={singleForm.iccid}
                  onChange={(e) => {
                    const iccid = e.target.value.replace(/\D/g, "").slice(0, 22);
                    setSingleForm((prev) => ({
                      ...prev,
                      iccid,
                      activationCode:
                        prev.activationCode || (iccid ? `LPA:1$smdp.telelys.com$${iccid}` : ""),
                    }));
                  }}
                  className="w-full p-3 border border-slate-200 rounded-2xl font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs bg-white/90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activation Code (LPA) *</label>
                <input
                  type="text"
                  required
                  placeholder="LPA:1$smdp.telelys.com$..."
                  value={singleForm.activationCode}
                  onChange={(e) =>
                    setSingleForm((prev) => ({
                      ...prev,
                      activationCode: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-slate-200 rounded-2xl font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs bg-white/90"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!singleForm.productId || !singleForm.iccid || !singleForm.activationCode}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Add to Available Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};