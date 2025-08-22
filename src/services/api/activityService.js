// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for activity timeline
let activityState = [
  {
    Id: 1,
    type: "login",
    action: "Successful login",
    device: "iPhone 14 Pro",
    location: "San Francisco, CA",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    risk: "low",
    ipAddress: "192.168.1.105",
    browser: "Safari",
    details: {
      method: "biometric",
      success: true
    }
  },
  {
    Id: 2,
    type: "payment",
    action: "Payment processed",
    amount: 89.50,
    currency: "USD",
    merchant: "Netflix",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    risk: "low",
    paymentMethod: "Credit Card ****1234",
    details: {
      transactionId: "TXN_001",
      status: "completed"
    }
  },
  {
    Id: 3,
    type: "security",
    action: "Suspicious transaction blocked",
    amount: 2500,
    currency: "USD",
    merchant: "Unknown Merchant",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    risk: "high",
    reason: "Velocity limit exceeded",
    location: "Los Angeles, CA",
    details: {
      blocked: true,
      reason: "unusual_location"
    }
  },
  {
    Id: 4,
    type: "device",
    action: "New device detected",
    device: "Unknown Device",
    location: "Los Angeles, CA",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    risk: "medium",
    ipAddress: "198.51.100.23",
    browser: "Chrome Mobile",
    details: {
      newDevice: true,
      trusted: false
    }
  },
  {
    Id: 5,
    type: "settings",
    action: "Transaction limit updated",
    oldValue: 3000,
    newValue: 5000,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    risk: "low",
    details: {
      setting: "transaction_limit",
      previousValue: 3000,
      newValue: 5000
    }
  },
  {
    Id: 6,
    type: "login",
    action: "Failed login attempt",
    device: "Unknown Device",
    location: "New York, NY",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    risk: "high",
    ipAddress: "203.0.113.45",
    browser: "Chrome",
    details: {
      method: "password",
      success: false,
      attempts: 3
    }
  },
  {
    Id: 7,
    type: "payment",
    action: "Subscription renewal",
    amount: 15.99,
    currency: "USD",
    merchant: "Spotify",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    risk: "low",
    paymentMethod: "Credit Card ****1234",
    details: {
      transactionId: "TXN_007",
      status: "completed",
      subscriptionId: 2
    }
  },
  {
    Id: 8,
    type: "security",
    action: "Two-factor authentication enabled",
    device: "iPhone 14 Pro",
    location: "San Francisco, CA",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    risk: "low",
    details: {
      method: "sms",
      enabled: true
    }
  }
];

let nextActivityId = Math.max(...activityState.map(a => a.Id), 0) + 1;

export const activityService = {
  async getAllActivity(limit = null) {
    await delay(300);
    try {
      const sorted = [...activityState].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const activities = limit ? sorted.slice(0, limit) : sorted;
      return activities.map(activity => ({ ...activity }));
    } catch (error) {
      throw new Error("Failed to load activity timeline");
    }
  },

  async getActivityById(id) {
    await delay(200);
    try {
      const activity = activityState.find(a => a.Id === parseInt(id));
      if (!activity) {
        throw new Error("Activity not found");
      }
      return { ...activity };
    } catch (error) {
      throw new Error("Failed to load activity details");
    }
  },

  async getActivityByType(type) {
    await delay(250);
    try {
      const filtered = activityState.filter(a => a.type === type);
      const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sorted.map(activity => ({ ...activity }));
    } catch (error) {
      throw new Error(`Failed to load ${type} activities`);
    }
  },

  async getLoginHistory() {
    await delay(300);
    try {
      const logins = activityState.filter(a => a.type === 'login');
      const sorted = logins.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sorted.map(login => ({ ...login }));
    } catch (error) {
      throw new Error("Failed to load login history");
    }
  },

  async getPaymentActivity() {
    await delay(300);
    try {
      const payments = activityState.filter(a => a.type === 'payment');
      const sorted = payments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sorted.map(payment => ({ ...payment }));
    } catch (error) {
      throw new Error("Failed to load payment activity");
    }
  },

  async getSecurityEvents() {
    await delay(300);
    try {
      const securityEvents = activityState.filter(a => 
        a.type === 'security' || a.risk === 'high' || a.type === 'device'
      );
      const sorted = securityEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sorted.map(event => ({ ...event }));
    } catch (error) {
      throw new Error("Failed to load security events");
    }
  },

  async getAccountChanges() {
    await delay(250);
    try {
      const changes = activityState.filter(a => a.type === 'settings' || a.type === 'account');
      const sorted = changes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sorted.map(change => ({ ...change }));
    } catch (error) {
      throw new Error("Failed to load account changes");
    }
  },

  async logActivity(activityData) {
    await delay(200);
    try {
      const newActivity = {
        Id: nextActivityId++,
        timestamp: new Date().toISOString(),
        ...activityData
      };

      activityState.unshift(newActivity);
      return { ...newActivity };
    } catch (error) {
      throw new Error("Failed to log activity: " + error.message);
    }
  },

  async logLoginActivity(loginData) {
    await delay(200);
    try {
      const loginActivity = {
        type: "login",
        action: loginData.success ? "Successful login" : "Failed login attempt",
        device: loginData.device,
        location: loginData.location,
        risk: loginData.success ? "low" : "medium",
        ipAddress: loginData.ipAddress,
        browser: loginData.browser,
        details: {
          method: loginData.method || "password",
          success: loginData.success,
          attempts: loginData.attempts || 1
        }
      };

      return await this.logActivity(loginActivity);
    } catch (error) {
      throw new Error("Failed to log login activity: " + error.message);
    }
  },

  async logPaymentActivity(paymentData) {
    await delay(200);
    try {
      const paymentActivity = {
        type: "payment",
        action: paymentData.action || "Payment processed",
        amount: paymentData.amount,
        currency: paymentData.currency || "USD",
        merchant: paymentData.merchant,
        risk: "low",
        paymentMethod: paymentData.paymentMethod,
        details: {
          transactionId: paymentData.transactionId,
          status: paymentData.status || "completed",
          subscriptionId: paymentData.subscriptionId
        }
      };

      return await this.logActivity(paymentActivity);
    } catch (error) {
      throw new Error("Failed to log payment activity: " + error.message);
    }
  },

  async logSecurityEvent(securityData) {
    await delay(200);
    try {
      const securityActivity = {
        type: "security",
        action: securityData.action,
        risk: securityData.risk || "medium",
        location: securityData.location,
        device: securityData.device,
        amount: securityData.amount,
        currency: securityData.currency,
        reason: securityData.reason,
        details: securityData.details || {}
      };

      return await this.logActivity(securityActivity);
    } catch (error) {
      throw new Error("Failed to log security event: " + error.message);
    }
  },

  async logDeviceActivity(deviceData) {
    await delay(200);
    try {
      const deviceActivity = {
        type: "device",
        action: deviceData.action,
        device: deviceData.device,
        location: deviceData.location,
        risk: deviceData.risk || "low",
        ipAddress: deviceData.ipAddress,
        browser: deviceData.browser,
        details: deviceData.details || {}
      };

      return await this.logActivity(deviceActivity);
    } catch (error) {
      throw new Error("Failed to log device activity: " + error.message);
    }
  },

  async getActivityAnalytics(dateRange = 30) {
    await delay(300);
    try {
      const cutoffDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);
      const recentActivity = activityState.filter(a => new Date(a.timestamp) >= cutoffDate);

      const totalEvents = recentActivity.length;
      const loginEvents = recentActivity.filter(a => a.type === 'login').length;
      const paymentEvents = recentActivity.filter(a => a.type === 'payment').length;
      const securityEvents = recentActivity.filter(a => a.type === 'security').length;
      const deviceEvents = recentActivity.filter(a => a.type === 'device').length;

      const riskDistribution = recentActivity.reduce((acc, activity) => {
        acc[activity.risk] = (acc[activity.risk] || 0) + 1;
        return acc;
      }, {});

      const dailyActivity = recentActivity.reduce((acc, activity) => {
        const date = activity.timestamp.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        totalEvents,
        loginEvents,
        paymentEvents,
        securityEvents,
        deviceEvents,
        riskDistribution,
        dailyActivity,
        dateRange
      };
    } catch (error) {
      throw new Error("Failed to load activity analytics");
    }
  },

  async searchActivity(query) {
    await delay(200);
    try {
      const lowercaseQuery = query.toLowerCase();
      const filtered = activityState.filter(activity =>
        activity.action.toLowerCase().includes(lowercaseQuery) ||
        activity.device?.toLowerCase().includes(lowercaseQuery) ||
        activity.location?.toLowerCase().includes(lowercaseQuery) ||
        activity.merchant?.toLowerCase().includes(lowercaseQuery)
      );

      const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sorted.map(activity => ({ ...activity }));
    } catch (error) {
      throw new Error("Failed to search activities");
    }
  },

  async filterActivityByRisk(risk) {
    await delay(200);
    try {
      const filtered = activityState.filter(a => a.risk === risk);
      const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sorted.map(activity => ({ ...activity }));
    } catch (error) {
      throw new Error(`Failed to load ${risk} risk activities`);
    }
  },

  async filterActivityByDateRange(startDate, endDate) {
    await delay(250);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filtered = activityState.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= start && activityDate <= end;
      });

      const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sorted.map(activity => ({ ...activity }));
    } catch (error) {
      throw new Error("Failed to filter activities by date range");
    }
  }
};