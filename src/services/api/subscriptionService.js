import subscriptionData from "@/services/mockData/subscriptions.json";
import paymentMethodService from "@/services/api/paymentMethodService";
import { format } from "date-fns";

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage for runtime data
let subscriptionsState = [...subscriptionData]
let nextId = Math.max(...subscriptionsState.map(s => s.Id), 0) + 1

export const subscriptionService = {
  async getAllSubscriptions() {
    await delay(300)
    try {
      return subscriptionsState.map(subscription => ({ ...subscription }))
    } catch (error) {
      throw new Error("Failed to load subscriptions")
    }
  },

  async getSubscriptionById(id) {
    await delay(250)
    try {
      const subscription = subscriptionsState.find(s => s.Id === parseInt(id))
      if (!subscription) {
        throw new Error("Subscription not found")
      }
      return { ...subscription }
    } catch (error) {
      throw new Error("Failed to load subscription")
    }
  },

  async getActiveSubscriptions() {
    await delay(250)
    try {
      const activeSubscriptions = subscriptionsState.filter(s => s.status === 'active')
      return activeSubscriptions.map(subscription => ({ ...subscription }))
    } catch (error) {
      throw new Error("Failed to load active subscriptions")
    }
  },

  async getSubscriptionsByStatus(status) {
    await delay(200)
    try {
      const filtered = subscriptionsState.filter(s => s.status === status)
      return filtered.map(subscription => ({ ...subscription }))
    } catch (error) {
      throw new Error("Failed to load subscriptions by status")
    }
  },

  async getSubscriptionsByCategory(category) {
    await delay(200)
    try {
      const filtered = subscriptionsState.filter(s => s.category === category)
      return filtered.map(subscription => ({ ...subscription }))
    } catch (error) {
      throw new Error("Failed to load subscriptions by category")
    }
  },

  async createSubscription(subscriptionData) {
    await delay(400)
    try {
      // Validate required fields
      if (!subscriptionData.serviceName || !subscriptionData.amount || !subscriptionData.billingCycle) {
        throw new Error("Missing required subscription information")
      }

      // Validate payment method exists
      if (subscriptionData.paymentMethodId) {
        await paymentMethodService.getPaymentMethodById(subscriptionData.paymentMethodId)
      }

      const newSubscription = {
        Id: nextId++,
        serviceName: subscriptionData.serviceName,
        serviceIcon: subscriptionData.serviceIcon || "CreditCard",
        amount: parseFloat(subscriptionData.amount),
        currency: subscriptionData.currency || "USD",
        billingCycle: subscriptionData.billingCycle,
        nextPaymentDate: subscriptionData.nextPaymentDate || calculateNextPaymentDate(subscriptionData.billingCycle),
        status: "active",
        paymentMethodId: subscriptionData.paymentMethodId || null,
        description: subscriptionData.description || "",
        category: subscriptionData.category || "Other",
        autoRenew: subscriptionData.autoRenew !== false,
        createdDate: new Date().toISOString(),
        lastPaymentDate: null,
        totalPaid: 0,
        paymentsCount: 0
      }

      subscriptionsState.push(newSubscription)
      return { ...newSubscription }
    } catch (error) {
      throw new Error("Failed to create subscription: " + error.message)
    }
  },

  async updateSubscription(id, updates) {
    await delay(400)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(id))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      // Validate payment method if being updated
      if (updates.paymentMethodId) {
        await paymentMethodService.getPaymentMethodById(updates.paymentMethodId)
      }

      // Prevent updating certain fields
      const { Id, createdDate, totalPaid, paymentsCount, ...allowedUpdates } = updates

      subscriptionsState[subscriptionIndex] = {
        ...subscriptionsState[subscriptionIndex],
        ...allowedUpdates
      }

      return { ...subscriptionsState[subscriptionIndex] }
    } catch (error) {
      throw new Error("Failed to update subscription: " + error.message)
    }
  },

  async pauseSubscription(id) {
    await delay(350)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(id))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      const subscription = subscriptionsState[subscriptionIndex]
      if (subscription.status !== 'active') {
        throw new Error("Only active subscriptions can be paused")
      }

      subscriptionsState[subscriptionIndex] = {
        ...subscription,
        status: 'paused',
        autoRenew: false
      }

      return { ...subscriptionsState[subscriptionIndex] }
    } catch (error) {
      throw new Error("Failed to pause subscription: " + error.message)
    }
  },

  async resumeSubscription(id) {
    await delay(350)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(id))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      const subscription = subscriptionsState[subscriptionIndex]
      if (subscription.status !== 'paused') {
        throw new Error("Only paused subscriptions can be resumed")
      }

      subscriptionsState[subscriptionIndex] = {
        ...subscription,
        status: 'active',
        autoRenew: true,
        nextPaymentDate: calculateNextPaymentDate(subscription.billingCycle)
      }

      return { ...subscriptionsState[subscriptionIndex] }
    } catch (error) {
      throw new Error("Failed to resume subscription: " + error.message)
    }
  },

  async cancelSubscription(id, reason = "") {
    await delay(400)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(id))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      subscriptionsState[subscriptionIndex] = {
        ...subscriptionsState[subscriptionIndex],
        status: 'cancelled',
        autoRenew: false,
        cancellationReason: reason,
        cancellationDate: new Date().toISOString()
      }

      return { ...subscriptionsState[subscriptionIndex] }
    } catch (error) {
      throw new Error("Failed to cancel subscription: " + error.message)
    }
  },

  async deleteSubscription(id) {
    await delay(400)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(id))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      const subscription = subscriptionsState[subscriptionIndex]
      if (subscription.status === 'active') {
        throw new Error("Cannot delete active subscription. Please cancel it first.")
      }

      const deletedSubscription = subscriptionsState.splice(subscriptionIndex, 1)[0]
      return { ...deletedSubscription }
    } catch (error) {
      throw new Error("Failed to delete subscription: " + error.message)
    }
  },

  async updateSubscriptionPaymentMethod(id, paymentMethodId) {
    await delay(350)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(id))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      // Validate payment method exists
      await paymentMethodService.getPaymentMethodById(paymentMethodId)

      subscriptionsState[subscriptionIndex] = {
        ...subscriptionsState[subscriptionIndex],
        paymentMethodId: parseInt(paymentMethodId)
      }

      return { ...subscriptionsState[subscriptionIndex] }
    } catch (error) {
      throw new Error("Failed to update payment method: " + error.message)
    }
  },

  async getSubscriptionAnalytics() {
    await delay(300)
    try {
      const totalSubscriptions = subscriptionsState.length
      const activeSubscriptions = subscriptionsState.filter(s => s.status === 'active').length
      const pausedSubscriptions = subscriptionsState.filter(s => s.status === 'paused').length
      const cancelledSubscriptions = subscriptionsState.filter(s => s.status === 'cancelled').length

      const monthlySpend = subscriptionsState
        .filter(s => s.status === 'active' && s.billingCycle === 'monthly')
        .reduce((sum, s) => sum + s.amount, 0)

      const yearlySpend = subscriptionsState
        .filter(s => s.status === 'active' && s.billingCycle === 'yearly')
        .reduce((sum, s) => sum + s.amount, 0)

      const totalAnnualSpend = monthlySpend * 12 + yearlySpend

      const categoryBreakdown = subscriptionsState.reduce((breakdown, sub) => {
        breakdown[sub.category] = (breakdown[sub.category] || 0) + 1
        return breakdown
      }, {})

      const avgSubscriptionValue = totalSubscriptions > 0 
        ? subscriptionsState.reduce((sum, s) => sum + s.totalPaid, 0) / totalSubscriptions 
        : 0

      return {
        totalSubscriptions,
        activeSubscriptions,
        pausedSubscriptions,
        cancelledSubscriptions,
        monthlySpend,
        yearlySpend,
        totalAnnualSpend,
        categoryBreakdown,
        avgSubscriptionValue,
        upcomingPayments: await this.getUpcomingPayments(7)
      }
    } catch (error) {
      throw new Error("Failed to load subscription analytics")
    }
  },

  async getUpcomingPayments(daysAhead = 30) {
    await delay(250)
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() + daysAhead)

      const upcoming = subscriptionsState
        .filter(s => s.status === 'active' && new Date(s.nextPaymentDate) <= cutoffDate)
        .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))

      return upcoming.map(subscription => ({ ...subscription }))
    } catch (error) {
      throw new Error("Failed to load upcoming payments")
    }
  },

  async searchSubscriptions(query) {
    await delay(200)
    try {
      const lowercaseQuery = query.toLowerCase()
      const filtered = subscriptionsState.filter(subscription => 
        subscription.serviceName.toLowerCase().includes(lowercaseQuery) ||
        subscription.description.toLowerCase().includes(lowercaseQuery) ||
        subscription.category.toLowerCase().includes(lowercaseQuery)
      )

      return filtered.map(subscription => ({ ...subscription }))
    } catch (error) {
      throw new Error("Failed to search subscriptions")
    }
  },

  async detectSubscriptionsFromTransactions() {
    await delay(400)
    try {
      // This would analyze transaction history to detect recurring payments
      // For now, return potential subscriptions that could be added
      const potentialSubscriptions = [
        {
          serviceName: "YouTube Premium",
          amount: 11.99,
          frequency: "monthly",
          confidence: 0.95,
          lastSeen: "2024-01-10T00:00:00Z"
        },
{
          serviceName: "Dropbox",
          amount: 9.99,
          frequency: "monthly",
          confidence: 0.87,
          lastSeen: "2024-01-08T00:00:00Z"
        }
      ]

      return potentialSubscriptions
    } catch (error) {
      throw new Error("Failed to analyze transactions for subscriptions")
    }
  },

  async simulatePaymentFailure(subscriptionId, reason = "insufficient_funds") {
    await delay(300)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(subscriptionId))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      const subscription = subscriptionsState[subscriptionIndex]
      const now = new Date()

      // Create failed payment record
      const failedPayment = {
        Id: `failed_${subscriptionId}_${Date.now()}`,
        subscriptionId: subscription.Id,
        amount: subscription.amount,
        currency: subscription.currency,
        attemptedAt: now.toISOString(),
        reason: reason,
        retryCount: 0,
        maxRetries: 3,
        nextRetryDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 hours later
      }

      // Store failed payment (in real app, this would be in database)
      if (!subscriptionsState[subscriptionIndex].failedPayments) {
        subscriptionsState[subscriptionIndex].failedPayments = []
      }
      subscriptionsState[subscriptionIndex].failedPayments.push(failedPayment)

      return failedPayment
    } catch (error) {
      throw new Error("Failed to simulate payment failure: " + error.message)
    }
  },

  async retryFailedPayment(subscriptionId, failedPaymentId) {
    await delay(400)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(subscriptionId))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      const subscription = subscriptionsState[subscriptionIndex]
      const failedPaymentIndex = subscription.failedPayments?.findIndex(fp => fp.Id === failedPaymentId)
      
      if (failedPaymentIndex === -1 || !subscription.failedPayments) {
        throw new Error("Failed payment record not found")
      }

      const failedPayment = subscription.failedPayments[failedPaymentIndex]
      
      // Simulate payment success/failure (80% success rate for retry)
      const isSuccessful = Math.random() > 0.2

      if (isSuccessful) {
        // Remove from failed payments
        subscription.failedPayments.splice(failedPaymentIndex, 1)
        
        // Update subscription
        subscription.lastPaymentDate = new Date().toISOString()
        subscription.nextPaymentDate = calculateNextPaymentDate(subscription.billingCycle)
        subscription.totalPaid += subscription.amount
        subscription.paymentsCount += 1

        return { success: true, message: "Payment retry successful" }
      } else {
        // Update retry count
        failedPayment.retryCount += 1
        const now = new Date()
        
        if (failedPayment.retryCount >= failedPayment.maxRetries) {
          // Max retries reached - pause subscription
          subscription.status = 'paused'
          subscription.autoRenew = false
          return { success: false, message: "Maximum retry attempts reached. Subscription paused." }
        } else {
          // Schedule next retry
          failedPayment.nextRetryDate = new Date(now.getTime() + (24 * 60 * 60 * 1000) * failedPayment.retryCount).toISOString()
          return { success: false, message: `Payment retry failed. Next retry scheduled for ${format(new Date(failedPayment.nextRetryDate), "MMM dd, yyyy")}` }
        }
      }
    } catch (error) {
      throw new Error("Failed to retry payment: " + error.message)
    }
  },

  async getSpendingAlerts() {
    await delay(250)
    try {
      const now = new Date()
      const alerts = []
      
      for (const subscription of subscriptionsState) {
        if (subscription.status !== 'active') continue
        
        // Check spending threshold alerts
        if (subscription.alertSettings?.spendingThreshold && subscription.spendingAlertThreshold) {
          const monthlySpend = subscription.billingCycle === 'monthly' ? subscription.amount :
                              subscription.billingCycle === 'yearly' ? subscription.amount / 12 :
                              subscription.amount * 4 // quarterly to monthly
          
          if (monthlySpend >= subscription.spendingAlertThreshold) {
            alerts.push({
              Id: `spending_${subscription.Id}`,
              type: 'spending_threshold',
              subscriptionId: subscription.Id,
              serviceName: subscription.serviceName,
              message: `Monthly spending for ${subscription.serviceName} ($${monthlySpend.toFixed(2)}) exceeds your alert threshold of $${subscription.spendingAlertThreshold.toFixed(2)}`,
              amount: monthlySpend,
              threshold: subscription.spendingAlertThreshold,
              severity: monthlySpend >= subscription.spendingAlertThreshold * 1.5 ? 'high' : 'medium',
              createdAt: now.toISOString()
            })
          }
        }
        
        // Check upcoming payment alerts
        if (subscription.alertSettings?.upcomingPayment) {
          const paymentDate = new Date(subscription.nextPaymentDate)
          const daysUntilPayment = Math.ceil((paymentDate - now) / (1000 * 60 * 60 * 24))
          
          if (daysUntilPayment <= 7 && daysUntilPayment > 0) {
            alerts.push({
              Id: `payment_${subscription.Id}`,
              type: 'upcoming_payment',
              subscriptionId: subscription.Id,
              serviceName: subscription.serviceName,
              message: `${subscription.serviceName} payment of $${subscription.amount.toFixed(2)} due in ${daysUntilPayment} day${daysUntilPayment > 1 ? 's' : ''}`,
              amount: subscription.amount,
              daysUntil: daysUntilPayment,
              severity: daysUntilPayment <= 3 ? 'high' : 'low',
              createdAt: now.toISOString()
            })
          }
        }
        
// Check auto-renewal alerts
        if (subscription.autoRenew && subscription.alertSettings?.autoRenewal) {
          const paymentDate = new Date(subscription.nextPaymentDate)
          const daysUntilRenewal = Math.ceil((paymentDate - now) / (1000 * 60 * 60 * 24))
          
          if (daysUntilRenewal <= 30 && daysUntilRenewal > 0) {
            alerts.push({
              Id: `renewal_${subscription.Id}`,
              type: 'auto_renewal',
              subscriptionId: subscription.Id,
              serviceName: subscription.serviceName,
              message: `${subscription.serviceName} will auto-renew in ${daysUntilRenewal} day${daysUntilRenewal > 1 ? 's' : ''}`,
              amount: subscription.amount,
              daysUntil: daysUntilRenewal,
              severity: 'low',
              createdAt: now.toISOString()
            })
          }
        }
      }
      
      return alerts
    } catch (error) {
      throw new Error("Failed to load spending alerts")
    }
  },

  async updateAlertSettings(subscriptionId, alertSettings) {
    await delay(300)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(subscriptionId))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      subscriptionsState[subscriptionIndex] = {
        ...subscriptionsState[subscriptionIndex],
        alertSettings: { ...subscriptionsState[subscriptionIndex].alertSettings, ...alertSettings }
      }

      return { ...subscriptionsState[subscriptionIndex] }
    } catch (error) {
      throw new Error("Failed to update alert settings: " + error.message)
    }
  },

  async updateSpendingThreshold(subscriptionId, threshold) {
    await delay(300)
    try {
      const subscriptionIndex = subscriptionsState.findIndex(s => s.Id === parseInt(subscriptionId))
      if (subscriptionIndex === -1) {
        throw new Error("Subscription not found")
      }

      subscriptionsState[subscriptionIndex] = {
        ...subscriptionsState[subscriptionIndex],
        spendingAlertThreshold: parseFloat(threshold)
      }

      return { ...subscriptionsState[subscriptionIndex] }
    } catch (error) {
      throw new Error("Failed to update spending threshold: " + error.message)
    }
  }
}

// Helper function to calculate next payment date based on billing cycle
function calculateNextPaymentDate(billingCycle) {
  const now = new Date()
  const nextPayment = new Date(now)

  switch (billingCycle) {
    case 'weekly':
      nextPayment.setDate(now.getDate() + 7)
      break
    case 'monthly':
      nextPayment.setMonth(now.getMonth() + 1)
      break
    case 'quarterly':
      nextPayment.setMonth(now.getMonth() + 3)
      break
    case 'yearly':
      nextPayment.setFullYear(now.getFullYear() + 1)
      break
    default:
      nextPayment.setMonth(now.getMonth() + 1)
  }

  return nextPayment.toISOString()
}

export default subscriptionService