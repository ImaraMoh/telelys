"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Product, Retailer, Order } from "@/types";
import {
  Download,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const AdminReports: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      const [p, r, o] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getRetailers(),
        adminApi.getOrders(),
      ]);
      setProducts(p);
      setRetailers(r);
      setOrders(o);
    } catch (err) {
      console.error("Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const [p, r, o] = await Promise.all([
          adminApi.getProducts(),
          adminApi.getRetailers(),
          adminApi.getOrders(),
        ]);
        if (isMounted) {
          setProducts(p);
          setRetailers(r);
          setOrders(o);
        }
      } catch (err) {
        console.error("Failed to load report data:", err);
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

  // Compute sales by product
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (!productSalesMap[o.productName]) {
      productSalesMap[o.productName] = { name: o.productName, quantity: 0, revenue: 0 };
    }
    productSalesMap[o.productName].quantity += o.quantity;
    productSalesMap[o.productName].revenue += o.total;
  });
  const productSalesData = Object.values(productSalesMap);

  // Compute sales by retailer
  const retailerSalesMap: Record<string, { name: string; orders: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (!retailerSalesMap[o.retailerName]) {
      retailerSalesMap[o.retailerName] = { name: o.retailerName, orders: 0, revenue: 0 };
    }
    retailerSalesMap[o.retailerName].orders += 1;
    retailerSalesMap[o.retailerName].revenue += o.total;
  });
  const retailerSalesData = Object.values(retailerSalesMap);

  // Inventory distribution
  const stockDistribution = products.map((p) => ({
    name: p.name,
    stock: p.availableStock,
  }));

  const exportSalesCsv = () => {
    let csv = "OrderNumber,Retailer,Package,Quantity,TotalNOK,Date\n";
    orders.forEach((o) => {
      csv += `${o.orderNumber},"${o.retailerName}","${o.productName}",${o.quantity},${o.total},${new Date(o.createdAt).toLocaleDateString()}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telelys-sales-report.csv`;
    a.click();
  };

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
              Analytics Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Business Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Analytics & Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational reports covering retailer consumption, package sales, and inventory turnover.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={loadReportData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white/90 border border-slate-200/80 rounded-xl hover:bg-white hover:shadow-md transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={exportSalesCsv}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Product */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
          <h2 className="text-base font-black text-slate-900 mb-0.5">Revenue by Package (NOK)</h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">Total B2B turnover per eSIM product</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productSalesData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v} kr`}
                />
                <Tooltip
                  formatter={(val: unknown) => [`NOK ${Number(val).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    borderColor: "#E2E8F0",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Retailer */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
          <h2 className="text-base font-black text-slate-900 mb-0.5">Retailer Order Volume</h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">Purchases distributed across partner businesses</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retailerSalesData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [`NOK ${Number(val).toLocaleString()}`, "Total Spent"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    borderColor: "#E2E8F0",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Bar dataKey="revenue" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Available Stock Levels */}
      <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <h2 className="text-base font-black text-slate-900 mb-0.5">Available Warehouse Stock by SKU</h2>
        <p className="text-xs text-slate-500 mb-6 font-medium">Stock buffer ready for instant retailer purchase</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val: unknown) => [`${val} eSIMs`, "Available Stock"]}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  borderColor: "#E2E8F0",
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                }}
              />
              <Bar dataKey="stock" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};