"use client";

import React, { useState, useEffect } from "react";
import { retailerApi } from "@/lib/api";
import { DashboardStatsRetailer, Order, Inquiry } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Wallet,
  Cpu,
  ShoppingBag,
  Plus,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react";

interface RetailerDashboardProps {
  onOpenWalletModal?: () => void;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({ onOpenWalletModal }) => {
  const { retailer, setActiveTab, t } = useAuth();
  const [stats, setStats] = useState<DashboardStatsRetailer | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial data fetch handler
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await retailerApi.getDashboard();
        if (isMounted) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setRecentInquiries(data.recentInquiries);
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

  const ordersPagination = usePagination(recentOrders, { initialPageSize: 5 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Loading your retailer portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50/70 via-slate-50 to-indigo-50/50 p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Decorative Mesh Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-150 h-150 bg-linear-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-[-10%] -z-10 w-125 h-125 bg-linear-to-tr from-cyan-400/15 to-blue-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Activity className="w-3 h-3 animate-pulse" />
              Retailer Portal
            </span>
            <span className="text-xs font-semibold text-slate-500">• B2B Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.welcomeBack}, {retailer?.businessName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage your eSIM package inventory, buy wholesale stock from Telelys, and supply codes to customers.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.buyEsims}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Wallet Balance */}
        <div className="bg-linear-to-tr from-slate-900 via-slate-800 to-blue-950 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider">
                {t.availableBalance}
              </span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black tracking-tight">
                NOK {(stats?.availableBalance ?? stats?.balance ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-700/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-medium">Prepaid purchasing credit</span>
            {onOpenWalletModal && (
              <button
                type="button"
                onClick={onOpenWalletModal}
                className="text-xs font-bold text-blue-300 hover:text-white underline flex items-center gap-1 transition-colors"
              >
                Add Funds <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* My eSIM Inventory */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">In My Inventory</span>
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {stats?.myStockCount ?? stats?.activeStockCount ?? stats?.esimStockCount ?? 0} units
              </span>
            </div>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Ready to distribute</span>
            <button
              type="button"
              onClick={() => setActiveTab("stock")}
              className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View Stock →
            </button>
          </div>
        </div>

        {/* Sold to Customers */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Sold to Customers</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {stats?.soldEsimCount ?? stats?.soldStockCount ?? 0} units
              </span>
            </div>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100 text-xs text-emerald-600 font-extrabold">
            Active customer lines
          </div>
        </div>

        {/* Total Wholesale Orders */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Orders Placed</span>
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {stats?.totalOrders}
              </span>
            </div>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Total Spent: <strong className="text-slate-900 font-black">NOK {stats?.totalPurchases.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Quick Action Promo Card */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-7 shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <h2 className="text-lg font-black tracking-tight">Instant Wholesale eSIM Provisioning</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl font-medium leading-relaxed">
            Need more inventory for your travelers or telecom clients? Choose from Telelys packages
            (1GB to 20GB). Instant delivery to your account upon confirmation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className="px-6 py-3 bg-white hover:bg-blue-50 text-blue-800 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95"
        >
          <span>{t.browseProductsCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Orders & Stock Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">My Recent Orders</h2>
                <p className="text-xs text-slate-500 font-medium">Latest package purchases</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors"
              >
                All Orders →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Package</th>
                    <th className="py-3.5 px-4 text-center">Quantity</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {ordersPagination.paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        No recent orders found.
                      </td>
                    </tr>
                  ) : (
                    ordersPagination.paginatedItems.map((o) => (
                      <tr key={o.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-blue-700 font-mono">{o.orderNumber}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{o.productName}</td>
                        <td className="py-3.5 px-4 text-center font-black">{o.quantity}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                          NOK {o.total.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
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

        {/* Quick Help & Messages */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">Telelys Support</h2>
                <p className="text-xs text-slate-500 font-medium">Direct operations desk</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("inquiries")}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors"
              >
                New Ticket
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Direct connection to Telelys network operations for inventory questions or line support.
            </p>

            <div className="space-y-3">
              {recentInquiries.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center text-slate-400 text-xs font-medium">
                  No recent support tickets.
                </div>
              ) : (
                recentInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => setActiveTab("inquiries")}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-white/90 hover:bg-blue-50/40 cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900 line-clamp-1">
                        {inq.subject}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                        {inq.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Updated {new Date(inq.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className="w-full mt-6 py-3 border border-slate-200/80 text-slate-700 hover:bg-white rounded-2xl text-xs font-bold transition-all shadow-2xs"
          >
            Contact Telelys Operations
          </button>
        </div>
      </div>
    </div>
  );
};