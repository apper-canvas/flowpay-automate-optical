import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { subscriptionService } from "@/services/api/subscriptionService"
import { paymentMethodService } from "@/services/api/paymentMethodService"
import { toast } from "react-toastify"
import { format } from "date-fns"

const SubscriptionPage = () => {
  const navigate = useNavigate()
  const [subscriptions, setSubscriptions] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [actionType, setActionType] = useState("")
  const [analytics, setAnalytics] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [subscriptionsData, paymentMethodsData, analyticsData] = await Promise.all([
        subscriptionService.getAllSubscriptions(),
        paymentMethodService.getAllPaymentMethods(),
        subscriptionService.getSubscriptionAnalytics()
      ])
      
      setSubscriptions(subscriptionsData)
      setPaymentMethods(paymentMethodsData)
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

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         subscription.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleAction = async (subscription, action) => {
    setSelectedSubscription(subscription)
    setActionType(action)
    setShowActionModal(true)
  }

  const confirmAction = async () => {
    try {
      let result
      const subscriptionId = selectedSubscription.Id

      switch (actionType) {
        case "pause":
          result = await subscriptionService.pauseSubscription(subscriptionId)
          toast.success(`${selectedSubscription.serviceName} subscription paused`)
          break
        case "resume":
          result = await subscriptionService.resumeSubscription(subscriptionId)
          toast.success(`${selectedSubscription.serviceName} subscription resumed`)
          break
        case "cancel":
          result = await subscriptionService.cancelSubscription(subscriptionId, "User requested cancellation")
          toast.success(`${selectedSubscription.serviceName} subscription cancelled`)
          break
        case "delete":
          result = await subscriptionService.deleteSubscription(subscriptionId)
          toast.success(`${selectedSubscription.serviceName} subscription deleted`)
          break
      }

      await loadData()
      setShowActionModal(false)
      setSelectedSubscription(null)
      setActionType("")
    } catch (err) {
      toast.error(`Failed to ${actionType} subscription: ${err.message}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success"
      case "paused": return "warning"
      case "cancelled": return "error"
      default: return "default"
    }
  }

  const getBillingCycleDisplay = (cycle) => {
    switch (cycle) {
      case "weekly": return "Weekly"
      case "monthly": return "Monthly"
      case "quarterly": return "Quarterly"
      case "yearly": return "Yearly"
      default: return cycle
    }
  }

  const formatAmount = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  const SubscriptionCard = ({ subscription }) => {
    const paymentMethod = paymentMethods.find(pm => pm.Id === subscription.paymentMethodId)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        layout
      >
        <Card padding="lg" className="hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <ApperIcon name={subscription.serviceIcon} size={24} className="text-white" />
              </div>
              
              <div>
                <h3 className="font-display font-semibold text-gray-900">
                  {subscription.serviceName}
                </h3>
                <p className="text-sm text-gray-500">
                  {subscription.description}
                </p>
              </div>
            </div>
            
            <Badge variant={getStatusColor(subscription.status)} size="sm">
              {subscription.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Amount</p>
              <p className="font-semibold text-lg">
                {formatAmount(subscription.amount, subscription.currency)}
              </p>
              <p className="text-xs text-gray-500">
                {getBillingCycleDisplay(subscription.billingCycle)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Next Payment</p>
              <p className="font-medium">
                {format(new Date(subscription.nextPaymentDate), "MMM dd, yyyy")}
              </p>
              <p className="text-xs text-gray-500">
                {paymentMethod ? paymentMethod.name : "No payment method"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Badge variant="default" size="xs">
                {subscription.category}
              </Badge>
              {subscription.autoRenew && (
                <Badge variant="info" size="xs">
                  Auto-renew
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {subscription.status === "active" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(subscription, "pause")}
                    className="p-2"
                  >
                    <ApperIcon name="Pause" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(subscription, "cancel")}
                    className="p-2"
                  >
                    <ApperIcon name="X" size={16} />
                  </Button>
                </>
              )}
              
              {subscription.status === "paused" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(subscription, "resume")}
                    className="p-2"
                  >
                    <ApperIcon name="Play" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(subscription, "cancel")}
                    className="p-2"
                  >
                    <ApperIcon name="X" size={16} />
                  </Button>
                </>
              )}
              
              {subscription.status === "cancelled" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(subscription, "delete")}
                  className="p-2 text-error"
                >
                  <ApperIcon name="Trash2" size={16} />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <ApperIcon name="Settings" size={16} />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

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
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="AlertTriangle" size={24} className="text-red-600" />
              </div>
              
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)} Subscription
              </h3>
              
              <p className="text-gray-600">
                Are you sure you want to {actionType} your {selectedSubscription?.serviceName} subscription?
                {actionType === "cancel" && " This action cannot be undone."}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowActionModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "delete" || actionType === "cancel" ? "destructive" : "primary"}
                onClick={confirmAction}
                className="flex-1"
              >
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (loading) {
    return <Loading type="subscriptions" />
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadData}
        title="Failed to load subscriptions"
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
                Subscriptions
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your recurring payments
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add
          </Button>
        </motion.div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="px-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <Card padding="lg" variant="gradient" className="text-white">
              <div className="text-center">
                <p className="text-2xl font-display font-bold mb-1">
                  {formatAmount(analytics.monthlySpend)}
                </p>
                <p className="text-white/80 text-sm">Monthly Spend</p>
              </div>
            </Card>
            
            <Card padding="lg">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-gray-900 mb-1">
                  {analytics.activeSubscriptions}
                </p>
                <p className="text-gray-600 text-sm">Active Subscriptions</p>
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
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {["all", "active", "paused", "cancelled"].map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? "primary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(filter)}
                className="whitespace-nowrap"
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subscriptions List */}
      <div className="px-4 space-y-4 pb-8">
        <AnimatePresence mode="popLayout">
          {filteredSubscriptions.length === 0 ? (
            <Empty
              title="No subscriptions found"
              message="Add your first subscription to get started managing your recurring payments."
              icon="CreditCard"
              actionLabel="Add Subscription"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.Id}
                subscription={subscription}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <ActionModal />
    </div>
  )
}

export default SubscriptionPage