import React from "react";
import fundingSourceData from "@/services/mockData/fundingSources.json";
import Error from "@/components/ui/Error";

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage for runtime data
let paymentMethodsState = [...fundingSourceData]

export const paymentMethodService = {
  async getAllPaymentMethods() {
    await delay(300)
    try {
      return paymentMethodsState.map(method => ({ ...method }))
    } catch (error) {
      throw new Error("Failed to load payment methods")
    }
  },

  async getPaymentMethodById(id) {
    await delay(250)
    try {
      const method = paymentMethodsState.find(m => m.Id === parseInt(id))
      if (!method) {
        throw new Error("Payment method not found")
      }
      return { ...method }
    } catch (error) {
      throw new Error("Failed to load payment method")
    }
  },

  async getDefaultPaymentMethod() {
    await delay(200)
    try {
      const defaultMethod = paymentMethodsState.find(m => m.isDefault === true)
      if (!defaultMethod) {
        throw new Error("No default payment method found")
      }
      return { ...defaultMethod }
    } catch (error) {
      throw new Error("Failed to load default payment method")
    }
  },

  async updatePaymentMethod(id, updates) {
    await delay(400)
    try {
      const methodIndex = paymentMethodsState.findIndex(m => m.Id === parseInt(id))
      if (methodIndex === -1) {
        throw new Error("Payment method not found")
      }

      paymentMethodsState[methodIndex] = {
        ...paymentMethodsState[methodIndex],
        ...updates
      }

      return { ...paymentMethodsState[methodIndex] }
    } catch (error) {
      throw new Error("Failed to update payment method")
    }
  },

  async setDefaultPaymentMethod(id) {
    await delay(350)
    try {
      // Remove default from all methods
      paymentMethodsState.forEach(method => method.isDefault = false)
      
      // Set new default
      const methodIndex = paymentMethodsState.findIndex(m => m.Id === parseInt(id))
      if (methodIndex === -1) {
        throw new Error("Payment method not found")
      }
      
      paymentMethodsState[methodIndex].isDefault = true
      
      return paymentMethodsState.map(method => ({ ...method }))
    } catch (error) {
      throw new Error("Failed to set default payment method")
    }
  },

  async deletePaymentMethod(id) {
    await delay(400)
    try {
      const methodIndex = paymentMethodsState.findIndex(m => m.Id === parseInt(id))
      if (methodIndex === -1) {
        throw new Error("Payment method not found")
      }
      
      const method = paymentMethodsState[methodIndex]
      if (method.isDefault && paymentMethodsState.length > 1) {
        throw new Error("Cannot delete default payment method. Please set another as default first.")
      }
      
      const deletedMethod = paymentMethodsState.splice(methodIndex, 1)[0]
      return { ...deletedMethod }
    } catch (error) {
      throw new Error("Failed to delete payment method")
    }
  },

  async updatePaymentMethodAlias(id, alias) {
    await delay(300)
    try {
      const methodIndex = paymentMethodsState.findIndex(m => m.Id === parseInt(id))
      if (methodIndex === -1) {
        throw new Error("Payment method not found")
      }
      
      paymentMethodsState[methodIndex] = {
        ...paymentMethodsState[methodIndex],
        alias: alias || paymentMethodsState[methodIndex].name
      }
      
      return { ...paymentMethodsState[methodIndex] }
    } catch (error) {
      throw new Error("Failed to update payment method alias")
    }
  },

  async recordPaymentMethodUsage(id, amount) {
    await delay(200)
    try {
      const methodIndex = paymentMethodsState.findIndex(m => m.Id === parseInt(id))
      if (methodIndex === -1) {
        throw new Error("Payment method not found")
      }
      
      const method = paymentMethodsState[methodIndex]
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      // Update usage statistics
      paymentMethodsState[methodIndex] = {
        ...method,
        usageCount: (method.usageCount || 0) + 1,
        totalSpent: (method.totalSpent || 0) + parseFloat(amount),
        lastUsed: new Date().toISOString(),
        monthlyUsage: updateMonthlyUsage(method.monthlyUsage || [], currentMonth, parseFloat(amount))
      }
      
      return { ...paymentMethodsState[methodIndex] }
    } catch (error) {
      throw new Error("Failed to record payment method usage")
    }
  },

  async getPaymentMethodUsageStats(id) {
    await delay(250)
    try {
      const method = paymentMethodsState.find(m => m.Id === parseInt(id))
      if (!method) {
        throw new Error("Payment method not found")
      }
      
      return {
        ...method,
        averageTransactionAmount: method.usageCount > 0 ? method.totalSpent / method.usageCount : 0,
        monthlyTrend: method.monthlyUsage || [],
        riskScore: method.usageCount > 10 ? "low" : method.usageCount > 5 ? "medium" : "high"
      }
    } catch (error) {
      throw new Error("Failed to load payment method statistics")
    }
  },

  async getPaymentMethodsByType(type) {
    await delay(200)
    try {
      const methods = paymentMethodsState.filter(m => m.type === type)
      return methods.map(method => ({ ...method }))
    } catch (error) {
      throw new Error("Failed to load payment methods by type")
    }
  },

  async getPaymentMethodAnalytics() {
    await delay(350)
    try {
      const totalMethods = paymentMethodsState.length
      const activeMethods = paymentMethodsState.filter(m => m.isActive).length
      const totalSpent = paymentMethodsState.reduce((sum, m) => sum + (m.totalSpent || 0), 0)
      const totalUsage = paymentMethodsState.reduce((sum, m) => sum + (m.usageCount || 0), 0)
      const mostUsedMethod = paymentMethodsState.reduce((most, method) => 
        (method.usageCount || 0) > (most.usageCount || 0) ? method : most
      , paymentMethodsState[0])

      return {
        totalMethods,
        activeMethods,
        totalSpent,
        totalUsage,
        averageSpentPerMethod: totalMethods > 0 ? totalSpent / totalMethods : 0,
        mostUsedMethod: mostUsedMethod ? { ...mostUsedMethod } : null,
        methodsByType: {
          bank: paymentMethodsState.filter(m => m.type === "bank").length,
          card: paymentMethodsState.filter(m => m.type === "card").length
        }
      }
    } catch (error) {
      throw new Error("Failed to load payment method analytics")
    }
  }
}

// Helper function to update monthly usage statistics
function updateMonthlyUsage(currentUsage, month, amount) {
  const monthYear = new Date(month).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  })
  
  const existingIndex = currentUsage.findIndex(usage => usage.month === monthYear)
  
  if (existingIndex !== -1) {
    const updated = [...currentUsage]
    updated[existingIndex] = {
      ...updated[existingIndex],
      transactions: updated[existingIndex].transactions + 1,
      amount: updated[existingIndex].amount + amount
    }
    return updated
  } else {
    return [
      { month: monthYear, transactions: 1, amount },
      ...currentUsage.slice(0, 11) // Keep only last 12 months
]
  }
}

export const paymentMethodServiceExtended = {
  async getPaymentMethodsForSubscriptions() {
    await delay(200)
    try {
      // Return active payment methods suitable for subscriptions
      const suitableMethods = paymentMethodsState.filter(m => 
        m.isActive && (m.type === "card" || m.type === "bank")
      )
      return suitableMethods.map(method => ({ ...method }))
    } catch (error) {
      throw new Error("Failed to load payment methods for subscriptions")
    }
  },

  async assignPaymentMethodToSubscription(subscriptionId, paymentMethodId) {
    await delay(300)
    try {
      const method = paymentMethodsState.find(m => m.Id === parseInt(paymentMethodId))
      if (!method) {
        throw new Error("Payment method not found")
      }
      
      if (!method.isActive) {
        throw new Error("Cannot assign inactive payment method to subscription")
      }
      
      // Update subscription assignment count
      const methodIndex = paymentMethodsState.findIndex(m => m.Id === parseInt(paymentMethodId))
      paymentMethodsState[methodIndex] = {
        ...method,
        subscriptionCount: (method.subscriptionCount || 0) + 1,
        lastSubscriptionAssignment: new Date().toISOString()
      }
      
      return { 
        success: true, 
        paymentMethod: { ...paymentMethodsState[methodIndex] },
        subscriptionId: parseInt(subscriptionId)
      }
    } catch (error) {
      throw new Error("Failed to assign payment method to subscription: " + error.message)
    }
  },

  async removePaymentMethodFromSubscription(subscriptionId, paymentMethodId) {
    await delay(300)
    try {
      const methodIndex = paymentMethodsState.findIndex(m => m.Id === parseInt(paymentMethodId))
      if (methodIndex === -1) {
        throw new Error("Payment method not found")
      }
      
      const method = paymentMethodsState[methodIndex]
      paymentMethodsState[methodIndex] = {
        ...method,
        subscriptionCount: Math.max((method.subscriptionCount || 1) - 1, 0)
      }
      
      return { 
        success: true, 
        subscriptionId: parseInt(subscriptionId),
        paymentMethodId: parseInt(paymentMethodId)
      }
    } catch (error) {
      throw new Error("Failed to remove payment method from subscription: " + error.message)
    }
  },

  async getSubscriptionPaymentMethods(subscriptionIds) {
    await delay(250)
    try {
      const methods = paymentMethodsState.filter(m => 
        m.subscriptionCount && m.subscriptionCount > 0
      )
      
      return methods.map(method => ({
        ...method,
        assignedSubscriptions: subscriptionIds.filter(() => Math.random() > 0.5) // Mock assignment
      }))
    } catch (error) {
      throw new Error("Failed to load subscription payment methods")
    }
  }
}

export default paymentMethodService