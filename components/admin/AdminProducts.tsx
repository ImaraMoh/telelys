"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Plus,
  Search,
  Edit2,
  Cpu,
  X,
  RefreshCw,
  Activity,
} from "lucide-react";

export const AdminProducts: React.FC = () => {
  const { setActiveTab } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<{
    name: string;
    sku: string;
    type: Product["type"];
    dataAmount: number;
    dataUnit: Product["dataUnit"];
    validity: number;
    validityUnit: Product["validityUnit"];
    costPrice: number;
    retailerPrice: number;
    suggestedPrice: number;
    currency: string;
    description: string;
    status: Product["status"];
  }>({
    name: "",
    sku: "",
    type: "ESIM",
    dataAmount: 5,
    dataUnit: "GB",
    validity: 30,
    validityUnit: "DAYS",
    costPrice: 100,
    retailerPrice: 130,
    suggestedPrice: 160,
    currency: "NOK",
    description: "",
    status: "ACTIVE",
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await adminApi.getProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
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

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      sku: "",
      type: "ESIM",
      dataAmount: 5,
      dataUnit: "GB",
      validity: 30,
      validityUnit: "DAYS",
      costPrice: 100,
      retailerPrice: 130,
      suggestedPrice: 160,
      currency: "NOK",
      description: "",
      status: "ACTIVE",
    });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      type: p.type,
      dataAmount: p.dataAmount,
      dataUnit: p.dataUnit,
      validity: p.validity,
      validityUnit: p.validityUnit,
      costPrice: p.costPrice,
      retailerPrice: p.retailerPrice,
      suggestedPrice: p.suggestedPrice,
      currency: p.currency,
      description: p.description,
      status: p.status,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await adminApi.updateProduct(p.id, { status: newStatus });
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, status: newStatus } : item))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to toggle status";
      alert(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, form);
      } else {
        await adminApi.createProduct(form);
      }
      setShowModal(false);
      await loadProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      alert(message);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const pagination = usePagination(filteredProducts, { initialPageSize: 10 });

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
              Inventory Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Master Packages</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">eSIM Master Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure global eSIM packages, wholesale retailer pricing, and track live available stock.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Package</span>
          </button>
        </div>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/75 backdrop-blur-2xl p-5 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search package name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600 font-bold bg-white/90 px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
            Total Packages: <span className="font-black text-blue-600 ml-1">{products.length}</span>
          </div>
          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-900 bg-white/90 border border-slate-200 rounded-xl transition-all hover:shadow-xs disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-5">Package</th>
                <th className="py-4 px-5">Data & Validity</th>
                <th className="py-4 px-5 text-right">Telelys Cost</th>
                <th className="py-4 px-5 text-right">Retailer Price</th>
                <th className="py-4 px-5 text-right">Margin / Unit</th>
                <th className="py-4 px-5 text-center">Available Stock</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {pagination.paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-medium">
                    No eSIM packages found.
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((p) => {
                  const margin = p.retailerPrice - p.costPrice;
                  const marginPercent = p.costPrice > 0 ? Math.round((margin / p.costPrice) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-4 px-5">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm block">{p.name}</span>
                          <span className="font-mono text-[11px] text-slate-400 font-bold">{p.sku}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-extrabold text-slate-900">
                          {p.dataAmount} {p.dataUnit}
                        </span>
                        <span className="text-slate-400 block text-[11px] font-semibold">
                          {p.validity} {p.validityUnit.toLowerCase()}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right font-semibold text-slate-600">NOK {p.costPrice}</td>

                      <td className="py-4 px-5 text-right">
                        <span className="font-black text-blue-700 text-sm block">NOK {p.retailerPrice}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Suggest: NOK {p.suggestedPrice}</span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <span className="font-extrabold text-emerald-600 block">+NOK {margin}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-bold inline-block mt-0.5">
                          +{marginPercent}%
                        </span>
                      </td>

                      <td className="py-4 px-5 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-xs shadow-2xs">
                          <Cpu className="w-3.5 h-3.5 text-blue-600" />
                          <span>{p.availableStock || 0}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all shadow-xs ${
                            p.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {p.status === "ACTIVE" ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-slate-200/80 bg-white transition-all shadow-2xs"
                            title="Edit package"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("esim-stock")}
                            className="px-3 py-1.5 text-[11px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/80 transition-all shadow-2xs"
                            title="View & load stock"
                          >
                            Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
            itemLabel="packages"
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {editingProduct ? "Edit eSIM Package" : "Create New eSIM Package"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Define global data bucket and B2B wholesale pricing.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5GB / 30 Days"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="TEL-5GB-30D"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-2xl uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.dataAmount}
                      onChange={(e) => setForm({ ...form, dataAmount: Number(e.target.value) })}
                      className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-bold"
                    />
                    <select
                      value={form.dataUnit}
                      onChange={(e) => setForm({ ...form, dataUnit: e.target.value as unknown as typeof form.dataUnit })}
                      className="p-3 border border-slate-200 rounded-2xl bg-white/90 font-bold text-slate-800"
                    >
                      <option value="GB">GB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.validity}
                      onChange={(e) => setForm({ ...form, validity: Number(e.target.value) })}
                      className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-bold"
                    />
                    <select
                      value={form.validityUnit}
                      disabled
                      className="p-3 border border-slate-200 rounded-2xl bg-slate-100 font-bold text-slate-500 cursor-not-allowed"
                    >
                      <option value="DAYS">Days</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Matrix */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 shadow-inner">
                <span className="font-black text-slate-800 block text-[11px] uppercase tracking-wider">
                  Pricing Matrix (NOK)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-bold">Internal Cost</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.costPrice}
                      onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold bg-white text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-bold">Retailer Price</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.retailerPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          retailerPrice: Number(e.target.value),
                          suggestedPrice: Math.round(Number(e.target.value) * 1.25),
                        })
                      }
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-black text-blue-700 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-bold">Suggested Customer</label>
                    <input
                      type="number"
                      value={form.suggestedPrice}
                      onChange={(e) => setForm({ ...form, suggestedPrice: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-700 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="General package description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-medium resize-none"
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
                  {editingProduct ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};