import subscriptionService from "@/services/api/subscriptionService";
import { format } from "date-fns";

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage for runtime data
let alertsState = [
  {
    Id: 1,
    type: 'failed_payment',
    subscriptionId: 1,
    serviceName: 'Netflix',
    title: 'Payment Failed',
    message: 'Your Netflix payment of $15.99 failed due to insufficient funds. Please update your payment method.',
    severity: 'high',
    amount: 15.99,
    currency: 'USD',
    failureReason: 'insufficient_funds',
    retryCount: 1,
    maxRetries: 3,
    nextRetryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    Id: 2,
    type: 'upcoming_payment',
    subscriptionId: 2,
    serviceName: 'Spotify',
    title: 'Payment Due Soon',
    message: 'Your Spotify payment of $9.99 is due in 2 days on Jan 25, 2024.',
    severity: 'medium',
    amount: 9.99,
    currency: 'USD',
    daysUntil: 2,
    paymentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    Id: 3,
    type: 'spending_threshold',
    subscriptionId: 3,
    serviceName: 'Adobe Creative Cloud',
    title: 'Spending Limit Warning',
    message: 'Your monthly spending for Adobe Creative Cloud ($52.99) has exceeded your alert threshold of $50.00.',
    severity: 'high',
    amount: 52.99,
    currency: 'USD',
    threshold: 50.00,
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    Id: 4,
    type: 'failed_payment',
    subscriptionId: 4,
    serviceName: 'Dropbox',
    title: 'Payment Failed - Action Required',
    message: 'Your Dropbox payment of $9.99 failed due to an expired card. Please update your payment information.',
    severity: 'high',
    amount: 9.99,
    currency: 'USD',
    failureReason: 'expired_card',
    retryCount: 0,
    maxRetries: 3,
    nextRetryDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    Id: 5,
    type: 'upcoming_payment',
    subscriptionId: 5,
    serviceName: 'Microsoft 365',
    title: 'Auto-Renewal Tomorrow',
    message: 'Your Microsoft 365 subscription will auto-renew tomorrow for $99.99.',
    severity: 'low',
    amount: 99.99,
    currency: 'USD',
    daysUntil: 1,
    paymentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

let nextId = Math.max(...alertsState.map(a => a.Id), 0) + 1

export const alertService = {
  async getAllAlerts() {
    await delay(300)
    try {
      // Sort by severity (high first) then by creation date (newest first)
      const sorted = [...alertsState].sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 }
        if (severityOrder[b.severity] !== severityOrder[a.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity]
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      
      return sorted.map(alert => ({ ...alert }))
    } catch (error) {
      throw new Error("Failed to load alerts")
    }
  },

  async getAlertById(id) {
    await delay(250)
    try {
      const alert = alertsState.find(a => a.Id === parseInt(id))
      if (!alert) {
        throw new Error("Alert not found")
      }
      return { ...alert }
    } catch (error) {
      throw new Error("Failed to load alert")
    }
  },

  async getAlertsByType(type) {
    await delay(200)
    try {
      const filtered = alertsState.filter(a => a.type === type)
      return filtered.map(alert => ({ ...alert }))
    } catch (error) {
      throw new Error("Failed to load alerts by type")
    }
  },

  async getUnreadAlerts() {
    await delay(200)
    try {
      const unread = alertsState.filter(a => !a.isRead)
      return unread.map(alert => ({ ...alert }))
    } catch (error) {
      throw new Error("Failed to load unread alerts")
    }
  },

  async getAlertsBySeverity(severity) {
    await delay(200)
    try {
      const filtered = alertsState.filter(a => a.severity === severity)
      return filtered.map(alert => ({ ...alert }))
    } catch (error) {
      throw new Error("Failed to load alerts by severity")
    }
  },

  async markAsRead(id) {
    await delay(200)
    try {
      const alertIndex = alertsState.findIndex(a => a.Id === parseInt(id))
      if (alertIndex === -1) {
        throw new Error("Alert not found")
      }

      alertsState[alertIndex] = {
        ...alertsState[alertIndex],
        isRead: true,
        updatedAt: new Date().toISOString()
      }

      return { ...alertsState[alertIndex] }
    } catch (error) {
      throw new Error("Failed to mark alert as read")
    }
  },

  async markAllAsRead() {
    await delay(300)
    try {
      const now = new Date().toISOString()
      alertsState = alertsState.map(alert => ({
        ...alert,
        isRead: true,
        updatedAt: now
      }))

      return { success: true, message: "All alerts marked as read" }
    } catch (error) {
      throw new Error("Failed to mark all alerts as read")
    }
  },

  async dismissAlert(id) {
    await delay(250)
    try {
      const alertIndex = alertsState.findIndex(a => a.Id === parseInt(id))
      if (alertIndex === -1) {
        throw new Error("Alert not found")
      }

      const dismissedAlert = alertsState.splice(alertIndex, 1)[0]
      return { ...dismissedAlert }
    } catch (error) {
      throw new Error("Failed to dismiss alert")
    }
  },

  async dismissAllAlerts() {
    await delay(300)
    try {
      const dismissedCount = alertsState.length
      alertsState = []
      
      return { success: true, message: `${dismissedCount} alerts dismissed` }
    } catch (error) {
      throw new Error("Failed to dismiss all alerts")
    }
  },

  async createAlert(alertData) {
    await delay(300)
    try {
      // Validate required fields
      if (!alertData.type || !alertData.title || !alertData.message) {
        throw new Error("Missing required alert information")
      }

      const newAlert = {
        Id: nextId++,
        type: alertData.type,
        subscriptionId: alertData.subscriptionId || null,
        serviceName: alertData.serviceName || "Unknown Service",
        title: alertData.title,
        message: alertData.message,
        severity: alertData.severity || 'medium',
        amount: alertData.amount || null,
        currency: alertData.currency || 'USD',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...alertData // Allow additional type-specific data
      }

      alertsState.unshift(newAlert) // Add to beginning for newest first
      return { ...newAlert }
    } catch (error) {
      throw new Error("Failed to create alert: " + error.message)
    }
  },

  async retryFailedPayment(alertId) {
    await delay(400)
    try {
      const alertIndex = alertsState.findIndex(a => a.Id === parseInt(alertId))
      if (alertIndex === -1) {
        throw new Error("Alert not found")
      }

      const alert = alertsState[alertIndex]
      if (alert.type !== 'failed_payment') {
        throw new Error("Alert is not a failed payment type")
      }

      // Simulate retry attempt
      const isSuccessful = Math.random() > 0.3 // 70% success rate

      if (isSuccessful) {
        // Remove the alert on successful retry
        alertsState.splice(alertIndex, 1)
        
        // Create success notification
        await this.createAlert({
          type: 'payment_success',
          subscriptionId: alert.subscriptionId,
          serviceName: alert.serviceName,
          title: 'Payment Successful',
          message: `Your ${alert.serviceName} payment of $${alert.amount.toFixed(2)} was processed successfully.`,
          severity: 'low',
          amount: alert.amount,
          currency: alert.currency
        })

        return { success: true, message: "Payment retry successful" }
      } else {
        // Update retry count
        alert.retryCount = (alert.retryCount || 0) + 1
        alert.updatedAt = new Date().toISOString()

        if (alert.retryCount >= alert.maxRetries) {
          alert.severity = 'high'
          alert.title = 'Payment Failed - Max Retries Reached'
          alert.message = `Your ${alert.serviceName} payment has failed ${alert.maxRetries} times. Please update your payment method.`
        } else {
          alert.nextRetryDate = new Date(Date.now() + (24 * 60 * 60 * 1000) * alert.retryCount).toISOString()
          alert.message = `Payment retry ${alert.retryCount}/${alert.maxRetries} failed. Next retry scheduled for ${format(new Date(alert.nextRetryDate), "MMM dd, yyyy 'at' h:mm a")}.`
        }

        return { success: false, message: "Payment retry failed", alert: { ...alert } }
      }
    } catch (error) {
      throw new Error("Failed to retry payment: " + error.message)
    }
  },

  async snoozeAlert(id, snoozeHours = 24) {
    await delay(250)
    try {
      const alertIndex = alertsState.findIndex(a => a.Id === parseInt(id))
      if (alertIndex === -1) {
        throw new Error("Alert not found")
      }

      const alert = alertsState[alertIndex]
      const snoozeUntil = new Date(Date.now() + snoozeHours * 60 * 60 * 1000)

      alertsState[alertIndex] = {
        ...alert,
        snoozedUntil: snoozeUntil.toISOString(),
        updatedAt: new Date().toISOString()
      }

      return { 
        ...alertsState[alertIndex], 
        message: `Alert snoozed until ${format(snoozeUntil, "MMM dd, yyyy 'at' h:mm a")}` 
      }
    } catch (error) {
      throw new Error("Failed to snooze alert")
    }
  },

  async getAlertAnalytics() {
    await delay(300)
    try {
      const total = alertsState.length
      const unread = alertsState.filter(a => !a.isRead).length
      const byType = alertsState.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1
        return acc
      }, {})
      const bySeverity = alertsState.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1
        return acc
      }, {})

      const totalFailedPayments = byType.failed_payment || 0
      const totalAmount = alertsState
        .filter(a => a.type === 'failed_payment' && a.amount)
        .reduce((sum, a) => sum + a.amount, 0)

      return {
        total,
        unread,
        byType,
        bySeverity,
        failedPaymentStats: {
          count: totalFailedPayments,
          totalAmount,
          avgAmount: totalFailedPayments > 0 ? totalAmount / totalFailedPayments : 0
        },
        upcomingPayments: byType.upcoming_payment || 0,
        spendingWarnings: byType.spending_threshold || 0
      }
    } catch (error) {
      throw new Error("Failed to load alert analytics")
    }
  },

  async searchAlerts(query) {
    await delay(200)
    try {
      const lowercaseQuery = query.toLowerCase()
      const filtered = alertsState.filter(alert => 
        alert.title.toLowerCase().includes(lowercaseQuery) ||
        alert.message.toLowerCase().includes(lowercaseQuery) ||
        alert.serviceName.toLowerCase().includes(lowercaseQuery)
      )

      return filtered.map(alert => ({ ...alert }))
    } catch (error) {
      throw new Error("Failed to search alerts")
    }
  }
}

export default alertService