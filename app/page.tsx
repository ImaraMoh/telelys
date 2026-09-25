"use client";

import React, { useState } from "react";

import { AuthProvider, useAuth } from "../context/AuthContext";

import { LoginView } from "../components/auth/LoginView";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";

// Admin Views
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { AdminRetailers } from "../components/admin/AdminRetailers";
import { AdminProducts } from "../components/admin/AdminProducts";
import { AdminEsimStock } from "../components/admin/AdminEsimStock";
import { AdminOrders } from "../components/admin/AdminOrders";
import { AdminPayments } from "../components/admin/AdminPayments";
import { AdminInquiries } from "../components/admin/AdminInquiries";
import { AdminReports } from "../components/admin/AdminReports";
import { AdminSettings } from "../components/admin/AdminSettings";

// Retailer Views
import { RetailerDashboard } from "../components/retailer/RetailerDashboard";
import { RetailerProducts } from "../components/retailer/RetailerProducts";
import { RetailerStock } from "../components/retailer/RetailerStock";
import { RetailerOrders } from "../components/retailer/RetailerOrders";
import { RetailerPayments } from "../components/retailer/RetailerPayments";
import { RetailerInquiries } from "../components/retailer/RetailerInquiries";
import { RetailerReports } from "../components/retailer/RetailerReports";
import { RetailerSettings } from "../components/retailer/RetailerSettings";

// Common
import { WalletTopUpModal } from "../components/common/WalletTopUpModal";

const MainLayout: React.FC = () => {
  const { user, activeTab } = useAuth();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  /*
   * ---------------------------------------------------------
   * NOT LOGGED IN
   * ---------------------------------------------------------
   */
  if (!user) {
    return <LoginView />;
  }

  const isAdmin = user.userType === "ADMIN";

  /*
   * ---------------------------------------------------------
   * ADMIN CONTENT
   * ---------------------------------------------------------
   */
  const renderAdminContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "retailers":
        return <AdminRetailers />;
      case "products":
        return <AdminProducts />;
      case "esim-stock":
      case "stock": // Handled both just in case
        return <AdminEsimStock />;
      case "orders":
        return <AdminOrders />;
      case "payments":
        return <AdminPayments />;
      case "inquiries":
        return <AdminInquiries />;
      case "reports":
        return <AdminReports />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  /*
   * ---------------------------------------------------------
   * RETAILER CONTENT
   * ---------------------------------------------------------
   */
  const renderRetailerContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <RetailerDashboard onOpenWalletModal={() => setWalletModalOpen(true)} />;
      case "products":
        return <RetailerProducts onOpenWalletModal={() => setWalletModalOpen(true)} />;
      case "stock":
        return <RetailerStock />;
      case "orders":
        return <RetailerOrders />;
      case "payments":
        return <RetailerPayments onOpenWalletModal={() => setWalletModalOpen(true)} />;
      case "inquiries":
        return <RetailerInquiries />;
      case "reports":
        return <RetailerReports />;
      case "settings":
        return <RetailerSettings />;
      default:
        return <RetailerDashboard onOpenWalletModal={() => setWalletModalOpen(true)} />;
    }
  };

  /*
   * ---------------------------------------------------------
   * MAIN APPLICATION
   * ---------------------------------------------------------
   */
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header onOpenWalletModal={() => setWalletModalOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-slate-50/70">
          {isAdmin ? renderAdminContent() : renderRetailerContent()}
        </main>
      </div>

      <WalletTopUpModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </div>
  );
};

/*
 * ---------------------------------------------------------
 * NEXT.JS ROOT PAGE
 * ---------------------------------------------------------
 */
export default function Page() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}