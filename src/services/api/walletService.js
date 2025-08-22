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
  }
}