"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Inquiry } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  X,
  RefreshCw,
  User,
  ShieldCheck,
  Activity,
  Sparkles,
} from "lucide-react";

export const AdminInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected thread
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const loadInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getInquiries();
      setInquiries(data);
      if (selectedInquiry) {
        const updated = data.find((i) => i.id === selectedInquiry.id);
        if (updated) setSelectedInquiry(updated);
      }
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedInquiry]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await adminApi.getInquiries();
        if (isMounted) {
          setInquiries(data);
        }
      } catch (err) {
        console.error("Failed to load inquiries:", err);
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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;
    setSending(true);
    try {
      const updated = await adminApi.replyInquiry(selectedInquiry.id, replyText.trim());
      setSelectedInquiry(updated);
      setReplyText("");
      await loadInquiries();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reply";
      alert(message);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: Inquiry["status"]) => {
    if (!selectedInquiry) return;
    try {
      const updated = await adminApi.updateInquiryStatus(selectedInquiry.id, status);
      setSelectedInquiry(updated);
      await loadInquiries();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      alert(message);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.inquiryNumber.toLowerCase().includes(search.toLowerCase()) ||
      inq.subject.toLowerCase().includes(search.toLowerCase()) ||
      inq.retailerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pagination = usePagination(filteredInquiries, { initialPageSize: 10 });

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
              Support Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Retailer Inquiries</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support & Inquiries</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Respond to retailer questions regarding eSIM inventory, technical activation, or billing.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={loadInquiries}
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
            placeholder="Search subject, retailer, or inquiry #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-bold mr-1">Status:</span>
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/90 text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900"
              }`}
            >
              {st === "IN_PROGRESS" ? "IN PROGRESS" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table & Active Conversation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List */}
        <div
          className={`${
            selectedInquiry ? "lg:col-span-5" : "lg:col-span-12"
          } bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden transition-all`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-5">Ticket</th>
                  <th className="py-4 px-5">Retailer</th>
                  {!selectedInquiry && <th className="py-4 px-5">Category</th>}
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {pagination.paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">
                      No support inquiries found.
                    </td>
                  </tr>
                ) : (
                  pagination.paginatedItems.map((inq) => {
                    const isSelected = selectedInquiry?.id === inq.id;
                    return (
                      <tr
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/80 font-semibold" : "hover:bg-blue-50/40"
                        }`}
                      >
                        <td className="py-4 px-5">
                          <span className="font-extrabold text-slate-900 block line-clamp-1">{inq.subject}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{inq.inquiryNumber}</span>
                        </td>

                        <td className="py-4 px-5 font-bold text-slate-900">{inq.retailerName}</td>

                        {!selectedInquiry && (
                          <td className="py-4 px-5 text-slate-600">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 text-[10px] font-extrabold">
                              {inq.category}
                            </span>
                          </td>
                        )}

                        <td className="py-4 px-5 text-center">
                          <span
                            className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs ${
                              inq.status === "OPEN"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : inq.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right text-slate-400 font-semibold text-[11px]">
                          {new Date(inq.updatedAt).toLocaleDateString()}
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
              compact
              pageSizeOptions={[5, 10, 20]}
              itemLabel="inquiries"
            />
          </div>
        </div>

        {/* Selected Thread Drawer / Panel */}
        {selectedInquiry && (
          <div className="lg:col-span-7 bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 flex flex-col h-[650px] overflow-hidden">
            {/* Thread Header */}
            <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-white/50">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {selectedInquiry.inquiryNumber}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-800">{selectedInquiry.retailerName}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedInquiry.subject}</h3>
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-2.5">
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as unknown as Inquiry["status"])}
                  className="text-xs font-bold p-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs"
                >
                  <option value="OPEN">Mark OPEN</option>
                  <option value="IN_PROGRESS">Mark IN PROGRESS</option>
                  <option value="RESOLVED">Mark RESOLVED</option>
                  <option value="CLOSED">Mark CLOSED</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
              {selectedInquiry.messages.map((m) => {
                const isAdmin = m.senderType === "ADMIN";
                return (
                  <div key={m.id} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1 font-bold">
                      {isAdmin ? (
                        <>
                          <span className="text-purple-700 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {m.senderName} (Telelys)
                          </span>
                          <span>• {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-700">{m.senderName}</span>
                          <span>• {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </>
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-2xl max-w-md text-xs shadow-sm ${
                        isAdmin
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed font-medium">{m.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200/80 bg-white/90 backdrop-blur-md">
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Type an official response to the retailer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};