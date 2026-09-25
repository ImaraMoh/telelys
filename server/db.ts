import {
  User,
  Retailer,
  Product,
  Esim,
  Order,
  Payment,
  WalletTransaction,
  Inquiry,
  CompanySetting,
} from '@/types';

export interface DbState {
  users: (User & { passwordHash: string })[];
  retailers: Retailer[];
  products: Product[];
  esims: Esim[];
  orders: Order[];
  payments: Payment[];
  walletTransactions: WalletTransaction[];
  inquiries: Inquiry[];
  settings: CompanySetting;
}

// Helper to generate consistent date strings
function daysAgo(days: number): string {
  const d = new Date('2026-09-22T03:45:00Z');
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// Initial Company Settings
const initialSettings: CompanySetting = {
  companyName: 'Telelys AS',
  companyEmail: 'b2b@telelys.com',
  companyPhone: '+47 21 00 50 00',
  website: 'https://telelys.com',
  currency: 'NOK',
  timezone: 'Europe/Oslo',
  lowStockThreshold: 15,
  notificationsEnabled: true,
};

// Initial Users
const initialUsers: (User & { passwordHash: string })[] = [
  {
    id: 'usr_admin',
    name: 'Telelys Admin',
    email: 'admin@telelys.com',
    passwordHash: 'admin123',
    userType: 'ADMIN',
    createdAt: daysAgo(120),
  },
  {
    id: 'usr_ret_1',
    name: 'Henrik Lindberg',
    email: 'nordic@connect.no',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_1',
    createdAt: daysAgo(90),
  },
  {
    id: 'usr_ret_2',
    name: 'Astrid Lindgren',
    email: 'info@traveldatahub.se',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_2',
    createdAt: daysAgo(85),
  },
  {
    id: 'usr_ret_3',
    name: 'Mikkel Nielsen',
    email: 'contact@globalsim.dk',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_3',
    createdAt: daysAgo(80),
  },
  {
    id: 'usr_ret_4',
    name: 'Eero Korhonen',
    email: 'support@roamnet.fi',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_4',
    createdAt: daysAgo(75),
  },
  {
    id: 'usr_ret_5',
    name: 'Ingrid Solberg',
    email: 'sales@digitaltravel.no',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_5',
    createdAt: daysAgo(70),
  },
  {
    id: 'usr_ret_6',
    name: 'Jón Gunnarsson',
    email: 'hello@eurosim.is',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_6',
    createdAt: daysAgo(60),
  },
  {
    id: 'usr_ret_7',
    name: 'Olav Hauge',
    email: 'viking@mobile.no',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_7',
    createdAt: daysAgo(50),
  },
  {
    id: 'usr_ret_8',
    name: 'Kari Bakke',
    email: 'partner@nomadtelecom.no',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_8',
    createdAt: daysAgo(45),
  },
  {
    id: 'usr_ret_9',
    name: 'Magnus Foss',
    email: 'b2b@apexconnect.no',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_9',
    createdAt: daysAgo(40),
  },
  {
    id: 'usr_ret_10',
    name: 'Sigrid Moen',
    email: 'orders@wanderlustesim.no',
    passwordHash: 'retailer123',
    userType: 'RETAILER',
    retailerId: 'ret_10',
    createdAt: daysAgo(30),
  },
];

// Initial Retailers (10)
const initialRetailers: Retailer[] = [
  {
    id: 'ret_1',
    userId: 'usr_ret_1',
    businessName: 'Nordic Connect AS',
    contactName: 'Henrik Lindberg',
    email: 'nordic@connect.no',
    phone: '+47 22 11 00 33',
    address: 'Stortingsgata 14',
    city: 'Oslo',
    postalCode: '0161',
    country: 'Norway',
    taxNumber: 'NO987654321MVA',
    status: 'ACTIVE',
    balance: 8450,
    currency: 'NOK',
    createdAt: daysAgo(90),
  },
  {
    id: 'ret_2',
    userId: 'usr_ret_2',
    businessName: 'Travel Data Hub AB',
    contactName: 'Astrid Lindgren',
    email: 'info@traveldatahub.se',
    phone: '+46 8 555 123 45',
    address: 'Kungsgatan 32',
    city: 'Stockholm',
    postalCode: '11135',
    country: 'Sweden',
    taxNumber: 'SE556123456701',
    status: 'ACTIVE',
    balance: 14200,
    currency: 'NOK',
    createdAt: daysAgo(85),
  },
  {
    id: 'ret_3',
    userId: 'usr_ret_3',
    businessName: 'Global SIM Solutions ApS',
    contactName: 'Mikkel Nielsen',
    email: 'contact@globalsim.dk',
    phone: '+45 33 22 11 00',
    address: 'Vesterbrogade 12',
    city: 'Copenhagen',
    postalCode: '1620',
    country: 'Denmark',
    taxNumber: 'DK12345678',
    status: 'ACTIVE',
    balance: 6300,
    currency: 'NOK',
    createdAt: daysAgo(80),
  },
  {
    id: 'ret_4',
    userId: 'usr_ret_4',
    businessName: 'RoamNet Oy',
    contactName: 'Eero Korhonen',
    email: 'support@roamnet.fi',
    phone: '+358 9 1234 567',
    address: 'Mannerheimintie 18',
    city: 'Helsinki',
    postalCode: '00100',
    country: 'Finland',
    taxNumber: 'FI98765432',
    status: 'ACTIVE',
    balance: 19500,
    currency: 'NOK',
    createdAt: daysAgo(75),
  },
  {
    id: 'ret_5',
    userId: 'usr_ret_5',
    businessName: 'Digital Travel Store AS',
    contactName: 'Ingrid Solberg',
    email: 'sales@digitaltravel.no',
    phone: '+47 55 90 22 11',
    address: 'Bryggen 7',
    city: 'Bergen',
    postalCode: '5003',
    country: 'Norway',
    taxNumber: 'NO912345678MVA',
    status: 'ACTIVE',
    balance: 4100,
    currency: 'NOK',
    createdAt: daysAgo(70),
  },
  {
    id: 'ret_6',
    userId: 'usr_ret_6',
    businessName: 'EuroSim Express ehf',
    contactName: 'Jón Gunnarsson',
    email: 'hello@eurosim.is',
    phone: '+354 511 2233',
    address: 'Laugavegur 44',
    city: 'Reykjavik',
    postalCode: '101',
    country: 'Iceland',
    taxNumber: 'IS123456',
    status: 'ACTIVE',
    balance: 12000,
    currency: 'NOK',
    createdAt: daysAgo(60),
  },
  {
    id: 'ret_7',
    userId: 'usr_ret_7',
    businessName: 'Viking Mobile Retail AS',
    contactName: 'Olav Hauge',
    email: 'viking@mobile.no',
    phone: '+47 73 88 44 22',
    address: 'Olav Tryggvasons gate 21',
    city: 'Trondheim',
    postalCode: '7011',
    country: 'Norway',
    taxNumber: 'NO923456789MVA',
    status: 'ACTIVE',
    balance: 2750,
    currency: 'NOK',
    createdAt: daysAgo(50),
  },
  {
    id: 'ret_8',
    userId: 'usr_ret_8',
    businessName: 'Nomad Telecom AS',
    contactName: 'Kari Bakke',
    email: 'partner@nomadtelecom.no',
    phone: '+47 51 89 33 00',
    address: 'Kirkegata 15',
    city: 'Stavanger',
    postalCode: '4006',
    country: 'Norway',
    taxNumber: 'NO934567890MVA',
    status: 'ACTIVE',
    balance: 9800,
    currency: 'NOK',
    createdAt: daysAgo(45),
  },
  {
    id: 'ret_9',
    userId: 'usr_ret_9',
    businessName: 'Apex Connectivity AS',
    contactName: 'Magnus Foss',
    email: 'b2b@apexconnect.no',
    phone: '+47 77 60 12 34',
    address: 'Storgata 88',
    city: 'Tromsø',
    postalCode: '9008',
    country: 'Norway',
    taxNumber: 'NO945678901MVA',
    status: 'ACTIVE',
    balance: 550,
    currency: 'NOK',
    createdAt: daysAgo(40),
  },
  {
    id: 'ret_10',
    userId: 'usr_ret_10',
    businessName: 'Wanderlust eSIM AS',
    contactName: 'Sigrid Moen',
    email: 'orders@wanderlustesim.no',
    phone: '+47 32 80 90 00',
    address: 'Bragernes Torg 4',
    city: 'Drammen',
    postalCode: '3017',
    country: 'Norway',
    taxNumber: 'NO956789012MVA',
    status: 'INACTIVE',
    balance: 0,
    currency: 'NOK',
    createdAt: daysAgo(30),
  },
];

// Initial Master eSIM Products
const initialProducts: Product[] = [
  {
    id: 'prod_1',
    name: '1GB / 7 Days',
    sku: 'TEL-1GB-7D',
    type: 'ESIM',
    dataAmount: 1,
    dataUnit: 'GB',
    validity: 7,
    validityUnit: 'DAYS',
    costPrice: 25,
    retailerPrice: 38,
    suggestedPrice: 55,
    currency: 'NOK',
    description: 'High-speed 1GB eSIM data package valid for 7 days. Ideal for short weekend trips and city breaks.',
    status: 'ACTIVE',
    createdAt: daysAgo(100),
  },
  {
    id: 'prod_2',
    name: '3GB / 15 Days',
    sku: 'TEL-3GB-15D',
    type: 'ESIM',
    dataAmount: 3,
    dataUnit: 'GB',
    validity: 15,
    validityUnit: 'DAYS',
    costPrice: 60,
    retailerPrice: 85,
    suggestedPrice: 115,
    currency: 'NOK',
    description: 'Balanced 3GB eSIM data bundle valid for 15 days. Perfect for mid-length business and holiday travels.',
    status: 'ACTIVE',
    createdAt: daysAgo(100),
  },
  {
    id: 'prod_3',
    name: '5GB / 30 Days',
    sku: 'TEL-5GB-30D',
    type: 'ESIM',
    dataAmount: 5,
    dataUnit: 'GB',
    validity: 30,
    validityUnit: 'DAYS',
    costPrice: 100,
    retailerPrice: 130,
    suggestedPrice: 160,
    currency: 'NOK',
    description: 'Most popular 5GB package valid for 30 full days. Generous data for daily navigation, messaging, and browsing.',
    status: 'ACTIVE',
    createdAt: daysAgo(100),
  },
  {
    id: 'prod_4',
    name: '10GB / 30 Days',
    sku: 'TEL-10GB-30D',
    type: 'ESIM',
    dataAmount: 10,
    dataUnit: 'GB',
    validity: 30,
    validityUnit: 'DAYS',
    costPrice: 160,
    retailerPrice: 210,
    suggestedPrice: 265,
    currency: 'NOK',
    description: 'Heavy traveler package offering 10GB over 30 days. Supports remote work, video calls, and streaming.',
    status: 'ACTIVE',
    createdAt: daysAgo(100),
  },
  {
    id: 'prod_5',
    name: '20GB / 30 Days',
    sku: 'TEL-20GB-30D',
    type: 'ESIM',
    dataAmount: 20,
    dataUnit: 'GB',
    validity: 30,
    validityUnit: 'DAYS',
    costPrice: 240,
    retailerPrice: 320,
    suggestedPrice: 399,
    currency: 'NOK',
    description: 'High-capacity 20GB package valid for 30 days. Designed for digital nomads and power users.',
    status: 'ACTIVE',
    createdAt: daysAgo(90),
  },
  {
    id: 'prod_6',
    name: '50GB / 30 Days',
    sku: 'TEL-50GB-30D',
    type: 'ESIM',
    dataAmount: 50,
    dataUnit: 'GB',
    validity: 30,
    validityUnit: 'DAYS',
    costPrice: 450,
    retailerPrice: 580,
    suggestedPrice: 720,
    currency: 'NOK',
    description: 'Ultra-tier 50GB package valid for 30 days. Maximum data connectivity with top network priority.',
    status: 'ACTIVE',
    createdAt: daysAgo(60),
  },
];

// Generate 520 realistic eSIM inventory stock items
function generateSeedEsims(): Esim[] {
  const esims: Esim[] = [];
  const productList = initialProducts;

  // Let's create distribution:
  // 520 items:
  // - 340 AVAILABLE
  // - 110 ASSIGNED to retailers (Nordic Connect, Travel Data Hub, RoamNet, etc.)
  // - 50 SOLD to retailer's customers
  // - 12 ACTIVATED
  // - 8 EXPIRED
  let count = 0;

  for (let pIndex = 0; pIndex < productList.length; pIndex++) {
    const prod = productList[pIndex];
    // Assign varying counts per product (between 70 and 110 per product)
    const productTotal = pIndex === 2 ? 120 : pIndex === 3 ? 100 : 75;

    for (let i = 0; i < productTotal; i++) {
      count++;
      const paddedId = String(count).padStart(5, '0');
      const iccid = `8947012026${String(1000000000 + count)}`;
      const activationCode = `LPA:1$smdp.telelys.com$TEL-${prod.sku.replace('TEL-', '')}-${paddedId}`;
      const qrCode = `LPA:1$smdp.telelys.com$TEL-${prod.sku.replace('TEL-', '')}-${paddedId}`;

      let status: Esim['status'] = 'AVAILABLE';
      let retailerId: string | null = null;
      let retailerName: string | null = null;
      let orderId: string | null = null;
      let assignedAt: string | null = null;
      let customerNote: string | null = null;

      // Assign some to ret_1 (Nordic Connect)
      if (i < 12) {
        status = 'ASSIGNED';
        retailerId = 'ret_1';
        retailerName = 'Nordic Connect AS';
        orderId = 'ord_1001';
        assignedAt = daysAgo(14);
      } else if (i >= 12 && i < 18) {
        status = 'SOLD';
        retailerId = 'ret_1';
        retailerName = 'Nordic Connect AS';
        orderId = 'ord_1001';
        assignedAt = daysAgo(14);
        customerNote = `Customer ticket #${1000 + i} - Supplied at counter`;
      } else if (i >= 18 && i < 20) {
        status = 'ACTIVATED';
        retailerId = 'ret_1';
        retailerName = 'Nordic Connect AS';
        orderId = 'ord_1001';
        assignedAt = daysAgo(14);
        customerNote = `Customer ticket #${1000 + i} - Active in roaming`;
      } else if (i >= 20 && i < 28) {
        // ret_2 Travel Data Hub
        status = 'ASSIGNED';
        retailerId = 'ret_2';
        retailerName = 'Travel Data Hub AB';
        orderId = 'ord_1002';
        assignedAt = daysAgo(10);
      } else if (i >= 28 && i < 33) {
        status = 'SOLD';
        retailerId = 'ret_2';
        retailerName = 'Travel Data Hub AB';
        orderId = 'ord_1002';
        assignedAt = daysAgo(10);
        customerNote = `Sold via online portal to customer booking #${4000 + i}`;
      } else if (i >= 33 && i < 35 && pIndex === 0) {
        status = 'EXPIRED';
        retailerId = 'ret_3';
        retailerName = 'Global SIM Solutions ApS';
        orderId = 'ord_1003';
        assignedAt = daysAgo(40);
      }

      esims.push({
        id: `esim_${paddedId}`,
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        iccid,
        activationCode,
        qrCode,
        status,
        retailerId,
        retailerName,
        orderId,
        assignedAt,
        customerNote,
        createdAt: daysAgo(50),
      });
    }
  }

  return esims;
}

const initialEsims = generateSeedEsims();

// Initial Orders
const initialOrders: Order[] = [
  {
    id: 'ord_1001',
    orderNumber: 'ORD-2026-0891',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    productId: 'prod_3',
    productName: '5GB / 30 Days',
    productSku: 'TEL-5GB-30D',
    quantity: 20,
    unitPrice: 130,
    total: 2600,
    currency: 'NOK',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    assignedEsimIds: initialEsims.filter((e) => e.orderId === 'ord_1001').map((e) => e.id),
    createdAt: daysAgo(14),
  },
  {
    id: 'ord_1002',
    orderNumber: 'ORD-2026-0892',
    retailerId: 'ret_2',
    retailerName: 'Travel Data Hub AB',
    productId: 'prod_4',
    productName: '10GB / 30 Days',
    productSku: 'TEL-10GB-30D',
    quantity: 15,
    unitPrice: 210,
    total: 3150,
    currency: 'NOK',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    assignedEsimIds: initialEsims.filter((e) => e.orderId === 'ord_1002').map((e) => e.id),
    createdAt: daysAgo(10),
  },
  {
    id: 'ord_1003',
    orderNumber: 'ORD-2026-0893',
    retailerId: 'ret_3',
    retailerName: 'Global SIM Solutions ApS',
    productId: 'prod_1',
    productName: '1GB / 7 Days',
    productSku: 'TEL-1GB-7D',
    quantity: 25,
    unitPrice: 38,
    total: 950,
    currency: 'NOK',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    assignedEsimIds: initialEsims.filter((e) => e.orderId === 'ord_1003').map((e) => e.id),
    createdAt: daysAgo(7),
  },
  {
    id: 'ord_1004',
    orderNumber: 'ORD-2026-0894',
    retailerId: 'ret_4',
    retailerName: 'RoamNet Oy',
    productId: 'prod_5',
    productName: '20GB / 30 Days',
    productSku: 'TEL-20GB-30D',
    quantity: 10,
    unitPrice: 320,
    total: 3200,
    currency: 'NOK',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    assignedEsimIds: [],
    createdAt: daysAgo(5),
  },
  {
    id: 'ord_1005',
    orderNumber: 'ORD-2026-0895',
    retailerId: 'ret_5',
    retailerName: 'Digital Travel Store AS',
    productId: 'prod_2',
    productName: '3GB / 15 Days',
    productSku: 'TEL-3GB-15D',
    quantity: 10,
    unitPrice: 85,
    total: 850,
    currency: 'NOK',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    assignedEsimIds: [],
    createdAt: daysAgo(3),
  },
  {
    id: 'ord_1006',
    orderNumber: 'ORD-2026-0896',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    productId: 'prod_2',
    productName: '3GB / 15 Days',
    productSku: 'TEL-3GB-15D',
    quantity: 15,
    unitPrice: 85,
    total: 1275,
    currency: 'NOK',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    assignedEsimIds: [],
    createdAt: daysAgo(2),
  },
  {
    id: 'ord_1007',
    orderNumber: 'ORD-2026-0897',
    retailerId: 'ret_7',
    retailerName: 'Viking Mobile Retail AS',
    productId: 'prod_3',
    productName: '5GB / 30 Days',
    productSku: 'TEL-5GB-30D',
    quantity: 10,
    unitPrice: 130,
    total: 1300,
    currency: 'NOK',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    assignedEsimIds: [],
    createdAt: daysAgo(1),
  },
];

// Initial Payments
const initialPayments: Payment[] = [
  {
    id: 'pay_901',
    paymentReference: 'PAY-2026-901',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    orderId: 'ord_1001',
    amount: 2600,
    currency: 'NOK',
    method: 'WALLET_BALANCE',
    transactionId: 'TX-WL-8001',
    status: 'SUCCESS',
    date: daysAgo(14),
  },
  {
    id: 'pay_902',
    paymentReference: 'PAY-2026-902',
    retailerId: 'ret_2',
    retailerName: 'Travel Data Hub AB',
    orderId: 'ord_1002',
    amount: 3150,
    currency: 'NOK',
    method: 'WALLET_BALANCE',
    transactionId: 'TX-WL-8002',
    status: 'SUCCESS',
    date: daysAgo(10),
  },
  {
    id: 'pay_903',
    paymentReference: 'PAY-2026-903',
    retailerId: 'ret_3',
    retailerName: 'Global SIM Solutions ApS',
    orderId: 'ord_1003',
    amount: 950,
    currency: 'NOK',
    method: 'WALLET_BALANCE',
    transactionId: 'TX-WL-8003',
    status: 'SUCCESS',
    date: daysAgo(7),
  },
  {
    id: 'pay_904',
    paymentReference: 'PAY-2026-904',
    retailerId: 'ret_4',
    retailerName: 'RoamNet Oy',
    orderId: 'ord_1004',
    amount: 3200,
    currency: 'NOK',
    method: 'WALLET_BALANCE',
    transactionId: 'TX-WL-8004',
    status: 'SUCCESS',
    date: daysAgo(5),
  },
  {
    id: 'pay_905',
    paymentReference: 'PAY-2026-905',
    retailerId: 'ret_5',
    retailerName: 'Digital Travel Store AS',
    orderId: 'ord_1005',
    amount: 850,
    currency: 'NOK',
    method: 'WALLET_BALANCE',
    transactionId: 'TX-WL-8005',
    status: 'SUCCESS',
    date: daysAgo(3),
  },
  {
    id: 'pay_906',
    paymentReference: 'PAY-2026-906',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    orderId: 'ord_1006',
    amount: 1275,
    currency: 'NOK',
    method: 'WALLET_BALANCE',
    transactionId: 'TX-WL-8006',
    status: 'SUCCESS',
    date: daysAgo(2),
  },
  {
    id: 'pay_907',
    paymentReference: 'PAY-2026-907',
    retailerId: 'ret_7',
    retailerName: 'Viking Mobile Retail AS',
    orderId: 'ord_1007',
    amount: 1300,
    currency: 'NOK',
    method: 'WALLET_BALANCE',
    transactionId: 'TX-WL-8007',
    status: 'SUCCESS',
    date: daysAgo(1),
  },
];

// Initial Wallet Transactions
const initialWalletTransactions: WalletTransaction[] = [
  {
    id: 'tx_101',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    type: 'CREDIT',
    amount: 15000,
    balanceBefore: 0,
    balanceAfter: 15000,
    reference: 'BANK-INV-2026-01',
    description: 'Initial balance top-up via Bank Wire Transfer',
    date: daysAgo(30),
  },
  {
    id: 'tx_102',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    type: 'DEBIT',
    amount: 2600,
    balanceBefore: 15000,
    balanceAfter: 12400,
    reference: 'ORD-2026-0891',
    description: 'Purchase 20 units of 5GB / 30 Days eSIM',
    date: daysAgo(14),
  },
  {
    id: 'tx_103',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    type: 'DEBIT',
    amount: 1275,
    balanceBefore: 12400,
    balanceAfter: 11125,
    reference: 'ORD-2026-0896',
    description: 'Purchase 15 units of 3GB / 15 Days eSIM',
    date: daysAgo(2),
  },
  {
    id: 'tx_104',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    type: 'ADJUSTMENT',
    amount: -2675,
    balanceBefore: 11125,
    balanceAfter: 8450,
    reference: 'ADJ-TEL-441',
    description: 'Quarterly account reconciliation with invoice #8892',
    date: daysAgo(1),
  },
  {
    id: 'tx_201',
    retailerId: 'ret_2',
    retailerName: 'Travel Data Hub AB',
    type: 'CREDIT',
    amount: 20000,
    balanceBefore: 0,
    balanceAfter: 20000,
    reference: 'SE-WIRE-4491',
    description: 'B2B Credit deposit via Bank Transfer',
    date: daysAgo(25),
  },
  {
    id: 'tx_202',
    retailerId: 'ret_2',
    retailerName: 'Travel Data Hub AB',
    type: 'DEBIT',
    amount: 3150,
    balanceBefore: 20000,
    balanceAfter: 16850,
    reference: 'ORD-2026-0892',
    description: 'Purchase 15 units of 10GB / 30 Days eSIM',
    date: daysAgo(10),
  },
  {
    id: 'tx_203',
    retailerId: 'ret_2',
    retailerName: 'Travel Data Hub AB',
    type: 'REFUND',
    amount: 500,
    balanceBefore: 16850,
    balanceAfter: 17350,
    reference: 'REF-TEL-102',
    description: 'Goodwill credit for promotional trial bundle',
    date: daysAgo(6),
  },
];

// Initial Inquiries
const initialInquiries: Inquiry[] = [
  {
    id: 'inq_1',
    inquiryNumber: 'INQ-2026-0041',
    retailerId: 'ret_1',
    retailerName: 'Nordic Connect AS',
    subject: 'Requesting bulk discount for 100+ units of 5GB eSIM',
    category: 'Product',
    status: 'OPEN',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    messages: [
      {
        id: 'msg_1',
        inquiryId: 'inq_1',
        senderType: 'RETAILER',
        senderName: 'Henrik Lindberg (Nordic Connect AS)',
        message: 'Hello Telelys team, we expect heavy traveler demand next month and plan to order 150 units of the 5GB / 30 Days package. Could you review our retailer tier pricing for this volume?',
        createdAt: daysAgo(2),
      },
      {
        id: 'msg_2',
        inquiryId: 'inq_1',
        senderType: 'ADMIN',
        senderName: 'Telelys Operations Admin',
        message: 'Hei Henrik! Thank you for reaching out. We have logged your request and can provide a volume rebate once the order reaches 100 units. Let us know when you are ready to place the batch.',
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: 'inq_2',
    inquiryNumber: 'INQ-2026-0042',
    retailerId: 'ret_2',
    retailerName: 'Travel Data Hub AB',
    subject: 'Assistance with QR code download format for POS printouts',
    category: 'eSIM',
    status: 'IN_PROGRESS',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    messages: [
      {
        id: 'msg_3',
        inquiryId: 'inq_2',
        senderType: 'RETAILER',
        senderName: 'Astrid Lindgren (Travel Data Hub AB)',
        message: 'Hi! Can we download the assigned QR codes directly as high-resolution images or PDF cards to print at our airport counter?',
        createdAt: daysAgo(3),
      },
      {
        id: 'msg_4',
        inquiryId: 'inq_2',
        senderType: 'ADMIN',
        senderName: 'Telelys Support',
        message: 'Hi Astrid! Yes, you can click "View Voucher" or "Download QR" on any assigned eSIM in your My Stock view. You can also print the activation card directly.',
        createdAt: daysAgo(2),
      },
    ],
  },
  {
    id: 'inq_3',
    inquiryNumber: 'INQ-2026-0043',
    retailerId: 'ret_5',
    retailerName: 'Digital Travel Store AS',
    subject: 'Deposit confirmation for upcoming seasonal campaign',
    category: 'Payment',
    status: 'RESOLVED',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    messages: [
      {
        id: 'msg_5',
        inquiryId: 'inq_3',
        senderType: 'RETAILER',
        senderName: 'Ingrid Solberg',
        message: 'We transferred NOK 10,000 to the Telelys DNB account yesterday. Kindly verify when it reflects.',
        createdAt: daysAgo(5),
      },
      {
        id: 'msg_6',
        inquiryId: 'inq_3',
        senderType: 'ADMIN',
        senderName: 'Telelys Finance',
        message: 'Deposit confirmed and credited to your wallet balance. You are all set to purchase inventory.',
        createdAt: daysAgo(4),
      },
    ],
  },
];

// In-Memory Database Singleton
class Database {
  private state: DbState;

  constructor() {
    this.state = {
      users: [...initialUsers],
      retailers: [...initialRetailers],
      products: [...initialProducts],
      esims: [...initialEsims],
      orders: [...initialOrders],
      payments: [...initialPayments],
      walletTransactions: [...initialWalletTransactions],
      inquiries: [...initialInquiries],
      settings: { ...initialSettings },
    };
  }

  // --- USERS & AUTH ---
  findUserByEmail(email: string) {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.state.users.find((u) => u.id === id);
  }

  // --- RETAILERS ---
  getRetailers() {
    return this.state.retailers;
  }

  getRetailerById(id: string) {
    return this.state.retailers.find((r) => r.id === id);
  }

  createRetailer(data: Omit<Retailer, 'id' | 'createdAt' | 'balance' | 'currency'> & { initialBalance?: number }) {
    const id = `ret_${Date.now()}`;
    const userId = `usr_${Date.now()}`;
    const initialBalance = data.initialBalance || 0;

    const user: User & { passwordHash: string } = {
      id: userId,
      name: data.contactName,
      email: data.email,
      passwordHash: 'retailer123',
      userType: 'RETAILER',
      retailerId: id,
      createdAt: new Date().toISOString(),
    };
    this.state.users.push(user);

    const retailer: Retailer = {
      ...data,
      id,
      userId,
      balance: initialBalance,
      currency: 'NOK',
      createdAt: new Date().toISOString(),
    };
    this.state.retailers.unshift(retailer);

    if (initialBalance > 0) {
      this.state.walletTransactions.unshift({
        id: `tx_${Date.now()}`,
        retailerId: id,
        retailerName: retailer.businessName,
        type: 'CREDIT',
        amount: initialBalance,
        balanceBefore: 0,
        balanceAfter: initialBalance,
        reference: 'OPENING-BALANCE',
        description: 'Initial account opening credit',
        date: new Date().toISOString(),
      });
    }

    return retailer;
  }

  updateRetailer(id: string, updates: Partial<Retailer>) {
    const index = this.state.retailers.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.state.retailers[index] = { ...this.state.retailers[index], ...updates };
    return this.state.retailers[index];
  }

  // --- WALLET & CREDIT ---
  adjustRetailerCredit(
    retailerId: string,
    type: 'CREDIT' | 'DEBIT' | 'REFUND' | 'ADJUSTMENT',
    amount: number,
    reference: string,
    description: string
  ) {
    const retailer = this.getRetailerById(retailerId);
    if (!retailer) throw new Error('Retailer not found');

    const balanceBefore = retailer.balance;
    let balanceAfter = balanceBefore;

    if (type === 'CREDIT' || type === 'REFUND') {
      balanceAfter += Math.abs(amount);
    } else if (type === 'DEBIT') {
      if (balanceBefore < Math.abs(amount)) {
        throw new Error('Insufficient retailer balance');
      }
      balanceAfter -= Math.abs(amount);
    } else if (type === 'ADJUSTMENT') {
      balanceAfter += amount; // can be positive or negative
      if (balanceAfter < 0) balanceAfter = 0;
    }

    retailer.balance = balanceAfter;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      retailerId,
      retailerName: retailer.businessName,
      type,
      amount: Math.abs(amount),
      balanceBefore,
      balanceAfter,
      reference,
      description,
      date: new Date().toISOString(),
    };
    this.state.walletTransactions.unshift(tx);

    return { retailer, transaction: tx };
  }

  getWalletTransactions(retailerId?: string) {
    if (retailerId) {
      return this.state.walletTransactions.filter((tx) => tx.retailerId === retailerId);
    }
    return this.state.walletTransactions;
  }

  // --- PRODUCTS ---
  getProducts() {
    return this.state.products.map((p) => {
      const availableStock = this.state.esims.filter(
        (e) => e.productId === p.id && e.status === 'AVAILABLE'
      ).length;
      return { ...p, availableStock };
    });
  }

  getProductById(id: string) {
    const product = this.state.products.find((p) => p.id === id);
    if (!product) return null;
    const availableStock = this.state.esims.filter(
      (e) => e.productId === id && e.status === 'AVAILABLE'
    ).length;
    return { ...product, availableStock };
  }

  createProduct(data: Omit<Product, 'id' | 'createdAt'>) {
    const product: Product = {
      ...data,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.products.push(product);
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const index = this.state.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.state.products[index] = { ...this.state.products[index], ...updates };
    return this.getProductById(id);
  }

  // --- ESIM INVENTORY ---
  getEsims(filter?: { retailerId?: string; productId?: string; status?: string }) {
    let result = this.state.esims;
    if (filter?.retailerId) {
      result = result.filter((e) => e.retailerId === filter.retailerId);
    }
    if (filter?.productId) {
      result = result.filter((e) => e.productId === filter.productId);
    }
    if (filter?.status) {
      result = result.filter((e) => e.status === filter.status);
    }
    return result;
  }

  getEsimById(id: string) {
    return this.state.esims.find((e) => e.id === id);
  }

  addSingleEsim(data: {
    productId: string;
    iccid: string;
    activationCode: string;
    qrCode?: string;
  }) {
    const existing = this.state.esims.find((e) => e.iccid === data.iccid);
    if (existing) throw new Error(`ICCID ${data.iccid} already exists in inventory`);

    const product = this.getProductById(data.productId);
    if (!product) throw new Error('Product does not exist');

    const qrCode = data.qrCode || data.activationCode;
    const esim: Esim = {
      id: `esim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      productId: data.productId,
      productName: product.name,
      productSku: product.sku,
      iccid: data.iccid,
      activationCode: data.activationCode,
      qrCode,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };
    this.state.esims.unshift(esim);
    return esim;
  }

  importBulkEsims(rows: { iccid: string; activationCode: string; qrCode?: string; productSku: string }[]) {
    let successCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const errors: { row: number; iccid?: string; message: string }[] = [];
    const seenIccidsInBatch = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      if (!row.iccid || !row.iccid.trim()) {
        failedCount++;
        errors.push({ row: rowNumber, message: 'Missing ICCID' });
        continue;
      }

      const cleanIccid = row.iccid.trim();

      if (seenIccidsInBatch.has(cleanIccid)) {
        duplicateCount++;
        errors.push({ row: rowNumber, iccid: cleanIccid, message: 'Duplicate ICCID in upload file' });
        continue;
      }
      seenIccidsInBatch.add(cleanIccid);

      const existingInDb = this.state.esims.find((e) => e.iccid === cleanIccid);
      if (existingInDb) {
        duplicateCount++;
        errors.push({ row: rowNumber, iccid: cleanIccid, message: 'ICCID already registered in system' });
        continue;
      }

      const product = this.state.products.find(
        (p) => p.sku.toLowerCase() === (row.productSku || '').trim().toLowerCase()
      );
      if (!product) {
        failedCount++;
        errors.push({ row: rowNumber, iccid: cleanIccid, message: `Product SKU "${row.productSku}" not found` });
        continue;
      }

      const activationCode = row.activationCode?.trim() || `LPA:1$smdp.telelys.com$${cleanIccid}`;
      const qrCode = row.qrCode?.trim() || activationCode;

      const esim: Esim = {
        id: `esim_imp_${Date.now()}_${i}`,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        iccid: cleanIccid,
        activationCode,
        qrCode,
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      };

      this.state.esims.push(esim);
      successCount++;
    }

    return {
      totalRows: rows.length,
      successfullyImported: successCount,
      failedRows: failedCount,
      duplicateRows: duplicateCount,
      errors,
    };
  }

  // Update status (e.g. Retailer supplies eSIM to customer -> 'SOLD', or admin marks cancelled)
  updateEsimStatus(id: string, status: Esim['status'], customerNote?: string) {
    const esim = this.state.esims.find((e) => e.id === id);
    if (!esim) return null;
    esim.status = status;
    if (customerNote !== undefined) esim.customerNote = customerNote;
    return esim;
  }

  // --- ORDERS & PURCHASE FLOW ---
  // The core B2B purchase flow
  purchaseEsimStock(retailerId: string, productId: string, quantity: number) {
    const retailer = this.getRetailerById(retailerId);
    if (!retailer) throw new Error('Retailer not found');

    const product = this.getProductById(productId);
    if (!product) throw new Error('Product not found');
    if (product.status !== 'ACTIVE') throw new Error('Product is currently inactive');

    // 1. Check stock
    const availableEsims = this.state.esims.filter(
      (e) => e.productId === productId && e.status === 'AVAILABLE'
    );
    if (availableEsims.length < quantity) {
      throw new Error(`Insufficient stock available. Only ${availableEsims.length} units in inventory.`);
    }

    // 2. Check retailer wallet balance
    const totalCost = product.retailerPrice * quantity;
    if (retailer.balance < totalCost) {
      throw new Error(
        `Insufficient balance. Total cost is NOK ${totalCost.toLocaleString()}, but your balance is NOK ${retailer.balance.toLocaleString()}. Please add credit to your account.`
      );
    }

    // 3. Deduct retailer balance
    const balanceBefore = retailer.balance;
    const balanceAfter = balanceBefore - totalCost;
    retailer.balance = balanceAfter;

    // 4. Create Order
    const orderId = `ord_${Date.now()}`;
    const orderNumber = `ORD-2026-${String(this.state.orders.length + 898).padStart(4, '0')}`;

    // 5. Assign eSIMs
    const assignedEsims = availableEsims.slice(0, quantity);
    const assignedEsimIds = assignedEsims.map((e) => e.id);
    const assignedDate = new Date().toISOString();

    assignedEsims.forEach((esim) => {
      esim.status = 'ASSIGNED';
      esim.retailerId = retailer.id;
      esim.retailerName = retailer.businessName;
      esim.orderId = orderId;
      esim.assignedAt = assignedDate;
    });

    const order: Order = {
      id: orderId,
      orderNumber,
      retailerId: retailer.id,
      retailerName: retailer.businessName,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: product.retailerPrice,
      total: totalCost,
      currency: 'NOK',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      assignedEsimIds,
      createdAt: assignedDate,
    };
    this.state.orders.unshift(order);

    // 6. Record Wallet Transaction
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      retailerId: retailer.id,
      retailerName: retailer.businessName,
      type: 'DEBIT',
      amount: totalCost,
      balanceBefore,
      balanceAfter,
      reference: orderNumber,
      description: `Purchased ${quantity} × ${product.name} eSIMs`,
      date: assignedDate,
    };
    this.state.walletTransactions.unshift(tx);

    // 7. Record Payment
    const payment: Payment = {
      id: `pay_${Date.now()}`,
      paymentReference: `PAY-2026-${String(this.state.payments.length + 908)}`,
      retailerId: retailer.id,
      retailerName: retailer.businessName,
      orderId,
      amount: totalCost,
      currency: 'NOK',
      method: 'WALLET_BALANCE',
      transactionId: tx.id,
      status: 'SUCCESS',
      date: assignedDate,
    };
    this.state.payments.unshift(payment);

    return {
      order,
      payment,
      assignedEsims,
      remainingBalance: balanceAfter,
    };
  }

  getOrders(retailerId?: string) {
    if (retailerId) {
      return this.state.orders.filter((o) => o.retailerId === retailerId);
    }
    return this.state.orders;
  }

  getOrderById(id: string, retailerId?: string) {
    const order = this.state.orders.find((o) => o.id === id);
    if (!order) return null;
    if (retailerId && order.retailerId !== retailerId) return null;

    const assignedEsims = this.state.esims.filter((e) => e.orderId === id);
    return { ...order, assignedEsims };
  }

  // --- PAYMENTS ---
  getPayments(retailerId?: string) {
    if (retailerId) {
      return this.state.payments.filter((p) => p.retailerId === retailerId);
    }
    return this.state.payments;
  }

  // --- INQUIRIES ---
  getInquiries(retailerId?: string) {
    if (retailerId) {
      return this.state.inquiries.filter((inq) => inq.retailerId === retailerId);
    }
    return this.state.inquiries;
  }

  getInquiryById(id: string, retailerId?: string) {
    const inquiry = this.state.inquiries.find((inq) => inq.id === id);
    if (!inquiry) return null;
    if (retailerId && inquiry.retailerId !== retailerId) return null;
    return inquiry;
  }

  createInquiry(
    retailerId: string,
    subject: string,
    category: Inquiry['category'],
    initialMessage: string
  ) {
    const retailer = this.getRetailerById(retailerId);
    if (!retailer) throw new Error('Retailer not found');

    const id = `inq_${Date.now()}`;
    const inquiryNumber = `INQ-2026-${String(this.state.inquiries.length + 44).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const inquiry: Inquiry = {
      id,
      inquiryNumber,
      retailerId,
      retailerName: retailer.businessName,
      subject,
      category,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg_${Date.now()}`,
          inquiryId: id,
          senderType: 'RETAILER',
          senderName: `${retailer.contactName} (${retailer.businessName})`,
          message: initialMessage,
          createdAt: now,
        },
      ],
    };
    this.state.inquiries.unshift(inquiry);
    return inquiry;
  }

  addInquiryMessage(
    inquiryId: string,
    senderType: 'ADMIN' | 'RETAILER',
    senderName: string,
    message: string
  ) {
    const inquiry = this.state.inquiries.find((inq) => inq.id === inquiryId);
    if (!inquiry) throw new Error('Inquiry not found');

    const now = new Date().toISOString();
    const msg: Inquiry['messages'][0] = {
      id: `msg_${Date.now()}`,
      inquiryId,
      senderType,
      senderName,
      message,
      createdAt: now,
    };
    inquiry.messages.push(msg);
    inquiry.updatedAt = now;

    if (senderType === 'ADMIN' && inquiry.status === 'OPEN') {
      inquiry.status = 'IN_PROGRESS';
    }
    return inquiry;
  }

  updateInquiryStatus(inquiryId: string, status: Inquiry['status']) {
    const inquiry = this.state.inquiries.find((inq) => inq.id === inquiryId);
    if (!inquiry) throw new Error('Inquiry not found');
    inquiry.status = status;
    inquiry.updatedAt = new Date().toISOString();
    return inquiry;
  }

  // --- SETTINGS ---
  getSettings() {
    return this.state.settings;
  }

  updateSettings(updates: Partial<CompanySetting>) {
    this.state.settings = { ...this.state.settings, ...updates };
    return this.state.settings;
  }

  // --- DASHBOARD STATS ---
  getAdminDashboardStats() {
    const totalRetailers = this.state.retailers.length;
    const activeRetailers = this.state.retailers.filter((r) => r.status === 'ACTIVE').length;
    const totalEsimProducts = this.state.products.length;
    const availableEsimStock = this.state.esims.filter((e) => e.status === 'AVAILABLE').length;
    const retailerOrders = this.state.orders.length;
    const totalSales = this.state.orders.reduce((sum, o) => sum + o.total, 0);
    const pendingPayments = this.state.payments.filter((p) => p.status === 'PENDING').length;
    const openInquiries = this.state.inquiries.filter(
      (i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS'
    ).length;

    // Recent orders
    const recentOrders = this.state.orders.slice(0, 5);

    // Recent inquiries
    const recentInquiries = this.state.inquiries.slice(0, 5);

    // Top products by units sold
    const productSalesMap = new Map<string, { units: number; revenue: number }>();
    this.state.orders.forEach((o) => {
      const cur = productSalesMap.get(o.productName) || { units: 0, revenue: 0 };
      productSalesMap.set(o.productName, {
        units: cur.units + o.quantity,
        revenue: cur.revenue + o.total,
      });
    });
    const topProducts = Array.from(productSalesMap.entries())
      .map(([name, data]) => ({ name, unitsSold: data.units, revenue: data.revenue }))
      .sort((a, b) => b.unitsSold - a.unitsSold);

    // Low stock warnings
    const lowStockThreshold = this.state.settings.lowStockThreshold;
    const lowStockProducts = this.getProducts().filter(
      (p) => (p.availableStock || 0) <= lowStockThreshold
    );

    return {
      stats: {
        totalRetailers,
        activeRetailers,
        totalEsimProducts,
        availableEsimStock,
        retailerOrders,
        totalSales,
        pendingPayments,
        openInquiries,
        currency: 'NOK',
      },
      recentOrders,
      recentInquiries,
      topProducts,
      lowStockProducts,
    };
  }

  getRetailerDashboardStats(retailerId: string) {
    const retailer = this.getRetailerById(retailerId);
    if (!retailer) throw new Error('Retailer not found');

    const orders = this.getOrders(retailerId);
    const totalPurchases = orders.reduce((sum, o) => sum + o.total, 0);
    const myStock = this.getEsims({ retailerId });
    const activeStockCount = myStock.filter((e) => e.status === 'ASSIGNED').length;
    const soldStockCount = myStock.filter((e) => e.status === 'SOLD' || e.status === 'ACTIVATED').length;

    const recentOrders = orders.slice(0, 5);
    const recentStock = myStock.slice(0, 5);
    const recentInquiries = this.getInquiries(retailerId).slice(0, 5);

    return {
      stats: {
        availableBalance: retailer.balance,
        totalPurchases,
        totalOrders: orders.length,
        esimStockCount: myStock.length,
        activeStockCount,
        soldStockCount,
        currency: 'NOK',
      },
      retailer,
      recentOrders,
      recentStock,
      recentInquiries,
    };
  }
}

export const db = new Database();
