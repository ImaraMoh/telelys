"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api";
import type {
  DashboardStatsAdmin,
  Order,
  Inquiry,
  Product,
} from "@/types";
import { useAuth } from "@/context/AuthContext";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";

import {
  Users,
  Cpu,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Activity,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export const AdminDashboard: React.FC = () => {
  const { setActiveTab, t } = useAuth();

  const [stats, setStats] = useState<DashboardStatsAdmin | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [topProducts, setTopProducts] = useState<
    {
      name: string;
      unitsSold: number;
      revenue: number;
    }[]
  >([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  const [revenueTimeframe, setRevenueTimeframe] = useState<
    "7D" | "30D" | "3M" | "12M"
  >("30D");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.getDashboard();
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setRecentInquiries(data.recentInquiries);
      setTopProducts(data.topProducts);
      setLowStockProducts(data.lowStockProducts);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Use an async IIFE inside useEffect to avoid sync setState in effect linter triggers
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setRefreshing(true);
        const data = await adminApi.getDashboard();
        if (isMounted) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setRecentInquiries(data.recentInquiries);
          setTopProducts(data.topProducts);
          setLowStockProducts(data.lowStockProducts);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const revenueChartData = [
    { period: "Week 1", revenue: 42000, orders: 120 },
    { period: "Week 2", revenue: 68500, orders: 195 },
    { period: "Week 3", revenue: 89200, orders: 250 },
    { period: "Week 4", revenue: 114500, orders: 310 },
    { period: "Week 5", revenue: 135800, orders: 390 },
    { period: "Current", revenue: 158400, orders: 440 },
  ];

  const orderStatusData = [
    { status: "Completed", count: stats?.retailerOrders || 0 },
    { status: "Pending", count: 1 },
    { status: "Cancelled", count: 0 },
    { status: "Refunded", count: 0 },
  ];

  const ordersPagination = usePagination(recentOrders, {
    initialPageSize: 5,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/50">
        <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-200/80">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Loading Telelys Operations data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50/70 via-slate-50 to-indigo-50/50 p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Decorative Mesh Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-150 h-150 bg-linear-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-[-10%] -z-10 w-125 h-125 bg-linear-to-tr from-cyan-400/15 to-blue-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* =====================================================
          DASHBOARD HEADER BAR
      ====================================================== */}
      <div className="relative overflow-hidden bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Activity className="w-3 h-3 animate-pulse" />
              Live Operations
            </span>
            <span className="text-xs font-semibold text-slate-500">• B2B Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Telelys Management Suite
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Advanced real-time oversight of global eSIM inventory, retailer accounts, and financial performance.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white/90 border border-slate-200/80 rounded-xl hover:bg-white hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? "animate-spin" : ""}`} />
            <span>{t.refresh}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Manage Stock</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          LOW STOCK WARNING BANNER
      ====================================================== */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 backdrop-blur-xl border border-amber-200/90 flex items-start gap-3.5 shadow-lg shadow-amber-500/5">
          <div className="p-2 bg-amber-500 text-white rounded-xl mt-0.5 shadow-sm shadow-amber-500/30">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Low eSIM Inventory Stock Notice
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab("stock")}
                className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
              >
                Upload Stock
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              The following packages have available inventory at or below threshold limits:
            </p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {lowStockProducts.map((product) => (
                <span
                  key={product.id}
                  className="px-3 py-1 bg-white/90 border border-amber-300/80 rounded-xl text-xs font-semibold text-amber-950 shadow-xs"
                >
                  {product.name} — <strong className="text-rose-600">{product.availableStock ?? 0} left</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PREMIUM KPI CARDS WITH FLOATING GLOW BUBBLES
      ====================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Retailers */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-linear-to-br from-blue-500/20 to-cyan-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Retailers
            </span>
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {stats?.totalRetailers ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-600">
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                {stats?.activeRetailers ?? 0} active
              </span>
              <span>across global markets</span>
            </div>
          </div>
        </div>

        {/* Available eSIM Stock */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-linear-to-br from-indigo-500/20 to-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available eSIM Stock
            </span>
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {stats?.availableEsimStock?.toLocaleString() ?? "0"}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-600">
              <span className="text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md font-semibold">
                {stats?.totalEsimProducts ?? 0} Packages
              </span>
            </div>
          </div>
        </div>

        {/* Retailer Orders */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-linear-to-br from-emerald-500/20 to-teal-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Retailer Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {stats?.retailerOrders ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Fulfilled seamlessly</span>
            </div>
          </div>
        </div>

        {/* Total B2B Revenue */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-linear-to-br from-purple-500/20 to-indigo-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total B2B Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stats?.currency ?? "NOK"} {stats?.totalSales?.toLocaleString() ?? "0"}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-purple-700">
              <span className="bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md">
                {stats?.openInquiries ?? 0} open inquiries
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ANALYTICS CHARTS SECTION
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview */}
        <div className="lg:col-span-2 bg-white/75 backdrop-blur-2xl p-7 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Revenue Overview
              </h2>
              <p className="text-xs text-slate-500">
                B2B eSIM distribution turnover ({stats?.currency ?? "NOK"})
              </p>
            </div>

            <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl text-xs font-bold border border-slate-200/80">
              {(["7D", "30D", "3M", "12M"] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  type="button"
                  onClick={() => setRevenueTimeframe(timeframe)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    revenueTimeframe === timeframe
                      ? "bg-white text-blue-700 shadow-md font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {timeframe === "7D" ? "7 Days" : timeframe === "30D" ? "30 Days" : timeframe === "3M" ? "3 Months" : "12 Months"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="telelysRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
                <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} fontWeight={600} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} fontWeight={600} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [`${stats?.currency ?? "NOK"} ${Number(value).toLocaleString()}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "16px", borderColor: "#CBD5E1", fontSize: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#telelysRevenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Overview */}
        <div className="bg-white/75 backdrop-blur-2xl p-7 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Orders Breakdown</h2>
            <p className="text-xs text-slate-500 mb-4">Fulfillment status pipeline</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
                  <XAxis dataKey="status" stroke="#64748B" fontSize={11} tickLine={false} fontWeight={600} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} fontWeight={600} />
                  <Tooltip
                    formatter={(value) => [value, "Orders"]}
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "16px", borderColor: "#CBD5E1", fontSize: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", fontWeight: 600 }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Completed Orders:</span>
            <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/60">
              {stats?.retailerOrders ?? 0} orders
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          TOP PRODUCTS + RECENT ORDERS SECTION
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white/75 backdrop-blur-2xl p-7 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-slate-900">Top Products</h2>
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              All Packages →
            </button>
          </div>

          <div className="space-y-3.5">
            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No product sales data available.</div>
            ) : (
              topProducts.map((product, index) => (
                <div key={`${product.name}-${index}`} className="flex items-center justify-between p-4 rounded-2xl bg-white/80 border border-slate-200/70 hover:shadow-md transition-all">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{product.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{product.unitsSold} units supplied</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">
                      {stats?.currency ?? "NOK"} {product.revenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block mt-0.5">
                      B2B Revenue
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/75 backdrop-blur-2xl p-7 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-slate-900">Recent Retailer Orders</h2>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              View All Orders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="pb-3.5">Order ID</th>
                  <th className="pb-3.5">Retailer</th>
                  <th className="pb-3.5">Package</th>
                  <th className="pb-3.5 text-center">Quantity</th>
                  <th className="pb-3.5 text-right">Amount</th>
                  <th className="pb-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {ordersPagination.paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  ordersPagination.paginatedItems.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-4 font-extrabold text-blue-600">{order.orderNumber}</td>
                      <td className="py-4 font-bold text-slate-900">{order.retailerName}</td>
                      <td className="py-4 text-slate-600 font-medium">{order.productName}</td>
                      <td className="py-4 text-center font-bold">{order.quantity}</td>
                      <td className="py-4 text-right font-black text-slate-900">
                        {order.currency ?? stats?.currency ?? "NOK"} {order.total.toLocaleString()}
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold border shadow-xs ${
                            order.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : order.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : order.status === "CANCELLED"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <TablePagination
              currentPage={ordersPagination.currentPage}
              totalPages={ordersPagination.totalPages}
              totalItems={ordersPagination.totalItems}
              pageSize={ordersPagination.pageSize}
              onPageChange={ordersPagination.setPage}
              onPageSizeChange={ordersPagination.setPageSize}
              compact
              pageSizeOptions={[5, 10, 20]}
              itemLabel="orders"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          RECENT INQUIRIES SECTION
      ====================================================== */}
      <div className="bg-white/75 backdrop-blur-2xl p-7 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Recent Retailer Messages</h2>
            <p className="text-xs text-slate-500">Retailer inquiries and communication support channels</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            All Messages →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentInquiries.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 py-12 text-center text-xs text-slate-400 font-medium">
              No recent retailer inquiries.
            </div>
          ) : (
            recentInquiries.map((inquiry) => {
              const latestMessage = inquiry.messages?.[inquiry.messages.length - 1];
              return (
                <div
                  key={inquiry.id}
                  onClick={() => setActiveTab("inquiries")}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-white/90 hover:bg-white transition-all cursor-pointer shadow-xs hover:shadow-xl group"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">{inquiry.inquiryNumber}</span>
                    <span
                      className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full border ${
                        inquiry.status === "OPEN"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : inquiry.status === "IN_PROGRESS"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : inquiry.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {inquiry.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                    {inquiry.subject}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 font-medium">
                    {latestMessage?.message ?? "No messages yet."}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                    <span className="font-bold text-slate-800">{inquiry.retailerName}</span>
                    <span className="font-semibold">{inquiry.category}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};