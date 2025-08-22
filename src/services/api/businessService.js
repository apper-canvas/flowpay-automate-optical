import transactionData from "@/services/mockData/transactions.json"

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
  }
}