import React from "react";
import transactionData from "@/services/mockData/transactions.json";
import fundingSourceData from "@/services/mockData/fundingSources.json";
import walletData from "@/services/mockData/wallets.json";
import Error from "@/components/ui/Error";

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage for runtime data
let walletsState = [...walletData]
let transactionsState = [...transactionData]

export const walletService = {
  async getAllWallets() {
    await delay(300)
    try {
      return [...walletsState]
    } catch (error) {
      throw new Error("Failed to load wallets")
    }
  },

  async getWalletById(id) {
    await delay(250)
    try {
      const wallet = walletsState.find(w => w.Id === parseInt(id))
      if (!wallet) {
        throw new Error("Wallet not found")
      }
      return { ...wallet }
    } catch (error) {
      throw new Error("Failed to load wallet")
    }
  },

  async getPrimaryWallet() {
    await delay(200)
    try {
      const primary = walletsState.find(w => w.isPrimary === true)
      if (!primary) {
        throw new Error("No primary wallet found")
      }
      return { ...primary }
    } catch (error) {
      throw new Error("Failed to load primary wallet")
    }
  },

  async getSecondaryWallets() {
    await delay(250)
    try {
      return walletsState.filter(w => w.isPrimary !== true).map(w => ({ ...w }))
    } catch (error) {
      throw new Error("Failed to load secondary wallets")
    }
  },

  async updateBalance(walletId, newBalance) {
    await delay(400)
    try {
      const walletIndex = walletsState.findIndex(w => w.Id === parseInt(walletId))
      if (walletIndex === -1) {
        throw new Error("Wallet not found")
      }
      
      walletsState[walletIndex] = {
        ...walletsState[walletIndex],
        balance: parseFloat(newBalance)
      }
      
      return { ...walletsState[walletIndex] }
    } catch (error) {
      throw new Error("Failed to update balance")
    }
  },

  async addFunds(walletId, amount, fundingSourceId) {
    await delay(500)
    try {
      const walletIndex = walletsState.findIndex(w => w.Id === parseInt(walletId))
      if (walletIndex === -1) {
        throw new Error("Wallet not found")
      }

      const fundingSource = fundingSourceData.find(fs => fs.Id === parseInt(fundingSourceId))
      if (!fundingSource) {
        throw new Error("Funding source not found")
      }

      // Update wallet balance
      const currentBalance = walletsState[walletIndex].balance
      const newBalance = currentBalance + parseFloat(amount)
      walletsState[walletIndex] = {
        ...walletsState[walletIndex],
        balance: newBalance
      }

      // Create new transaction
      const newTransaction = {
        Id: Math.max(...transactionsState.map(t => t.Id)) + 1,
        type: "deposit",
        amount: parseFloat(amount),
        currency: walletsState[walletIndex].currency,
        recipient: `Added via ${fundingSource.name}`,
        timestamp: new Date().toISOString(),
        status: "completed"
      }

      transactionsState.unshift(newTransaction)

      return {
        wallet: { ...walletsState[walletIndex] },
        transaction: { ...newTransaction }
      }
    } catch (error) {
      throw new Error("Failed to add funds")
    }
  },

  async getRecentTransactions(limit = 3) {
    await delay(200)
    try {
      return transactionsState
        .slice(0, limit)
        .map(t => ({ ...t }))
    } catch (error) {
      throw new Error("Failed to load recent transactions")
    }
  },

  async getAllTransactions() {
    await delay(300)
    try {
      return transactionsState.map(t => ({ ...t }))
    } catch (error) {
      throw new Error("Failed to load transactions")
    }
  },

async getFundingSources() {
    await delay(250)
    try {
      return fundingSourceData.map(fs => ({ ...fs }))
    } catch (error) {
      throw new Error("Failed to load funding sources")
    }
  },

  async getFilteredTransactions(transactions, filters) {
    await delay(100) // Small delay for smooth UX
    try {
      let filtered = [...transactions]

      // Filter by type
      if (filters.type && filters.type !== "all") {
        filtered = filtered.filter(t => t.type === filters.type)
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(t =>
          t.recipient.toLowerCase().includes(query)
        )
      }

      // Filter by date range
      if (filters.dateFrom || filters.dateTo) {
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.timestamp)
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
          const toDate = filters.dateTo ? new Date(filters.dateTo + "T23:59:59") : null

          if (fromDate && transactionDate < fromDate) return false
          if (toDate && transactionDate > toDate) return false
          return true
        })
      }

      // Filter by amount range
      if (filters.amountMin !== "" || filters.amountMax !== "") {
        filtered = filtered.filter(t => {
          const amount = Math.abs(t.amount)
          const minAmount = filters.amountMin ? parseFloat(filters.amountMin) : 0
          const maxAmount = filters.amountMax ? parseFloat(filters.amountMax) : Infinity

          return amount >= minAmount && amount <= maxAmount
        })
      }

      return filtered
    } catch (error) {
throw new Error("Failed to filter transactions")
    }
  },

  async sendP2PTransfer({ fromWalletId, toContactId, amount, paymentMethodId, note }) {
    await delay(600)
    try {
      const walletIndex = walletsState.findIndex(w => w.Id === parseInt(fromWalletId))
      if (walletIndex === -1) {
        throw new Error("Wallet not found")
      }

      const fundingSource = fundingSourceData.find(fs => fs.Id === parseInt(paymentMethodId))
      if (!fundingSource) {
        throw new Error("Payment method not found")
      }

      // For simplicity, we'll just deduct from wallet balance
      const currentBalance = walletsState[walletIndex].balance
      const transferAmount = parseFloat(amount)
      
      if (currentBalance < transferAmount) {
        throw new Error("Insufficient funds")
      }

      const newBalance = currentBalance - transferAmount
      walletsState[walletIndex] = {
        ...walletsState[walletIndex],
        balance: newBalance
      }

      // Create new transaction
      const newTransaction = {
        Id: Math.max(...transactionsState.map(t => t.Id)) + 1,
        type: "p2p_sent",
        amount: -transferAmount,
        currency: walletsState[walletIndex].currency,
        recipient: `Contact ID: ${toContactId}`,
        note: note || "",
        timestamp: new Date().toISOString(),
        status: "completed"
      }

      transactionsState.unshift(newTransaction)

      return {
        wallet: { ...walletsState[walletIndex] },
        transaction: { ...newTransaction }
      }
    } catch (error) {
throw new Error("Failed to send P2P transfer")
    }
  },

  async currencyExchange({ fromWalletId, toWalletId, fromAmount, toAmount, exchangeRate }) {
    await delay(500)
    try {
      const fromWalletIndex = walletsState.findIndex(w => w.Id === parseInt(fromWalletId))
      const toWalletIndex = walletsState.findIndex(w => w.Id === parseInt(toWalletId))
      
      if (fromWalletIndex === -1) {
        throw new Error("Source wallet not found")
      }
      if (toWalletIndex === -1) {
        throw new Error("Target wallet not found")
      }

      const fromWallet = walletsState[fromWalletIndex]
      const toWallet = walletsState[toWalletIndex]
      const amount = parseFloat(fromAmount)
      const convertedAmount = parseFloat(toAmount)
      
      if (fromWallet.balance < amount) {
        throw new Error("Insufficient funds in source wallet")
      }

      // Update balances
      walletsState[fromWalletIndex] = {
        ...fromWallet,
        balance: fromWallet.balance - amount
      }
      
      walletsState[toWalletIndex] = {
        ...toWallet,
        balance: toWallet.balance + convertedAmount
      }

      // Create transaction records
      const exchangeTransaction = {
        Id: Math.max(...transactionsState.map(t => t.Id)) + 1,
        type: "currency_exchange",
        amount: -amount,
        currency: fromWallet.currency,
        recipient: `Exchanged to ${toWallet.currency}`,
        note: `Rate: 1 ${fromWallet.currency} = ${exchangeRate} ${toWallet.currency}`,
        timestamp: new Date().toISOString(),
        status: "completed"
      }

      const receiveTransaction = {
        Id: Math.max(...transactionsState.map(t => t.Id)) + 2,
        type: "currency_exchange",
        amount: convertedAmount,
        currency: toWallet.currency,
        recipient: `Received from ${fromWallet.currency}`,
        note: `Rate: 1 ${fromWallet.currency} = ${exchangeRate} ${toWallet.currency}`,
        timestamp: new Date().toISOString(),
        status: "completed"
      }

      transactionsState.unshift(exchangeTransaction, receiveTransaction)

      return {
        fromWallet: { ...walletsState[fromWalletIndex] },
        toWallet: { ...walletsState[toWalletIndex] },
        transactions: [exchangeTransaction, receiveTransaction]
      }
    } catch (error) {
      throw new Error("Failed to process currency exchange")
    }
},

  // Business transaction methods
  async getBusinessTransactions(limit) {
    await delay(250)
    try {
      const businessTransactions = transactionsState.filter(t => 
        t.type === "business_payment" || t.type === "business_refund"
      )
      
      const transactions = limit 
        ? businessTransactions.slice(0, limit)
        : businessTransactions
        
      return transactions.map(t => ({ ...t }))
    } catch (error) {
      throw new Error("Failed to load business transactions")
    }
  },

  async getBusinessMetrics() {
    await delay(300)
    try {
      const businessTransactions = transactionsState.filter(t => 
        t.type === "business_payment" || t.type === "business_refund"
      )
      
      const today = new Date().toISOString().split('T')[0]
      const todayTransactions = businessTransactions.filter(t => 
        t.timestamp.startsWith(today)
      )
      
      const todaySales = todayTransactions
        .filter(t => t.type === "business_payment" && t.status === "completed")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      const pendingSettlements = businessTransactions
        .filter(t => t.status === "pending")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      const completedTransactions = businessTransactions.filter(t => t.status === "completed")
      const successRate = businessTransactions.length > 0 
        ? (completedTransactions.length / businessTransactions.length) * 100 
        : 0
      
      return {
        todaySales,
        todayTransactions: todayTransactions.length,
        pendingSettlements,
        monthlyRevenue: businessTransactions
          .filter(t => t.type === "business_payment" && t.status === "completed")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        successRate: Math.round(successRate * 10) / 10,
        topPaymentMethods: [
          { method: "Credit Card", percentage: 45.2, amount: 12500.50 },
          { method: "Debit Card", percentage: 28.6, amount: 7940.25 },
          { method: "Bank Transfer", percentage: 16.8, amount: 4680.00 },
          { method: "PayPal", percentage: 9.4, amount: 2619.25 }
        ],
        revenueChart: {
          daily: [
            { date: "Jan 15", revenue: todaySales },
            { date: "Jan 14", revenue: 1875.30 },
            { date: "Jan 13", revenue: 2200.45 },
            { date: "Jan 12", revenue: 1950.80 },
            { date: "Jan 11", revenue: 2750.20 },
            { date: "Jan 10", revenue: 2100.65 },
            { date: "Jan 09", revenue: 1680.90 }
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
    } catch (error) {
      throw new Error("Failed to load business metrics")
    }
  }
}