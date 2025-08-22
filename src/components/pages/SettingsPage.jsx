import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const SettingsPage = () => {
  const navigate = useNavigate()
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [faceIdEnabled, setFaceIdEnabled] = useState(false)
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedBiometric = localStorage.getItem('biometricEnabled')
    const savedPush = localStorage.getItem('pushNotifications')
    const savedFaceId = localStorage.getItem('faceIdEnabled')
    const savedFingerprint = localStorage.getItem('fingerprintEnabled')

    if (savedBiometric !== null) setBiometricEnabled(JSON.parse(savedBiometric))
    if (savedPush !== null) setPushNotifications(JSON.parse(savedPush))
    if (savedFaceId !== null) setFaceIdEnabled(JSON.parse(savedFaceId))
    if (savedFingerprint !== null) setFingerprintEnabled(JSON.parse(savedFingerprint))
  }, [])

  const handleBiometricToggle = () => {
    const newValue = !biometricEnabled
    setBiometricEnabled(newValue)
    localStorage.setItem('biometricEnabled', JSON.stringify(newValue))
    
    if (newValue) {
      toast.success("Biometric authentication enabled")
    } else {
      toast.info("Biometric authentication disabled")
      // Disable sub-options when main biometric is disabled
      setFaceIdEnabled(false)
      setFingerprintEnabled(false)
      localStorage.setItem('faceIdEnabled', JSON.stringify(false))
      localStorage.setItem('fingerprintEnabled', JSON.stringify(false))
    }
  }

  const handleFaceIdToggle = () => {
    if (!biometricEnabled) {
      toast.warning("Please enable biometric authentication first")
      return
    }
    const newValue = !faceIdEnabled
    setFaceIdEnabled(newValue)
    localStorage.setItem('faceIdEnabled', JSON.stringify(newValue))
    toast.success(`Face ID ${newValue ? 'enabled' : 'disabled'}`)
  }

  const handleFingerprintToggle = () => {
    if (!biometricEnabled) {
      toast.warning("Please enable biometric authentication first")
      return
    }
    const newValue = !fingerprintEnabled
    setFingerprintEnabled(newValue)
    localStorage.setItem('fingerprintEnabled', JSON.stringify(newValue))
    toast.success(`Fingerprint ${newValue ? 'enabled' : 'disabled'}`)
  }

  const handlePushToggle = () => {
    const newValue = !pushNotifications
    setPushNotifications(newValue)
    localStorage.setItem('pushNotifications', JSON.stringify(newValue))
    toast.success(`Push notifications ${newValue ? 'enabled' : 'disabled'}`)
  }

  const ToggleSwitch = ({ enabled, onToggle, disabled = false }) => (
    <motion.button
      onClick={onToggle}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
        enabled ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <motion.span
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200`}
      />
    </motion.button>
  )

  const settingsSections = [
    {
      title: "Security & Authentication",
      items: [
        {
          icon: "Fingerprint",
          title: "Biometric Authentication",
          description: "Use fingerprint or face recognition to access your account",
          toggle: true,
          enabled: biometricEnabled,
          onToggle: handleBiometricToggle
        },
        {
          icon: "Scan",
          title: "Face ID",
          description: "Enable facial recognition for quick access",
          toggle: true,
          enabled: faceIdEnabled,
          onToggle: handleFaceIdToggle,
          disabled: !biometricEnabled,
          indent: true
        },
        {
          icon: "TouchId",
          title: "Fingerprint",
          description: "Enable fingerprint scanning for authentication",
          toggle: true,
          enabled: fingerprintEnabled,
          onToggle: handleFingerprintToggle,
          disabled: !biometricEnabled,
disabled: !biometricEnabled,
          indent: true
        }
      ]
    },
    {
      title: "Subscription & Spending",
      items: [
        {
          icon: "CreditCard",
          title: "Spending Alerts",
          description: "Get notified when subscription spending exceeds limits",
          action: () => navigate('/settings/notifications')
        },
        {
          icon: "RefreshCw", 
          title: "Auto-Renewal Preferences",
          description: "Manage automatic subscription renewals",
          action: () => navigate('/subscriptions')
        },
        {
          icon: "TrendingUp",
          title: "Subscription Analytics",
          description: "View spending patterns and subscription insights",
          action: () => navigate('/subscriptions')
}
      ]
    },
    {
      title: "Notifications",
      items: [
        {
          icon: "Bell",
          title: "Push Notifications",
          description: "Receive alerts for transactions and updates",
          toggle: true,
          enabled: pushNotifications,
          onToggle: handlePushToggle
        },
        {
          icon: "Settings",
          title: "Notification Preferences",
          description: "Customize which notifications you receive",
          action: () => navigate('/settings/notifications')
        }
      ]
    },
    {
      title: "Support & Help",
      items: [
        {
          icon: "HelpCircle",
          title: "Help Center",
          description: "FAQs, guides, and troubleshooting",
          action: () => navigate('/settings/support')
        },
        {
          icon: "MessageCircle",
          title: "Contact Support",
          description: "Get help from our customer support team",
          action: () => toast.info("Opening support chat...")
        },
        {
          icon: "Phone",
          title: "Call Support",
          description: "Speak directly with our support team",
          action: () => toast.info("Support: +1 (555) 123-4567")
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/more')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your security and preferences
            </p>
          </div>
        </motion.div>
      </div>

      {/* Settings Sections */}
      <div className="px-4 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sectionIndex * 0.1 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-display font-semibold text-gray-900 px-2">
              {section.title}
            </h2>
            
            <Card padding="none" className="overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <div
                  key={item.title}
                  className={`p-4 border-b border-gray-100 last:border-b-0 ${
                    item.indent ? 'pl-12 bg-gray-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${
                        item.disabled ? 'opacity-50' : ''
                      }`}>
                        <ApperIcon name={item.icon} size={18} className="text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-medium text-gray-900 text-sm ${
                          item.disabled ? 'opacity-50' : ''
                        }`}>
                          {item.title}
                        </p>
                        <p className={`text-xs text-gray-500 mt-1 ${
                          item.disabled ? 'opacity-50' : ''
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    {item.toggle ? (
                      <ToggleSwitch
                        enabled={item.enabled}
                        onToggle={item.onToggle}
                        disabled={item.disabled}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.action}
                        className="p-2"
                      >
                        <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                      </Button>
                    )}
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
          Your security settings are encrypted and stored locally
        </p>
      </motion.div>
    </div>
  )
}

export default SettingsPage