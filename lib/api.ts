import type {
  User,
  Retailer,
  Product,
  Esim,
  WalletTransaction,
  Inquiry,
  CompanySetting,
} from '@/types';

import { db } from '@/server/db';

const TOKEN_KEY = 'telelys_token';

/**
 * Safely get the stored authentication token.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

/**
 * Store authentication token in browser storage.
 */
export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove authentication token from browser storage.
 */
export function clearStoredToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get the currently authenticated user from the stored token or mock DB.
 */
function getCurrentAuthenticatedUser(): User & { passwordHash?: string } {
  const token = getStoredToken();
  if (token && token.startsWith('mock_token_')) {
    const userId = token.replace('mock_token_', '');
    const found = db.findUserById(userId);
    if (found) return found;
  }
  // Default to admin user if no token found
  const adminUser = db.findUserByEmail('admin@telelys.com');
  if (adminUser) return adminUser;

  const retailers = db.getRetailers();
  if (retailers.length > 0) {
    const firstRetailer = retailers[0];
    const user = db.findUserById(firstRetailer.userId || '');
    if (user) return user;
  }

  return {
    id: 'usr_admin',
    name: 'Telelys Admin',
    email: 'admin@telelys.com',
    passwordHash: 'admin123',
    userType: 'ADMIN' as const,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  login: async (email: string, password: string) => {
    const user = db.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    if (user.passwordHash !== password) {
      throw new Error('Invalid email or password.');
    }

    const token = `mock_token_${user.id}`;
    setStoredToken(token);

    let retailer: Retailer | undefined = undefined;
    if (user.retailerId) {
      const foundRetailer = db.getRetailerById(user.retailerId);
      if (foundRetailer) retailer = foundRetailer;
    }

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        retailerId: user.retailerId,
        createdAt: user.createdAt,
      },
      retailer,
    };
  },

  getMe: async () => {
    const user = getCurrentAuthenticatedUser();
    let retailer: Retailer | undefined = undefined;
    if (user.retailerId) {
      const foundRetailer = db.getRetailerById(user.retailerId);
      if (foundRetailer) retailer = foundRetailer;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        retailerId: user.retailerId,
        createdAt: user.createdAt,
      },
      retailer,
    };
  },

  logout: async () => {
    clearStoredToken();
    return { success: true };
  },
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminApi = {
  getDashboard: async () => {
    return db.getAdminDashboardStats();
  },

  getRetailers: async () => {
    return db.getRetailers();
  },

  getRetailerDetail: async (id: string) => {
    const retailer = db.getRetailerById(id);
    if (!retailer) throw new Error('Retailer not found');
    return {
      retailer,
      orders: db.getOrders(id),
      stock: db.getEsims({ retailerId: id }),
      payments: db.getPayments(id),
      transactions: db.getWalletTransactions(id),
      inquiries: db.getInquiries(id),
    };
  },

  createRetailer: async (
    data: Partial<Retailer> & {
      initialBalance?: number;
    }
  ) => {
    const tempUserId = `usr_${Date.now()}`;
    return db.createRetailer({
      userId: data.userId || tempUserId,
      businessName: data.businessName || 'New Partner AS',
      contactName: data.contactName || 'Contact Person',
      email: data.email || 'partner@example.com',
      phone: data.phone || '+47 00 00 00 00',
      address: data.address || 'Storgata 1',
      city: data.city || 'Oslo',
      postalCode: data.postalCode || '0100',
      country: data.country || 'Norway',
      taxNumber: data.taxNumber || 'NO000000000MVA',
      status: data.status || 'ACTIVE',
      initialBalance: data.initialBalance || 0,
    });
  },

  updateRetailer: async (
    id: string,
    updates: Partial<Retailer>
  ) => {
    const updated = db.updateRetailer(id, updates);
    if (!updated) throw new Error('Retailer not found');
    return updated;
  },

  adjustWalletCredit: async (
    retailerId: string,
    data: {
      type: string;
      amount: number;
      reference: string;
      description: string;
    }
  ) => {
    const txType = (data.type.toUpperCase() as 'CREDIT' | 'DEBIT' | 'REFUND' | 'ADJUSTMENT') || 'CREDIT';
    return db.adjustRetailerCredit(
      retailerId,
      txType,
      data.amount,
      data.reference,
      data.description
    );
  },

  getProducts: async () => {
    return db.getProducts();
  },

  createProduct: async (data: Partial<Product>) => {
    return db.createProduct({
      name: data.name || 'New Package',
      sku: data.sku || 'TEL-NEW-1GB',
      type: 'ESIM',
      dataAmount: data.dataAmount || 5,
      dataUnit: 'GB',
      validity: data.validity || 30,
      validityUnit: 'DAYS',
      costPrice: data.costPrice || 100,
      retailerPrice: data.retailerPrice || 130,
      suggestedPrice: data.suggestedPrice || 160,
      currency: 'NOK',
      description: data.description || '',
      status: data.status || 'ACTIVE',
    });
  },

  updateProduct: async (
    id: string,
    updates: Partial<Product>
  ) => {
    const updated = db.updateProduct(id, updates);
    if (!updated) throw new Error('Product not found');
    return updated;
  },

  getEsims: async (params?: {
    retailerId?: string;
    productId?: string;
    status?: string;
  }) => {
    const esims = db.getEsims({
      retailerId: params?.retailerId,
      productId: params?.productId,
      status: params?.status,
    });
    return {
      esims,
      summary: {
        total: esims.length,
        available: esims.filter((e) => e.status === 'AVAILABLE').length,
        assigned: esims.filter((e) => e.status === 'ASSIGNED').length,
        sold: esims.filter((e) => e.status === 'SOLD' || e.status === 'ACTIVATED').length,
      },
    };
  },

  createEsim: async (data: {
    productId: string;
    iccid: string;
    activationCode: string;
    qrCode?: string;
  }) => {
    return db.addSingleEsim(data);
  },

  importEsims: async (
    rows: {
      iccid: string;
      activationCode: string;
      qrCode?: string;
      productSku: string;
    }[]
  ) => {
    return db.importBulkEsims(rows);
  },

  updateEsimStatus: async (
    id: string,
    status: string,
    customerNote?: string
  ) => {
    const updated = db.updateEsimStatus(id, status as Esim['status'], customerNote);
    if (!updated) throw new Error('eSIM not found');
    return updated;
  },

  getOrders: async () => {
    return db.getOrders();
  },

  getOrder: async (id: string) => {
    const order = db.getOrderById(id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  getOrderEsims: async (
    orderId: string
  ): Promise<Esim[]> => {
    const order = db.getOrderById(orderId);
    return order?.assignedEsims || [];
  },

  getPayments: async () => {
    const payments = db.getPayments();
    return {
      payments,
      summary: {
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        count: payments.length,
      },
    };
  },

  recordPayment: async (data: {
    retailerId: string;
    amount: number;
    method?: string;
    reference?: string;
    notes?: string;
  }) => {
    db.adjustRetailerCredit(
      data.retailerId,
      'CREDIT',
      data.amount,
      data.reference || `PAY-${Date.now()}`,
      data.notes || 'Direct payment record'
    );
    const payments = db.getPayments(data.retailerId);
    return payments[0];
  },

  getInquiries: async () => {
    return db.getInquiries();
  },

  getInquiry: async (id: string) => {
    const inquiry = db.getInquiryById(id);
    if (!inquiry) throw new Error('Inquiry not found');
    return inquiry;
  },

  replyInquiry: async (
    id: string,
    message: string
  ) => {
    return db.addInquiryMessage(id, 'ADMIN', 'Telelys Admin', message);
  },

  updateInquiryStatus: async (
    id: string,
    status: string
  ) => {
    return db.updateInquiryStatus(id, status as Inquiry['status']);
  },

  getReports: async () => {
    const orders = db.getOrders();
    const retailers = db.getRetailers();
    const products = db.getProducts();
    const transactions = db.getWalletTransactions();

    return {
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      totalUnits: orders.reduce((sum, o) => sum + o.quantity, 0),
      totalOrders: orders.length,
      orders,
      retailers,
      products,
      stockSummary: {
        available: db.getEsims({ status: 'AVAILABLE' }).length,
        assigned: db.getEsims({ status: 'ASSIGNED' }).length,
        sold: db.getEsims({ status: 'SOLD' }).length,
      },
      transactions,
    };
  },

  getSettings: async () => {
    return db.getSettings();
  },

  updateSettings: async (
    updates: Partial<CompanySetting>
  ) => {
    return db.updateSettings(updates);
  },
};

// ============================================================================
// RETAILER API
// ============================================================================

export const retailerApi = {
  getDashboard: async () => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.getRetailerDashboardStats(retailerId);
  },

  getProducts: async () => {
    return db.getProducts();
  },

  getStock: async () => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.getEsims({ retailerId });
  },

  getMyStock: async (params?: {
    status?: string;
  }) => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.getEsims({
      retailerId,
      status: params?.status,
    });
  },

  sellEsim: async (
    id: string,
    customerNote?: string
  ) => {
    const updated = db.updateEsimStatus(id, 'SOLD', customerNote || 'Supplied to customer');
    if (!updated) throw new Error('eSIM not found in your stock');
    return updated;
  },

  markEsimSold: async (
    id: string,
    details: {
      customerName?: string;
      customerEmail?: string;
      notes?: string;
    }
  ) => {
    const noteParts = [
      details.customerName && `Customer: ${details.customerName}`,
      details.customerEmail && `Email: ${details.customerEmail}`,
      details.notes && `Notes: ${details.notes}`,
    ].filter(Boolean);

    const note = noteParts.length > 0 ? noteParts.join(' • ') : 'Supplied to customer';
    const updated = db.updateEsimStatus(id, 'SOLD', note);
    if (!updated) throw new Error('eSIM not found in your stock');
    return updated;
  },

  getOrders: async () => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.getOrders(retailerId);
  },

  getOrder: async (id: string) => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    const order = db.getOrderById(id, retailerId);
    if (!order) throw new Error('Order not found');
    return order;
  },

  getOrderEsims: async (
    orderId: string
  ): Promise<Esim[]> => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    const order = db.getOrderById(orderId, retailerId);
    return order?.assignedEsims || [];
  },

  purchaseOrder: async (
    productId: string,
    quantity: number
  ) => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.purchaseEsimStock(retailerId, productId, quantity);
  },

  purchaseStock: async (
    productId: string,
    quantity: number
  ) => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.purchaseEsimStock(retailerId, productId, quantity);
  },

  getWallet: async () => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    const retailer = db.getRetailerById(retailerId);
    const transactions = db.getWalletTransactions(retailerId);

    return {
      balance: retailer?.balance || 0,
      currency: retailer?.currency || 'NOK',
      transactions,
    };
  },

  getWalletTransactions: async (): Promise<WalletTransaction[]> => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.getWalletTransactions(retailerId);
  },

  topUpWallet: async (
    amount: number,
    reference?: string,
    description?: string
  ) => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.adjustRetailerCredit(
      retailerId,
      'CREDIT',
      amount,
      reference || `TOPUP-${Date.now()}`,
      description || 'Top-up wallet credit'
    );
  },

  getPayments: async () => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.getPayments(retailerId);
  },

  getInquiries: async () => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.getInquiries(retailerId);
  },

  createInquiry: async (data: {
    subject: string;
    category: string;
    message: string;
  }) => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    return db.createInquiry(
      retailerId,
      data.subject,
      data.category as Inquiry['category'],
      data.message
    );
  },

  replyInquiry: async (
    id: string,
    message: string
  ) => {
    const user = getCurrentAuthenticatedUser();
    return db.addInquiryMessage(id, 'RETAILER', user.name, message);
  },

  getReports: async () => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    const orders = db.getOrders(retailerId);
    const stock = db.getEsims({ retailerId });
    const payments = db.getPayments(retailerId);
    const transactions = db.getWalletTransactions(retailerId);

    return {
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
      totalUnits: stock.length,
      totalOrders: orders.length,
      orders,
      stock,
      payments,
      transactions,
    };
  },

  getSettings: async () => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    const retailer = db.getRetailerById(retailerId);
    if (!retailer) throw new Error('Retailer profile not found');
    return retailer;
  },

  updateSettings: async (
    updates: Partial<Retailer>
  ) => {
    const user = getCurrentAuthenticatedUser();
    const retailerId = user.retailerId || 'ret_1';
    const updated = db.updateRetailer(retailerId, updates);
    if (!updated) throw new Error('Failed to update retailer profile');
    return updated;
  },
};