import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { format, formatDistanceToNow } from "date-fns";
import { alertService } from "@/services/api/alertService";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const AlertsPage = () => {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [actionType, setActionType] = useState("")
  const [retryingPayment, setRetryingPayment] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [alertsData, analyticsData] = await Promise.all([
        alertService.getAllAlerts(),
        alertService.getAlertAnalytics()
      ])
      setAlerts(alertsData)
      setAnalytics(analyticsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || alert.type === typeFilter
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    
    return matchesSearch && matchesType && matchesSeverity
  })

  const handleAction = async (alert, action) => {
    setSelectedAlert(alert)
    setActionType(action)
    setShowActionModal(true)
  }

  const confirmAction = async () => {
    try {
      let result
      const alertId = selectedAlert.Id

      switch (actionType) {
        case "retry":
          setRetryingPayment(true)
          result = await alertService.retryFailedPayment(alertId)
          if (result.success) {
            toast.success(result.message)
          } else {
            toast.error(result.message)
          }
          break
        case "mark_read":
          result = await alertService.markAsRead(alertId)
          toast.success("Alert marked as read")
          break
        case "dismiss":
          result = await alertService.dismissAlert(alertId)
          toast.success("Alert dismissed")
          break
        case "snooze":
          result = await alertService.snoozeAlert(alertId, 24)
          toast.success("Alert snoozed for 24 hours")
          break
      }

      await loadData()
      setShowActionModal(false)
      setSelectedAlert(null)
      setActionType("")
    } catch (err) {
      toast.error(`Failed to ${actionType} alert: ${err.message}`)
    } finally {
      setRetryingPayment(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllAsRead()
      toast.success("All alerts marked as read")
      await loadData()
    } catch (err) {
      toast.error("Failed to mark all alerts as read")
    }
  }

  const handleDismissAll = async () => {
    try {
      const result = await alertService.dismissAllAlerts()
      toast.success(result.message)
      await loadData()
    } catch (err) {
      toast.error("Failed to dismiss all alerts")
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "error"
      case "medium": return "warning"
      case "low": return "info"
      default: return "default"
    }
  }

  const getSeverityIcon = (type, severity) => {
    switch (type) {
      case "failed_payment": return severity === "high" ? "AlertTriangle" : "CreditCard"
      case "upcoming_payment": return "Clock"
      case "spending_threshold": return "TrendingUp"
      case "payment_success": return "CheckCircle"
      default: return "Bell"
    }
  }

  const getTypeDisplay = (type) => {
    switch (type) {
      case "failed_payment": return "Payment Failed"
      case "upcoming_payment": return "Upcoming Payment"
      case "spending_threshold": return "Spending Alert"
      case "payment_success": return "Payment Success"
      default: return "Notification"
    }
  }

  const formatAmount = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  const AlertCard = ({ alert }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card 
        padding="lg" 
        className={`transition-all duration-200 ${
          !alert.isRead ? 'border-l-4 border-l-primary bg-primary/5' : 'hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              alert.severity === 'high' ? 'bg-error/10' :
              alert.severity === 'medium' ? 'bg-warning/10' : 'bg-info/10'
            }`}>
              <ApperIcon 
                name={getSeverityIcon(alert.type, alert.severity)} 
                size={18} 
                className={
                  alert.severity === 'high' ? 'text-error' :
                  alert.severity === 'medium' ? 'text-warning' : 'text-info'
                } 
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-display font-semibold text-gray-900 text-sm">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.serviceName} • {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Badge variant={getSeverityColor(alert.severity)} size="xs">
                    {alert.severity}
                  </Badge>
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {alert.message}
              </p>
              
              {alert.amount && (
                <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500">
                  <span>Amount: {formatAmount(alert.amount, alert.currency)}</span>
                  {alert.type === 'failed_payment' && alert.retryCount && (
                    <span>Retries: {alert.retryCount}/{alert.maxRetries}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Badge variant="default" size="xs">
            {getTypeDisplay(alert.type)}
          </Badge>
          
          <div className="flex items-center space-x-2">
            {alert.type === 'failed_payment' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAction(alert, "retry")}
                className="text-xs px-3 py-1"
              >
                <ApperIcon name="RefreshCw" size={12} className="mr-1" />
                Retry Payment
              </Button>
            )}
            
            {!alert.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(alert, "mark_read")}
                className="p-2"
              >
                <ApperIcon name="Check" size={14} />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(alert, "snooze")}
              className="p-2"
            >
              <ApperIcon name="Clock" size={14} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(alert, "dismiss")}
              className="p-2 text-gray-500"
            >
              <ApperIcon name="X" size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const ActionModal = () => (
    <AnimatePresence>
      {showActionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowActionModal(false)}
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
                  name={
                    actionType === 'retry' ? 'RefreshCw' :
                    actionType === 'mark_read' ? 'Check' :
                    actionType === 'dismiss' ? 'X' :
                    actionType === 'snooze' ? 'Clock' : 'AlertTriangle'
                  } 
                  size={24} 
                  className="text-primary" 
                />
              </div>
              
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                {actionType === 'retry' ? 'Retry Payment' :
                 actionType === 'mark_read' ? 'Mark as Read' :
                 actionType === 'dismiss' ? 'Dismiss Alert' :
                 actionType === 'snooze' ? 'Snooze Alert' : 'Confirm Action'}
              </h3>
              
              <p className="text-gray-600 text-sm">
                {actionType === 'retry' && `Attempt to process the failed payment for ${selectedAlert?.serviceName}?`}
                {actionType === 'mark_read' && `Mark this alert as read?`}
                {actionType === 'dismiss' && `Permanently dismiss this alert? This action cannot be undone.`}
                {actionType === 'snooze' && `Snooze this alert for 24 hours?`}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowActionModal(false)}
                className="flex-1"
                disabled={retryingPayment}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "dismiss" ? "destructive" : "primary"}
                onClick={confirmAction}
                className="flex-1"
                disabled={retryingPayment}
              >
                {retryingPayment && actionType === 'retry' ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  actionType === 'retry' ? 'Retry Payment' :
                  actionType === 'mark_read' ? 'Mark Read' :
                  actionType === 'dismiss' ? 'Dismiss' :
                  actionType === 'snooze' ? 'Snooze' : 'Confirm'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (loading) {
    return <Loading type="alerts" />
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadData}
        title="Failed to load alerts"
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
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Alerts
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your payment and spending notifications
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs px-3 py-2"
            >
              Mark All Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAll}
              className="text-xs px-3 py-2 text-gray-500"
            >
              Dismiss All
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="px-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            <Card padding="lg">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-gray-900 mb-1">
                  {analytics.total}
                </p>
                <p className="text-gray-600 text-sm">Total Alerts</p>
              </div>
            </Card>
            
            <Card padding="lg" variant={analytics.unread > 0 ? "warning" : "default"} className={analytics.unread > 0 ? "text-white" : ""}>
              <div className="text-center">
                <p className={`text-2xl font-display font-bold mb-1 ${analytics.unread > 0 ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.unread}
                </p>
                <p className={`text-sm ${analytics.unread > 0 ? 'text-white/80' : 'text-gray-600'}`}>Unread</p>
              </div>
            </Card>
            
            <Card padding="lg" variant={analytics.bySeverity.high > 0 ? "alert" : "default"} className={analytics.bySeverity.high > 0 ? "text-white" : ""}>
              <div className="text-center">
                <p className={`text-2xl font-display font-bold mb-1 ${analytics.bySeverity.high > 0 ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.bySeverity.high || 0}
                </p>
                <p className={`text-sm ${analytics.bySeverity.high > 0 ? 'text-white/80' : 'text-gray-600'}`}>High Priority</p>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {["all", "failed_payment", "upcoming_payment", "spending_threshold"].map((filter) => (
              <Button
                key={filter}
                variant={typeFilter === filter ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter(filter)}
                className="whitespace-nowrap text-xs"
              >
                {filter === "all" ? "All" : getTypeDisplay(filter)}
              </Button>
            ))}
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {["all", "high", "medium", "low"].map((filter) => (
              <Button
                key={filter}
                variant={severityFilter === filter ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSeverityFilter(filter)}
                className="whitespace-nowrap text-xs capitalize"
              >
                {filter}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts List */}
      <div className="px-4 space-y-4 pb-8">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length === 0 ? (
            <Empty
              title="No alerts found"
              message="You're all caught up! No alerts match your current filters."
              icon="Bell"
              actionLabel="View All Alerts"
              onAction={() => {
                setTypeFilter("all")
                setSeverityFilter("all")
                setSearchQuery("")
              }}
            />
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.Id}
                alert={alert}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <ActionModal />
    </div>
  )
}

export default AlertsPage