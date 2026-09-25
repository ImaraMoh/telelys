import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Cpu,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  Radio,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, activeTab, setActiveTab, t } = useAuth();
  const isAdmin = user?.userType === 'ADMIN';

  // Specific navigation lists matching exact prompt requirements
  const adminNav = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'retailers', label: t.retailers, icon: Users },
    { id: 'products', label: t.products, icon: Package },
    { id: 'esim-stock', label: t.esimStock, icon: Cpu },
    { id: 'orders', label: t.orders, icon: ShoppingBag },
    { id: 'payments', label: t.payments, icon: CreditCard },
    { id: 'inquiries', label: t.inquiries, icon: MessageSquare },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const retailerNav = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'products', label: t.products, icon: Package },
    { id: 'stock', label: t.myStock, icon: Cpu },
    { id: 'orders', label: t.myOrders, icon: ShoppingBag },
    { id: 'payments', label: t.payments, icon: CreditCard },
    { id: 'inquiries', label: t.inquiries, icon: MessageSquare },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const navItems = isAdmin ? adminNav : retailerNav;

  return (
    <aside className="w-68 bg-white/95 backdrop-blur-md border-r border-slate-200/80 min-h-screen flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-18 px-6 flex items-center gap-3.5 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center shadow-sm">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">TELELYS</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
              B2B
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium block mt-0.5">
            eSIM Distribution
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3.5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-blue-50/85 text-blue-900 font-semibold shadow-2xs border border-blue-100/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-blue-600 rounded-r-full"></span>
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4.5 border-t border-slate-100/80 bg-slate-50/50">
        <div className="flex items-center gap-2.5 mb-1">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <p className="font-semibold text-sm text-slate-800 tracking-tight">Telelys Network</p>
        </div>
        <p className="text-xs text-slate-400 font-normal">Secure B2B Management</p>
      </div>
    </aside>
  );
};