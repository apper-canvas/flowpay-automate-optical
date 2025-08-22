import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { format, formatDistanceToNow } from "date-fns";
import alertService from "@/services/api/alertService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";

const SecurityPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [securityData, setSecurityData] = useState(null)
  const [devices, setDevices] = useState([])
  const [securityEvents, setSecurityEvents] = useState([])
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [actionType, setActionType] = useState("")

  // Mock data for security system
  const mockSecurityData = {
    securityScore: 85,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    suspiciousActivity: 2,
    blockedTransactions: 0,
    fraudAlerts: 1,
    twoFactorEnabled: true,
    biometricEnabled: false,
    transactionLimit: 5000,
    dailyLimit: 10000,
    velocityMonitoring: true
  }

  const mockDevices = [
    {
      Id: 1,
      name: "iPhone 14 Pro",
      type: "mobile",
      location: "San Francisco, CA",
      lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      trusted: true,
      current: true,
      browser: "Safari",
      ipAddress: "192.168.1.105"
    },
    {
      Id: 2,
      name: "MacBook Pro",
      type: "desktop",
      location: "San Francisco, CA",
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      trusted: true,
      current: false,
      browser: "Chrome",
      ipAddress: "192.168.1.104"
    },
    {
      Id: 3,
      name: "Unknown Device",
      type: "mobile",
      location: "Los Angeles, CA",
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      trusted: false,
      current: false,
      browser: "Chrome Mobile",
      ipAddress: "198.51.100.23"
    }
  ]

  const mockSecurityEvents = [
    {
      Id: 1,
      type: "login",
      action: "Successful login",
      device: "iPhone 14 Pro",
      location: "San Francisco, CA",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      risk: "low",
      ipAddress: "192.168.1.105"
    },
    {
      Id: 2,
      type: "transaction_blocked",
      action: "Suspicious transaction blocked",
      amount: 2500,
      merchant: "Unknown Merchant",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      risk: "high",
      reason: "Velocity limit exceeded"
    },
    {
      Id: 3,
      type: "device_new",
      action: "New device detected",
      device: "Unknown Device",
      location: "Los Angeles, CA",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      risk: "medium",
      ipAddress: "198.51.100.23"
    },
    {
      Id: 4,
      type: "settings_changed",
      action: "Transaction limit updated",
      oldValue: 3000,
      newValue: 5000,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      risk: "low"
    }
  ]

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setSecurityData(mockSecurityData)
      setDevices(mockDevices)
      setSecurityEvents(mockSecurityEvents)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeviceAction = async (device, action) => {
    setSelectedDevice(device)
    setActionType(action)
    setShowDeviceModal(true)
  }

  const confirmDeviceAction = async () => {
    try {
      const deviceName = selectedDevice.name
      
      switch (actionType) {
        case "trust":
          setDevices(prev => prev.map(d => 
            d.Id === selectedDevice.Id ? { ...d, trusted: true } : d
          ))
          toast.success(`${deviceName} marked as trusted`)
          break
        case "untrust":
          setDevices(prev => prev.map(d => 
            d.Id === selectedDevice.Id ? { ...d, trusted: false } : d
          ))
          toast.success(`${deviceName} removed from trusted devices`)
          break
        case "logout":
          if (!selectedDevice.current) {
            setDevices(prev => prev.filter(d => d.Id !== selectedDevice.Id))
            toast.success(`Logged out from ${deviceName}`)
          }
          break
        case "block":
          setDevices(prev => prev.filter(d => d.Id !== selectedDevice.Id))
          toast.success(`${deviceName} has been blocked`)
          break
      }

      setShowDeviceModal(false)
      setSelectedDevice(null)
      setActionType("")
    } catch (err) {
      toast.error(`Failed to ${actionType} device: ${err.message}`)
    }
  }

  const handleSecuritySettingToggle = async (setting) => {
    try {
      const newValue = !securityData[setting]
      setSecurityData(prev => ({ ...prev, [setting]: newValue }))
      
      const settingNames = {
        twoFactorEnabled: "Two-Factor Authentication",
        biometricEnabled: "Biometric Authentication",
        velocityMonitoring: "Velocity Monitoring"
      }
      
      toast.success(`${settingNames[setting]} ${newValue ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast.error("Failed to update security setting")
    }
  }

  const handleLimitUpdate = async (type, value) => {
    try {
      const numValue = parseInt(value)
      if (numValue < 100 || numValue > 50000) {
        toast.error("Limit must be between $100 and $50,000")
        return
      }
      
      setSecurityData(prev => ({ ...prev, [type]: numValue }))
      toast.success(`${type === 'transactionLimit' ? 'Transaction' : 'Daily'} limit updated to $${numValue.toLocaleString()}`)
    } catch (err) {
      toast.error("Failed to update limit")
    }
  }

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "error"
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case "high": return "error"
      case "medium": return "warning"
      case "low": return "success"
      default: return "default"
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "login": return "LogIn"
      case "transaction_blocked": return "Shield"
      case "device_new": return "Smartphone"
      case "settings_changed": return "Settings"
      case "fraud_detected": return "AlertTriangle"
      default: return "Activity"
    }
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case "mobile": return "Smartphone"
      case "desktop": return "Monitor"
      case "tablet": return "Tablet"
      default: return "Device"
    }
  }

  const SecurityDashboard = () => (
    <div className="space-y-6">
      {/* Security Score */}
      <Card padding="lg" className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={351.86}
                strokeDashoffset={351.86 - (351.86 * securityData.securityScore) / 100}
                className={`${
                  securityData.securityScore >= 80 ? 'text-success' :
                  securityData.securityScore >= 60 ? 'text-warning' : 'text-error'
                } transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-display font-bold text-gray-900">
                {securityData.securityScore}
              </span>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
          Security Score
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Your account security is {securityData.securityScore >= 80 ? 'excellent' : 
          securityData.securityScore >= 60 ? 'good' : 'needs attention'}
        </p>
        
        <Badge variant={getSecurityScoreColor(securityData.securityScore)} size="md">
          {securityData.securityScore >= 80 ? 'Excellent' : 
           securityData.securityScore >= 60 ? 'Good' : 'Poor'} Security
        </Badge>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="lg">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-error mb-1">
              {securityData.fraudAlerts}
            </p>
            <p className="text-gray-600 text-sm">Fraud Alerts</p>
          </div>
        </Card>
        
        <Card padding="lg">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-warning mb-1">
              {securityData.suspiciousActivity}
            </p>
            <p className="text-gray-600 text-sm">Suspicious Activity</p>
          </div>
        </Card>
        
        <Card padding="lg">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-success mb-1">
              {securityData.blockedTransactions}
            </p>
            <p className="text-gray-600 text-sm">Blocked Transactions</p>
          </div>
        </Card>
        
        <Card padding="lg">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-gray-900 mb-1">
              {devices.filter(d => d.trusted).length}
            </p>
            <p className="text-gray-600 text-sm">Trusted Devices</p>
          </div>
        </Card>
      </div>

      {/* Recent Security Events */}
      <div>
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Recent Security Events
        </h3>
        <div className="space-y-3">
          {securityEvents.slice(0, 3).map((event) => (
            <Card key={event.Id} padding="lg">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  event.risk === 'high' ? 'bg-error/10' :
                  event.risk === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                }`}>
                  <ApperIcon 
                    name={getEventIcon(event.type)} 
                    size={18} 
                    className={
                      event.risk === 'high' ? 'text-error' :
                      event.risk === 'medium' ? 'text-warning' : 'text-success'
                    } 
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {event.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <Badge variant={getRiskColor(event.risk)} size="xs">
                      {event.risk}
                    </Badge>
                  </div>
                  
                  {event.location && (
                    <p className="text-xs text-gray-500 mt-1">
                      {event.device && `${event.device} • `}{event.location}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const DeviceManagement = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Registered Devices
        </h3>
        <div className="space-y-3">
          {devices.map((device) => (
            <Card key={device.Id} padding="lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <ApperIcon 
                      name={getDeviceIcon(device.type)} 
                      size={20} 
                      className="text-gray-600" 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {device.name}
                      </h4>
                      {device.current && (
                        <Badge variant="primary" size="xs">Current</Badge>
                      )}
                      {device.trusted && (
                        <Badge variant="success" size="xs">Trusted</Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">
                      {device.browser} • {device.location}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last active: {formatDistanceToNow(new Date(device.lastActive), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!device.trusted && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleDeviceAction(device, "trust")}
                      className="text-xs px-3 py-1"
                    >
                      Trust
                    </Button>
                  )}
                  
                  {device.trusted && !device.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeviceAction(device, "untrust")}
                      className="text-xs px-3 py-1"
                    >
                      Untrust
                    </Button>
                  )}
                  
                  {!device.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeviceAction(device, "logout")}
                      className="text-xs px-3 py-1"
                    >
                      Logout
                    </Button>
                  )}
                  
                  {!device.current && !device.trusted && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeviceAction(device, "block")}
                      className="text-xs px-3 py-1"
                    >
                      Block
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const SecuritySettings = () => (
    <div className="space-y-6">
      {/* Authentication Settings */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Authentication
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div>
              <p className="font-medium text-gray-900 text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 mt-1">Add an extra layer of security</p>
            </div>
            <Button
              variant={securityData.twoFactorEnabled ? "success" : "ghost"}
              size="sm"
              onClick={() => handleSecuritySettingToggle("twoFactorEnabled")}
              className="text-xs px-4 py-2"
            >
              {securityData.twoFactorEnabled ? "Enabled" : "Enable"}
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div>
              <p className="font-medium text-gray-900 text-sm">Biometric Authentication</p>
              <p className="text-xs text-gray-500 mt-1">Use fingerprint or face recognition</p>
            </div>
            <Button
              variant={securityData.biometricEnabled ? "success" : "ghost"}
              size="sm"
              onClick={() => handleSecuritySettingToggle("biometricEnabled")}
              className="text-xs px-4 py-2"
            >
              {securityData.biometricEnabled ? "Enabled" : "Enable"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction Limits */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Transaction Limits
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Single Transaction Limit
            </label>
            <div className="flex space-x-2">
              <Input
                type="number"
                defaultValue={securityData.transactionLimit}
                onBlur={(e) => handleLimitUpdate("transactionLimit", e.target.value)}
                className="flex-1"
                min="100"
                max="50000"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const input = document.querySelector('input[type="number"]')
                  handleLimitUpdate("transactionLimit", input.value)
                }}
                className="px-4"
              >
                Update
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum amount for a single transaction
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Daily Limit
            </label>
            <div className="flex space-x-2">
              <Input
                type="number"
                defaultValue={securityData.dailyLimit}
                onBlur={(e) => handleLimitUpdate("dailyLimit", e.target.value)}
                className="flex-1"
                min="500"
                max="100000"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const inputs = document.querySelectorAll('input[type="number"]')
                  handleLimitUpdate("dailyLimit", inputs[1].value)
                }}
                className="px-4"
              >
                Update
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum total amount per day
            </p>
          </div>
        </div>
      </Card>

      {/* Fraud Protection */}
      <Card padding="lg">
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Fraud Protection
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900 text-sm">Velocity Monitoring</p>
              <p className="text-xs text-gray-500 mt-1">Block suspicious transaction patterns</p>
            </div>
            <Button
              variant={securityData.velocityMonitoring ? "success" : "ghost"}
              size="sm"
              onClick={() => handleSecuritySettingToggle("velocityMonitoring")}
              className="text-xs px-4 py-2"
            >
              {securityData.velocityMonitoring ? "Enabled" : "Enable"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const ActivityTimeline = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Security Activity Timeline
        </h3>
        
        <div className="space-y-4">
          {securityEvents.map((event, index) => (
            <Card key={event.Id} padding="lg">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  event.risk === 'high' ? 'bg-error/10' :
                  event.risk === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                }`}>
                  <ApperIcon 
                    name={getEventIcon(event.type)} 
                    size={18} 
                    className={
                      event.risk === 'high' ? 'text-error' :
                      event.risk === 'medium' ? 'text-warning' : 'text-success'
                    } 
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {event.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(event.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    
                    <Badge variant={getRiskColor(event.risk)} size="xs">
                      {event.risk} risk
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    {event.device && (
                      <p>Device: {event.device}</p>
                    )}
                    {event.location && (
                      <p>Location: {event.location}</p>
                    )}
                    {event.ipAddress && (
                      <p>IP Address: {event.ipAddress}</p>
                    )}
                    {event.amount && (
                      <p>Amount: ${event.amount.toLocaleString()}</p>
                    )}
                    {event.merchant && (
                      <p>Merchant: {event.merchant}</p>
                    )}
                    {event.reason && (
                      <p>Reason: {event.reason}</p>
                    )}
                    {event.oldValue && event.newValue && (
                      <p>Changed from ${event.oldValue.toLocaleString()} to ${event.newValue.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const DeviceModal = () => (
    <AnimatePresence>
      {showDeviceModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeviceModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon 
                  name={getDeviceIcon(selectedDevice?.type)} 
                  size={24} 
                  className="text-primary" 
                />
              </div>
              
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                {actionType === 'trust' ? 'Trust Device' :
                 actionType === 'untrust' ? 'Remove Trust' :
                 actionType === 'logout' ? 'Remote Logout' :
                 actionType === 'block' ? 'Block Device' : 'Confirm Action'}
              </h3>
              
              <p className="text-gray-600 text-sm">
                {actionType === 'trust' && `Mark "${selectedDevice?.name}" as a trusted device?`}
                {actionType === 'untrust' && `Remove "${selectedDevice?.name}" from trusted devices?`}
                {actionType === 'logout' && `Remotely log out from "${selectedDevice?.name}"?`}
                {actionType === 'block' && `Block "${selectedDevice?.name}" from accessing your account?`}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeviceModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "block" ? "danger" : "primary"}
                onClick={confirmDeviceAction}
                className="flex-1"
              >
                {actionType === 'trust' ? 'Trust' :
                 actionType === 'untrust' ? 'Remove' :
                 actionType === 'logout' ? 'Logout' :
                 actionType === 'block' ? 'Block' : 'Confirm'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "Shield" },
    { id: "devices", label: "Devices", icon: "Smartphone" },
    { id: "settings", label: "Settings", icon: "Settings" },
    { id: "activity", label: "Activity", icon: "Activity" }
  ]

  if (loading) {
    return <Loading type="security" />
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadData}
        title="Failed to load security data"
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/more')}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Security & Fraud Protection
              </h1>
              <p className="text-gray-600 mt-1">
                Protect your account and monitor security activity
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-2 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap text-xs flex items-center space-x-2"
            >
              <ApperIcon name={tab.icon} size={14} />
              <span>{tab.label}</span>
</Button>
          ))}
        </motion.div>
      </div>
      {/* Tab Content */}
      <div className="px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && <SecurityDashboard />}
            {activeTab === "devices" && <DeviceManagement />}
            {activeTab === "settings" && <SecuritySettings />}
            {activeTab === "activity" && <ActivityTimeline />}
          </motion.div>
        </AnimatePresence>
      </div>

      <DeviceModal />
    </div>
  )
}

export default SecurityPage