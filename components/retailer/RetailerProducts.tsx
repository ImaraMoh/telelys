"use client";

import React, { useState, useEffect, useCallback } from "react";
import { retailerApi } from "@/lib/api";
import { Product, Order } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Cpu,
  Wallet,
  CheckCircle2,
  AlertCircle,
  X,
  Activity,
} from "lucide-react";

interface RetailerProductsProps {
  onOpenWalletModal?: () => void;
}

export const RetailerProducts: React.FC<RetailerProductsProps> = ({ onOpenWalletModal }) => {
  const { retailer, refreshMe, setActiveTab } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);

  // Purchase Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(5);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccessOrder, setPurchaseSuccessOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await retailerApi.getProducts();
      setProducts(data);
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
        const data = await retailerApi.getProducts();
        if (isMounted) {
          setProducts(data);
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

  const openPurchaseModal = (p: Product) => {
    setSelectedProduct(p);
    setQuantity(5);
    setError(null);
    setPurchaseSuccessOrder(null);
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setError(null);
    setPurchasing(true);

    try {
      const res = await retailerApi.purchaseStock(selectedProduct.id, quantity);
      setPurchaseSuccessOrder(res.order);
      await refreshMe();
      await loadProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      setError(message);
    } finally {
      setPurchasing(false);
    }
  };

  const currentBalance = retailer?.balance || 0;
  const unitPrice = selectedProduct?.retailerPrice || 0;
  const totalAmount = unitPrice * quantity;
  const hasSufficientBalance = currentBalance >= totalAmount;
  const remainingBalance = currentBalance - totalAmount;

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
              Wholesale Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">• eSIM Catalog</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Wholesale eSIM Packages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Purchase direct from Telelys. Purchased eSIMs are automatically added to your inventory for immediate customer delivery.
          </p>
        </div>

        {/* Balance Display */}
        <div className="flex items-center gap-3.5 bg-white/90 backdrop-blur-md border border-white/90 px-4 py-2.5 rounded-2xl shadow-xl shadow-blue-500/5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-black uppercase tracking-wider">Your Balance</span>
            <span className="text-sm font-black text-slate-900">
              NOK {currentBalance.toLocaleString()}
            </span>
          </div>
          {onOpenWalletModal && (
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="ml-2 text-xs font-extrabold text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Add Credit
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
          const profitPerEsim = p.suggestedPrice - p.retailerPrice;
          const isOutOfStock = (p.availableStock ?? 0) <= 0;

          return (
            <div
              key={p.id}
              className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-blue-500/5 overflow-hidden flex flex-col justify-between hover:border-blue-400/80 transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      {p.sku}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">{p.name}</h2>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shadow-2xs">
                    {p.dataAmount} {p.dataUnit}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-slate-100/80 text-slate-700 text-xs font-extrabold rounded-xl border border-slate-200/60">
                    {p.validity} {p.validityUnit.toLowerCase()} validity
                  </span>
                  <span className="px-3 py-1 bg-blue-50/80 text-blue-700 text-xs font-extrabold rounded-xl border border-blue-200/60 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{p.availableStock ?? 0} in stock</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-6 line-clamp-2 font-medium leading-relaxed">{p.description}</p>

                {/* Pricing Box */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-2.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Your Wholesale Cost:</span>
                    <span className="font-black text-blue-700 text-base">
                      NOK {p.retailerPrice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500 font-semibold">Suggested Customer Retail:</span>
                    <span className="font-extrabold text-slate-700">NOK {p.suggestedPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 font-black text-[11px] pt-1.5 border-t border-slate-100">
                    <span>Retailer Margin:</span>
                    <span>+NOK {profitPerEsim} per unit</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-5 bg-slate-50/70 border-t border-slate-100/80">
                <button
                  type="button"
                  onClick={() => openPurchaseModal(p)}
                  disabled={isOutOfStock}
                  className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                    isOutOfStock
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? "Temporarily Out of Stock" : "Buy eSIMs"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-white/90 animate-in zoom-in-95 my-auto">
            {!purchaseSuccessOrder ? (
              <>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Purchase eSIM Stock</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedProduct.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmPurchase} className="space-y-4 text-xs">
                  {/* Quantity selector */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-2">
                      Select Quantity of eSIMs
                    </label>
                    <div className="flex items-center gap-2.5 mb-3">
                      {[5, 10, 25, 50].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setQuantity(qty)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-black transition-all ${
                            quantity === qty
                              ? "bg-blue-50 border-blue-600 text-blue-700 shadow-xs"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {qty}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedProduct.availableStock ?? 9999}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white/90"
                    />
                    <span className="text-[11px] text-slate-400 mt-1.5 block font-semibold">
                      Max available right now: {selectedProduct.availableStock ?? 0} units
                    </span>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Wholesale Unit Price:</span>
                      <span className="font-extrabold">NOK {unitPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Quantity:</span>
                      <span className="font-extrabold">{quantity} eSIMs</span>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-slate-900 font-black text-sm">
                      <span>Total Amount:</span>
                      <span className="text-blue-700">NOK {totalAmount.toLocaleString()}</span>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/80 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500 font-medium">
                        <span>Your Current Balance:</span>
                        <span className="font-bold text-slate-700">
                          NOK {currentBalance.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 font-medium">
                        <span>Balance After Purchase:</span>
                        <span
                          className={`font-black ${
                            hasSufficientBalance ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          NOK {remainingBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!hasSufficientBalance && (
                    <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 text-xs shadow-2xs">
                      <p className="font-black mb-1">Insufficient Wallet Balance</p>
                      <p className="text-[11px] text-amber-700 font-medium">
                        You need NOK {(totalAmount - currentBalance).toLocaleString()} more to
                        complete this purchase. Please add funds to your account.
                      </p>
                      {onOpenWalletModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(null);
                            onOpenWalletModal();
                          }}
                          className="mt-2 text-xs font-black text-amber-900 underline block hover:text-amber-950 transition-colors"
                        >
                          Request Balance Top-up →
                        </button>
                      )}
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!hasSufficientBalance || purchasing || quantity < 1}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
                    >
                      {purchasing ? "Allocating eSIMs..." : "Confirm & Purchase eSIMs"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success confirmation state */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Purchase Completed!</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Order <strong>{purchaseSuccessOrder.orderNumber}</strong> has been confirmed.
                  </p>
                </div>
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-2 text-left shadow-2xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Package:</span>
                    <span className="font-extrabold text-slate-900">{purchaseSuccessOrder.productName}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Quantity Added:</span>
                    <span className="font-black text-blue-700">
                      +{purchaseSuccessOrder.quantity} eSIMs
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Total Deducted:</span>
                    <span className="font-extrabold text-slate-900">
                      NOK {purchaseSuccessOrder.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">New Balance:</span>
                    <span className="font-black text-emerald-700">
                      NOK {retailer?.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setPurchaseSuccessOrder(null);
                      setActiveTab("stock");
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    View My Inventory ({purchaseSuccessOrder.quantity} new)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setPurchaseSuccessOrder(null);
                    }}
                    className="px-4 py-3 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-2xl transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};