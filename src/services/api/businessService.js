import React from "react";
import transactionData from "@/services/mockData/transactions.json";
import Error from "@/components/ui/Error";

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Business-specific mock data
const businessTransactions = [
  {
    Id: 101,
    type: "business_payment",
    amount: 89.50,
    currency: "USD",
    customer: "John Smith",
    customerEmail: "john.smith@email.com",
    paymentMethod: "Credit Card",
    timestamp: "2024-01-15T14:30:00Z",
    status: "completed",
    refundable: true,
    invoiceId: "INV-2024-001"
  },
  {
    Id: 102,
    type: "business_payment",
    amount: 156.80,
    currency: "USD",
    customer: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    paymentMethod: "Debit Card",
    timestamp: "2024-01-15T11:15:00Z",
    status: "completed",
    refundable: true,
    invoiceId: "INV-2024-002"
  },
  {
    Id: 103,
    type: "business_refund",
    amount: -25.75,
    currency: "USD",
    customer: "Mike Wilson",
    customerEmail: "mike.w@email.com",
    paymentMethod: "Credit Card",
    timestamp: "2024-01-14T16:45:00Z",
    status: "completed",
    refundable: false,
    originalTransactionId: 98
  },
  {
    Id: 104,
    type: "business_payment",
    amount: 342.00,
    currency: "USD",
    customer: "Emma Davis",
    customerEmail: "emma.davis@email.com",
    paymentMethod: "Bank Transfer",
    timestamp: "2024-01-14T13:20:00Z",
    status: "pending",
    refundable: false,
    invoiceId: "INV-2024-003"
  },
  {
    Id: 105,
    type: "business_payment",
    amount: 78.25,
    currency: "USD",
    customer: "David Brown",
    customerEmail: "d.brown@email.com",
    paymentMethod: "PayPal",
    timestamp: "2024-01-13T18:30:00Z",
    status: "completed",
    refundable: true,
    invoiceId: "INV-2024-004"
  }
]

// Analytics data
const businessMetrics = {
  todaySales: 2450.75,
  todayTransactions: 23,
  pendingSettlements: 5680.30,
  monthlyRevenue: 48750.00,
  successRate: 97.8,
  topPaymentMethods: [
    { method: "Credit Card", percentage: 45.2, amount: 22000.50 },
    { method: "Debit Card", percentage: 28.6, amount: 13940.25 },
    { method: "Bank Transfer", percentage: 16.8, amount: 8190.00 },
    { method: "PayPal", percentage: 9.4, amount: 4619.25 }
  ],
  revenueChart: {
    daily: [
      { date: "2024-01-15", revenue: 2450.75 },
      { date: "2024-01-14", revenue: 1875.30 },
      { date: "2024-01-13", revenue: 3200.45 },
      { date: "2024-01-12", revenue: 1950.80 },
      { date: "2024-01-11", revenue: 2750.20 },
      { date: "2024-01-10", revenue: 2100.65 },
      { date: "2024-01-09", revenue: 1680.90 }
    ],
    weekly: [
      { period: "Week 3", revenue: 18500.75 },
      { period: "Week 2", revenue: 16200.30 },
      { period: "Week 1", revenue: 14050.45 }
    ],
    monthly: [
      { period: "Jan 2024", revenue: 48750.00 },
      { period: "Dec 2023", revenue: 45200.80 },
      { period: "Nov 2023", revenue: 42300.65 }
    ]
  }
}

// In-memory storage for business data
let businessTransactionsState = [...businessTransactions]

export const businessService = {
  async getBusinessMetrics() {
    await delay(300)
    try {
      return { ...businessMetrics }
    } catch (error) {
      throw new Error("Failed to load business metrics")
    }
  },

  async getBusinessTransactions(limit) {
    await delay(250)
    try {
      const transactions = limit 
        ? businessTransactionsState.slice(0, limit)
        : businessTransactionsState
      return transactions.map(t => ({ ...t }))
    } catch (error) {
      throw new Error("Failed to load business transactions")
    }
  },

  async processRefund(transactionId, amount, reason) {
    await delay(500)
    try {
      const transactionIndex = businessTransactionsState.findIndex(t => t.Id === parseInt(transactionId))
      if (transactionIndex === -1) {
        throw new Error("Transaction not found")
      }

      const originalTransaction = businessTransactionsState[transactionIndex]
      if (!originalTransaction.refundable) {
        throw new Error("Transaction is not refundable")
      }

      // Create refund transaction
      const refundTransaction = {
        Id: Math.max(...businessTransactionsState.map(t => t.Id)) + 1,
        type: "business_refund",
        amount: -Math.abs(parseFloat(amount)),
        currency: originalTransaction.currency,
        customer: originalTransaction.customer,
        customerEmail: originalTransaction.customerEmail,
        paymentMethod: originalTransaction.paymentMethod,
        timestamp: new Date().toISOString(),
        status: "completed",
        refundable: false,
        originalTransactionId: originalTransaction.Id,
        reason: reason
      }

      businessTransactionsState.unshift(refundTransaction)

      // Update original transaction
      businessTransactionsState[transactionIndex] = {
        ...originalTransaction,
        refundable: false,
        refunded: true
      }

      return { ...refundTransaction }
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`)
    }
  },

  async generateInvoice(customerData, items, dueDate) {
    await delay(400)
    try {
      const invoiceId = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

      const invoice = {
        Id: invoiceId,
        customer: customerData,
        items: items,
        total: total,
        currency: "USD",
        dueDate: dueDate,
        status: "pending",
        createdAt: new Date().toISOString()
      }

      return { ...invoice }
    } catch (error) {
      throw new Error("Failed to generate invoice")
    }
  },

  async createPaymentLink(amount, description, expiryHours = 24) {
    await delay(300)
    try {
      const linkId = `LINK-${Date.now()}`
      const paymentLink = {
        Id: linkId,
        amount: parseFloat(amount),
        currency: "USD",
        description: description,
        url: `https://pay.flowpay.com/${linkId}`,
        expiresAt: new Date(Date.now() + (expiryHours * 60 * 60 * 1000)).toISOString(),
        status: "active",
        createdAt: new Date().toISOString()
      }

      return { ...paymentLink }
    } catch (error) {
      throw new Error("Failed to create payment link")
    }
  },

  async downloadReport(reportType, dateRange) {
    await delay(600)
    try {
      // Simulate report generation
      const report = {
        type: reportType,
        dateRange: dateRange,
        generatedAt: new Date().toISOString(),
        downloadUrl: `https://reports.flowpay.com/${reportType}-${Date.now()}.pdf`,
        fileName: `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`
      }

      return { ...report }
    } catch (error) {
throw new Error("Failed to generate report")
    }
  },

  async generateBusinessQR(paymentData) {
    await delay(300)
    try {
      const qrData = {
        merchantId: `MERCHANT-${Date.now()}`,
        merchantName: paymentData.merchantName,
        amount: paymentData.amount,
        currency: "USD",
        description: paymentData.description,
        type: "business_payment",
        timestamp: new Date().toISOString()
      }

      // Simulate QR code generation
      const qrCode = {
        Id: `QR-${Date.now()}`,
        data: JSON.stringify(qrData),
        url: `https://pay.flowpay.com/qr/${qrData.merchantId}?amount=${paymentData.amount}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      return { ...qrCode }
    } catch (error) {
throw new Error("Failed to generate QR code")
    }
  },

  // Settlement-related mock data and methods
  async getSettlementMetrics() {
    await delay(300)
    try {
      const metrics = {
        totalPending: 12450.75,
        nextSettlementDate: "2024-01-17T09:00:00Z",
        totalFees: 892.35,
        settlementFrequency: "daily",
        lastSettlementDate: "2024-01-15T09:00:00Z",
        lastSettlementAmount: 8750.50
      }
      return { ...metrics }
    } catch (error) {
      throw new Error("Failed to load settlement metrics")
    }
  },

  async getPendingPayouts() {
    await delay(350)
    try {
      const pendingPayouts = [
        {
          Id: "PAYOUT-001",
          description: "Daily Settlement - Jan 15",
          amount: 2450.75,
          fee: 58.75,
          currency: "USD",
          transactionCount: 23,
          expectedDate: "2024-01-16T09:00:00Z",
          status: "pending",
          createdAt: "2024-01-15T23:59:00Z"
        },
        {
          Id: "PAYOUT-002", 
          description: "Business Payments Batch",
          amount: 5200.30,
          fee: 124.80,
          currency: "USD",
          transactionCount: 45,
          expectedDate: "2024-01-17T09:00:00Z",
          status: "processing",
          createdAt: "2024-01-15T18:30:00Z"
        },
        {
          Id: "PAYOUT-003",
          description: "Refund Processing",
          amount: 1850.25,
          fee: 44.40,
          currency: "USD", 
          transactionCount: 12,
          expectedDate: "2024-01-18T09:00:00Z",
          status: "pending",
          createdAt: "2024-01-15T16:45:00Z"
        },
        {
          Id: "PAYOUT-004",
          description: "Weekend Settlement",
          amount: 2949.45,
          fee: 70.80,
          currency: "USD",
          transactionCount: 31,
          expectedDate: "2024-01-19T09:00:00Z",
          status: "pending",
          createdAt: "2024-01-15T14:20:00Z"
        }
      ]
      return pendingPayouts.map(p => ({ ...p }))
    } catch (error) {
      throw new Error("Failed to load pending payouts")
    }
  },

  async getSettlementSchedule() {
    await delay(400)
    try {
      const settlements = [
        {
          Id: "SETTLE-001",
          description: "Daily Settlement - Jan 15",
          settlementDate: "2024-01-15T09:00:00Z",
          grossAmount: 8750.50,
          fees: 210.00,
          netAmount: 8540.50,
          currency: "USD",
          transactionCount: 78,
          status: "completed",
          bankAccount: "****1234"
        },
        {
          Id: "SETTLE-002",
          description: "Weekend Batch Settlement", 
          settlementDate: "2024-01-16T09:00:00Z",
          grossAmount: 12450.75,
          fees: 298.80,
          netAmount: 12151.95,
          currency: "USD",
          transactionCount: 96,
          status: "processing",
          bankAccount: "****1234"
        },
        {
          Id: "SETTLE-003",
          description: "Business Payment Settlement",
          settlementDate: "2024-01-17T09:00:00Z", 
          grossAmount: 5200.30,
          fees: 124.80,
          netAmount: 5075.50,
          currency: "USD",
          transactionCount: 45,
          status: "pending",
          bankAccount: "****1234"
        },
        {
          Id: "SETTLE-004",
          description: "Recurring Payment Settlement",
          settlementDate: "2024-01-18T09:00:00Z",
          grossAmount: 3850.25,
          fees: 92.40,
          netAmount: 3757.85,
          currency: "USD",
          transactionCount: 34,
          status: "pending", 
          bankAccount: "****1234"
        },
        {
          Id: "SETTLE-005",
          description: "Special Event Settlement",
          settlementDate: "2024-01-19T09:00:00Z",
          grossAmount: 15750.80,
          fees: 378.00,
          netAmount: 15372.80,
          currency: "USD",
          transactionCount: 125,
          status: "pending",
          bankAccount: "****1234"
        }
      ]
      return settlements.map(s => ({ ...s }))
    } catch (error) {
      throw new Error("Failed to load settlement schedule")
    }
  },

  async getFeeBreakdown() {
    await delay(300)
    try {
      const feeBreakdown = {
        summary: {
          totalVolume: 145250.85,
          totalFees: 3486.02,
          averageRate: 2.4,
          netReceived: 141764.83,
          period: "Last 30 Days"
        },
        categories: [
          {
            name: "Processing Fees",
            amount: 2105.25,
            percentage: 60.4,
            description: "Standard transaction processing"
          },
          {
            name: "Network Fees", 
            amount: 623.48,
            percentage: 17.9,
            description: "Payment network charges"
          },
          {
            name: "Risk Assessment",
            amount: 418.65,
            percentage: 12.0,
            description: "Fraud protection and risk analysis"
          },
          {
            name: "International Fees",
            amount: 338.64,
            percentage: 9.7,
            description: "Cross-border transaction fees"
          }
        ],
        monthlyTrend: [
          { month: "Dec 2023", fees: 3280.45, volume: 138520.30 },
          { month: "Jan 2024", fees: 3486.02, volume: 145250.85 }
]
      };
      return { ...feeBreakdown }
    } catch (error) {
throw new Error("Failed to load fee breakdown")
    }
  },

  async getDashboardMetrics() {
    await delay(400)
    try {
      const dashboardMetrics = {
        todaySales: 2450.75,
        todayTransactions: 23,
        pendingSettlements: 12450.75,
        monthlyRevenue: 48750.00,
        successRate: 97.8,
        nextSettlementDate: "2024-01-17T09:00:00Z",
        totalFees: 892.35,
        recentActivity: {
          lastTransaction: "2024-01-15T14:30:00Z",
          lastSettlement: "2024-01-15T09:00:00Z",
          lastRefund: "2024-01-14T16:45:00Z"
        },
        trends: {
          salesGrowth: 12.5,
          transactionGrowth: 8.2,
          successRateChange: 0.3
        },
        topCustomers: [
          { name: "Sarah Johnson", amount: 856.30, transactions: 8 },
          { name: "John Smith", amount: 642.50, transactions: 5 },
          { name: "Emma Davis", amount: 534.20, transactions: 6 }
        ]
      }
      return { ...dashboardMetrics }
    } catch (error) {
      throw new Error("Failed to load dashboard metrics")
    }
  },

  async downloadSalesReport(reportType, dateRange) {
    await delay(800)
    try {
      const reportTypes = {
        sales: "Sales Summary Report",
        settlements: "Settlement Activity Report", 
        analytics: "Business Analytics Report",
        transactions: "Transaction History Report"
      }

      const report = {
        type: reportType,
        title: reportTypes[reportType] || "Business Report",
        dateRange: dateRange,
        generatedAt: new Date().toISOString(),
        downloadUrl: `https://reports.flowpay.com/${reportType}-${Date.now()}.pdf`,
        fileName: `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`,
        size: "2.4 MB",
        pages: Math.floor(Math.random() * 20) + 5
      }

      return { ...report }
    } catch (error) {
throw new Error(`Failed to generate ${reportType} report`)
    }
  },

  // Payment link management
  async getPaymentLinks() {
    await delay(400)
    try {
      // Mock payment links data
      const paymentLinks = [
        {
          Id: "LINK-1704281234567",
          amount: 150.00,
          currency: "USD",
          description: "Product Purchase",
          url: "https://pay.flowpay.com/LINK-1704281234567",
          status: "active",
          createdAt: "2024-01-15T10:30:00Z",
          expiresAt: "2024-01-16T10:30:00Z",
          clicks: 12,
          payments: 3,
          totalCollected: 450.00
        },
        {
          Id: "LINK-1704267890123",
          amount: 75.50,
          currency: "USD",
          description: "Service Payment",
          url: "https://pay.flowpay.com/LINK-1704267890123",
          status: "used",
          createdAt: "2024-01-14T14:20:00Z",
          expiresAt: "2024-01-15T14:20:00Z",
          clicks: 8,
          payments: 1,
          totalCollected: 75.50
        },
        {
          Id: "LINK-1704254567890",
          amount: 200.00,
          currency: "USD",
          description: "Invoice #INV-001",
          url: "https://pay.flowpay.com/LINK-1704254567890",
          status: "expired",
          createdAt: "2024-01-13T16:45:00Z",
          expiresAt: "2024-01-14T16:45:00Z",
          clicks: 5,
          payments: 0,
          totalCollected: 0.00
        },
        {
          Id: "LINK-1704241234567",
          amount: 89.99,
          currency: "USD",
          description: "Monthly Subscription",
          url: "https://pay.flowpay.com/LINK-1704241234567",
          status: "active",
          createdAt: "2024-01-12T12:15:00Z",
          expiresAt: "2024-01-19T12:15:00Z",
          clicks: 25,
          payments: 8,
          totalCollected: 719.92
        },
        {
          Id: "LINK-1704227890123",
          amount: 350.00,
          currency: "USD",
          description: "Consulting Services",
          url: "https://pay.flowpay.com/LINK-1704227890123",
          status: "inactive",
          createdAt: "2024-01-11T09:30:00Z",
          expiresAt: "2024-01-18T09:30:00Z",
          clicks: 3,
          payments: 0,
          totalCollected: 0.00
        }
      ]

      return paymentLinks.map(link => ({ ...link }))
    } catch (error) {
      throw new Error("Failed to load payment links")
    }
  },

  async getPaymentLinkAnalytics() {
    await delay(300)
    try {
      const analytics = {
        totalLinks: 12,
        activeLinks: 7,
        totalClicks: 156,
        totalPayments: 28,
        totalCollected: 4250.85,
        conversionRate: 17.9,
        topPerformingLinks: [
          {
            id: "LINK-1704241234567",
            description: "Monthly Subscription",
            clicks: 25,
            payments: 8,
            conversionRate: 32.0,
            revenue: 719.92
          },
          {
            id: "LINK-1704281234567", 
            description: "Product Purchase",
            clicks: 12,
            payments: 3,
            conversionRate: 25.0,
            revenue: 450.00
          }
        ],
        recentActivity: [
          {
            type: "payment",
            linkId: "LINK-1704281234567",
            amount: 150.00,
            timestamp: "2024-01-15T14:30:00Z"
          },
          {
            type: "click",
            linkId: "LINK-1704241234567",
            timestamp: "2024-01-15T13:45:00Z"
          }
        ]
      }

      return { ...analytics }
    } catch (error) {
      throw new Error("Failed to load payment link analytics")
    }
  },

  async updatePaymentLinkStatus(linkId, status) {
    await delay(300)
    try {
      // In a real app, this would update the database
      const updatedLink = {
        Id: linkId,
        status: status,
        updatedAt: new Date().toISOString()
      }

      return { ...updatedLink }
    } catch (error) {
      throw new Error("Failed to update payment link status")
    }
  },

  async getPaymentLinkDetails(linkId) {
    await delay(250)
    try {
      const linkDetails = {
        Id: linkId,
        analytics: {
          totalClicks: 12,
          uniqueClicks: 8,
          totalPayments: 3,
          successfulPayments: 3,
          failedPayments: 0,
          conversionRate: 25.0,
          revenue: 450.00,
          averagePaymentTime: "2.3 minutes",
          topSources: [
            { source: "Direct Link", clicks: 7 },
            { source: "Email", clicks: 3 },
            { source: "Social Media", clicks: 2 }
          ],
          clickHistory: [
            { date: "2024-01-15", clicks: 4, payments: 1 },
            { date: "2024-01-14", clicks: 5, payments: 2 },
            { date: "2024-01-13", clicks: 3, payments: 0 }
          ]
        }
      }

      return { ...linkDetails }
    } catch (error) {
      throw new Error("Failed to load payment link details")
    }
  }
}