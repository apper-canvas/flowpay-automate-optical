import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    transactions: true,
    security: true,
    promotions: false,
    updates: true,
    weeklyReport: true,
    monthlyStatement: true,
    lowBalance: true,
    largeTransaction: true,
    newDevice: true,
    maintenance: false,
    subscriptionAlerts: true,
    spendingThresholds: true,
    autoRenewalWarnings: true,
    subscriptionCancellation: true
  });

  // Load notification settings from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  const handleNotificationToggle = (key) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(newNotifications);
    localStorage.setItem('notificationSettings', JSON.stringify(newNotifications));
    
    const setting = notificationSections
      .flatMap(section => section.items)
      .find(item => item.key === key);
    
    toast.success(`${setting?.title} ${newNotifications[key] ? 'enabled' : 'disabled'}`);
  };

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
        enabled ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-200'
      }`}
    >
      <motion.span
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
      />
    </motion.button>
  );

  const notificationSections = [
    {
      title: "Transaction Alerts",
      description: "Get notified about your financial activities",
      items: [
        {
          key: "transactions",
          icon: "CreditCard",
          title: "All Transactions",
          description: "Notify me of all incoming and outgoing payments"
        },
        {
          key: "largeTransaction",
          icon: "TrendingUp",
          title: "Large Transactions",
          description: "Alert for transactions over $500"
        },
        {
          key: "lowBalance",
          icon: "AlertTriangle",
          title: "Low Balance Warning",
          description: "Notify when balance falls below $50"
        }
      ]
    },
    {
      title: "Subscriptions & Spending",
      description: "Manage subscription-related notifications",
      items: [
        {
          key: "subscriptionAlerts",
          icon: "CreditCard",
          title: "Subscription Alerts",
          description: "Notify me about upcoming subscription payments"
        },
        {
          key: "spendingThresholds", 
          icon: "TrendingUp",
          title: "Spending Thresholds",
          description: "Alert when subscription spending exceeds set limits"
        },
        {
          key: "autoRenewalWarnings",
          icon: "RefreshCw",
          title: "Auto-Renewal Warnings",
          description: "Remind me before subscriptions auto-renew"
        },
        {
          key: "subscriptionCancellation",
          icon: "XCircle",
          title: "Cancellation Reminders",
          description: "Remind me to cancel unwanted subscriptions"
        }
      ]
    },
    {
      title: "Security & Account",
      description: "Stay informed about account security",
      items: [
        {
          key: "security",
          icon: "Shield",
          title: "Security Alerts",
          description: "Login attempts, password changes, and security updates"
        },
        {
          key: "newDevice",
          icon: "Smartphone",
          title: "New Device Login",
          description: "Alert when your account is accessed from a new device"
        }
      ]
    },
    {
      title: "Reports & Updates",
      description: "Regular summaries and app updates",
      items: [
        {
          key: "weeklyReport",
          icon: "BarChart3",
          title: "Weekly Reports",
          description: "Summary of your weekly spending and income"
        },
        {
          key: "monthlyStatement",
          icon: "FileText",
          title: "Monthly Statements",
          description: "Detailed monthly transaction statements"
        },
        {
          key: "updates",
          icon: "Smartphone",
          title: "App Updates",
          description: "New features, improvements, and bug fixes"
        }
      ]
    },
    {
      title: "Marketing & Promotions",
      description: "Special offers and promotional content",
      items: [
        {
          key: "promotions",
          icon: "Gift",
          title: "Promotions & Offers",
          description: "Special deals, cashback offers, and rewards"
        },
        {
          key: "maintenance",
          icon: "Settings",
          title: "Maintenance Notices",
          description: "Scheduled maintenance and service updates"
        }
      ]
    }
  ];

  const handleSaveAll = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    toast.success("All notification preferences saved!");
  };

  const handleResetToDefault = () => {
    const defaultSettings = {
      transactions: true,
      security: true,
      promotions: false,
      updates: true,
      weeklyReport: true,
      monthlyStatement: true,
      lowBalance: true,
      largeTransaction: true,
      newDevice: true,
      maintenance: false,
      subscriptionAlerts: true,
      spendingThresholds: true,
      autoRenewalWarnings: true,
      subscriptionCancellation: true
    };
    setNotifications(defaultSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(defaultSettings));
    toast.success("Notification preferences reset to default!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-4 flex items-center space-x-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              Customize your notification preferences
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAll}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Save" size={16} />
            <span>Save All</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="RotateCcw" size={16} />
            <span>Reset</span>
          </Button>
        </motion.div>
      </div>

      {/* Notification Sections */}
      <div className="px-4 space-y-6">
        {notificationSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sectionIndex * 0.1 }}
            className="space-y-3"
          >
            <div className="px-2">
              <h2 className="text-lg font-display font-semibold text-gray-900">
                {section.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {section.description}
              </p>
            </div>
            
            <Card padding="none" className="overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <div
                  key={item.key}
                  className="p-4 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <ApperIcon name={item.icon} size={18} className="text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    <ToggleSwitch
                      enabled={notifications[item.key]}
                      onToggle={() => handleNotificationToggle(item.key)}
                    />
                  </div>
                </div>
              ))}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-4 py-8 text-center"
      >
        <p className="text-gray-400 text-sm">
          You can change these preferences at any time
        </p>
      </motion.div>
    </div>
  )
}

export default NotificationsPage