"use client";

import React, { useState, useEffect, useCallback } from "react";
import { retailerApi } from "@/lib/api";
import { Inquiry } from "@/types";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Plus,
  Send,
  X,
  ShieldCheck,
  Activity,
} from "lucide-react";

export const RetailerInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // New ticket modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForm, setNewForm] = useState({
    subject: "",
    category: "Stock" as Inquiry["category"],
    message: "",
  });

  const loadInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await retailerApi.getInquiries();
      setInquiries(data);
      setSelectedInquiry((prev) => {
        if (!prev) return null;
        const updated = data.find((i) => i.id === prev.id);
        return updated || prev;
      });
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
        const data = await retailerApi.getInquiries();
        if (isMounted) {
          setInquiries(data);
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

  const pagination = usePagination(inquiries, { initialPageSize: 10 });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;
    setSending(true);
    try {
      const updated = await retailerApi.replyInquiry(selectedInquiry.id, replyText.trim());
      setSelectedInquiry(updated);
      setReplyText("");
      await loadInquiries();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      alert(message);
    } finally {
      setSending(false);
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await retailerApi.createInquiry(newForm);
      setShowCreateModal(false);
      setNewForm({ subject: "", category: "Stock", message: "" });
      setSelectedInquiry(created);
      await loadInquiries();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create inquiry";
      alert(message);
    }
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
              Support Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• Retailer Assistance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support & Inquiries</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Send messages directly to Telelys Operations for package provisioning or billing queries.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Inquiry</span>
          </button>
        </div>
      </div>

      {/* Tickets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inquiries list */}
        <div
          className={`${
            selectedInquiry ? "lg:col-span-5" : "lg:col-span-12"
          } bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden transition-all flex flex-col justify-between`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-4">Ticket</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {pagination.totalItems === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400 font-medium">
                      No support tickets yet. Click &quot;New Inquiry&quot; to contact Telelys.
                    </td>
                  </tr>
                ) : (
                  pagination.paginatedItems.map((inq) => {
                    const isSelected = selectedInquiry?.id === inq.id;
                    return (
                      <tr
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "bg-blue-50/80 font-bold" : "hover:bg-blue-50/40"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-slate-900 block line-clamp-1">
                            {inq.subject}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">
                            {inq.inquiryNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-extrabold border border-slate-200/60">
                            {inq.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                              inq.status === "OPEN"
                                ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                                : inq.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-slate-400 text-[11px] font-semibold">
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
          <div className="lg:col-span-7 bg-white/85 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-xl shadow-blue-500/5 flex flex-col h-155 overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-blue-600">
                    {selectedInquiry.inquiryNumber}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    {selectedInquiry.category}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base mt-0.5">
                  {selectedInquiry.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              {selectedInquiry.messages.map((m) => {
                const isRetailer = m.senderType === "RETAILER";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isRetailer ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-1 px-1">
                      {!isRetailer ? (
                        <span className="font-extrabold text-purple-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Telelys Operations
                        </span>
                      ) : (
                        <span className="font-extrabold text-slate-700">You ({m.senderName})</span>
                      )}
                      <span>• {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div
                      className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed ${
                        isRetailer
                          ? "bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-500/15 font-medium"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs font-medium"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200/80 bg-white/90 backdrop-blur-md">
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Reply to Telelys Operations..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs font-semibold border border-slate-200 rounded-2xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* New Inquiry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">New Message to Telelys</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Submit a new support ticket.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request for additional 10GB package stock"
                  value={newForm.subject}
                  onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newForm.category}
                  onChange={(e) =>
                    setNewForm({ ...newForm, category: e.target.value as Inquiry["category"] })
                  }
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-white/90 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="Stock">Stock & Packages</option>
                  <option value="Order">Order Inquiry</option>
                  <option value="Billing">Billing & Wallet</option>
                  <option value="Technical">Technical & Activation</option>
                  <option value="General">General Question</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your request or question clearly..."
                  value={newForm.message}
                  onChange={(e) => setNewForm({ ...newForm, message: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90 font-medium resize-none text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};