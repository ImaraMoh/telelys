"use client";

import React, { useState, useEffect } from "react";
import { retailerApi } from "@/lib/api";
import { Esim, Order } from "@/types";
import { Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const RetailerReports: React.FC = () => {
  const [esims, setEsims] = useState<Esim[]>([]);
  const [, setOrders] = useState<Order[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([retailerApi.getMyStock(), retailerApi.getOrders()])
      .then(([s, o]) => {
        if (isMounted) {
          setEsims(s);
          setOrders(o);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute stock by package
  const packageMap: Record<string, { name: string; inStock: number; sold: number }> = {};
  esims.forEach((e) => {
    const pName = e.productName || "eSIM Package";
    if (!packageMap[pName]) {
      packageMap[pName] = { name: pName, inStock: 0, sold: 0 };
    }
    if (e.status === "ASSIGNED") {
      packageMap[pName].inStock += 1;
    } else {
      packageMap[pName].sold += 1;
    }
  });
  const chartData = Object.values(packageMap);

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
              Analytics Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Retailer Reports</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales & Inventory Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Breakdown of your purchased packages and customer distribution status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 mb-1">Package Distribution</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Inventory ready vs. delivered to customers</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
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
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "16px",
                      borderColor: "#E2E8F0",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="inStock" name="In My Inventory" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="sold" name="Supplied to Customers" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white/75 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 mb-1">Lifetime Wholesale Summary</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Your account metrics with Telelys</p>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                <span className="text-slate-600 font-medium">Total eSIMs Ordered:</span>
                <span className="font-black text-slate-900 text-sm">{esims.length} units</span>
              </div>
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center justify-between shadow-2xs">
                <span className="text-blue-700 font-semibold">Currently in Stock:</span>
                <span className="font-black text-blue-900 text-sm">
                  {esims.filter((e) => e.status === "ASSIGNED").length} units
                </span>
              </div>
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between shadow-2xs">
                <span className="text-emerald-700 font-semibold">Supplied to End Users:</span>
                <span className="font-black text-emerald-900 text-sm">
                  {esims.filter((e) => e.status === "SOLD" || e.status === "ACTIVATED").length} units
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};