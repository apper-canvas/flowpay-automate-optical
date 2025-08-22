import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { businessService } from "@/services/api/businessService"

const PaymentLinksPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [paymentLinks, setPaymentLinks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    expiryHours: "24"
  })
  
  const [activeLink, setActiveLink] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const loadPaymentLinks = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [linksData, analyticsData] = await Promise.all([
        businessService.getPaymentLinks(),
        businessService.getPaymentLinkAnalytics()
      ])
      
      setPaymentLinks(linksData)
      setAnalytics(analyticsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPaymentLinks()
  }, [])

  const createPaymentLink = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      setCreating(true)
      
      const link = await businessService.createPaymentLink(
        formData.amount,
        formData.description || "Payment Request",
        parseInt(formData.expiryHours)
      )

      setPaymentLinks(prev => [link, ...prev])
      setActiveLink(link)
      setFormData({ amount: "", description: "", expiryHours: "24" })
      setShowCreateForm(false)
      toast.success("Payment link created successfully!")
      
      // Refresh analytics
      const analyticsData = await businessService.getPaymentLinkAnalytics()
      setAnalytics(analyticsData)
    } catch (error) {
      toast.error(error.message || "Failed to create payment link")
    } finally {
      setCreating(false)
    }
  }

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Payment link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const shareLink = async (link) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Payment Request',
          text: `Payment of $${link.amount} - ${link.description}`,
          url: link.url
        })
      } else {
        await copyLink(link.url)
      }
    } catch (error) {
      toast.error("Failed to share link")
    }
  }

  const deactivateLink = async (linkId) => {
    try {
      await businessService.updatePaymentLinkStatus(linkId, "inactive")
      setPaymentLinks(prev => prev.map(link => 
        link.Id === linkId ? { ...link, status: "inactive" } : link
      ))
      toast.success("Payment link deactivated")
      
      // Refresh analytics
      const analyticsData = await businessService.getPaymentLinkAnalytics()
      setAnalytics(analyticsData)
    } catch (error) {
      toast.error("Failed to deactivate link")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'expired': return 'warning'
      case 'inactive': return 'error'
      case 'used': return 'info'
      default: return 'default'
    }
  }

  const QRCodeDisplay = ({ url, size = 96 }) => (
    <div className={`w-${size/4} h-${size/4} bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center`}>
      <div className="w-3/4 h-3/4 bg-black relative">
        <div className="absolute inset-1 bg-white"></div>
        <div className="absolute top-1 left-1 w-3 h-3 bg-black"></div>
        <div className="absolute top-1 right-1 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-1 left-1 w-3 h-3 bg-black"></div>
        
        {Array.from({ length: 16 }, (_, i) => {
          const row = Math.floor(i / 4)
          const col = i % 4
          const shouldShow = (row + col) % 2 === 0
          return shouldShow ? (
            <div
              key={i}
              className="absolute w-1 h-1 bg-black"
              style={{
                left: `${25 + col * 12.5}%`,
                top: `${25 + row * 12.5}%`
              }}
            />
          ) : null
        })}
      </div>
    </div>
  )

  if (loading) {
    return <Loading type="page" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Error 
          message={error}
          onRetry={loadPaymentLinks}
          title="Failed to load payment links"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/business/tools')}
              >
                <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">
                  Payment Links
                </h1>
                <p className="text-gray-600 mt-1">
                  Create and manage shareable payment links
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="default"
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create Link
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="px-4 space-y-6 pb-8">
        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <Card padding="default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Links</p>
                  <p className="text-2xl font-display font-bold text-gray-900">
                    {analytics.totalLinks}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ApperIcon name="Link" size={20} className="text-primary" />
                </div>
              </div>
            </Card>

            <Card padding="default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Links</p>
                  <p className="text-2xl font-display font-bold text-success">
                    {analytics.activeLinks}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <ApperIcon name="CheckCircle" size={20} className="text-success" />
                </div>
              </div>
            </Card>

            <Card padding="default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Collected</p>
                  <p className="text-2xl font-display font-bold text-gray-900">
                    ${analytics.totalCollected.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <ApperIcon name="DollarSign" size={20} className="text-success" />
                </div>
              </div>
            </Card>

            <Card padding="default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-display font-bold text-gray-900">
                    {analytics.conversionRate}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <ApperIcon name="TrendingUp" size={20} className="text-info" />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Active/Selected Link Display */}
        {activeLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-gray-900">
                  Active Payment Link
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveLink(null)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Link Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Amount</label>
                      <p className="text-xl font-display font-bold text-success">
                        ${activeLink.amount}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusColor(activeLink.status)}>
                          {activeLink.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                    <p className="font-medium text-gray-900">
                      {activeLink.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Created</label>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(activeLink.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Expires</label>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(activeLink.expiresAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Payment Link</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={activeLink.url}
                        readOnly
                        className="flex-1 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(activeLink.url)}
                      >
                        <ApperIcon name="Copy" size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => shareLink(activeLink)}
                      className="flex-1"
                    >
                      <ApperIcon name="Share2" size={16} className="mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deactivateLink(activeLink.Id)}
                      className="flex-1 text-error hover:bg-error/5"
                    >
                      <ApperIcon name="XCircle" size={16} className="mr-2" />
                      Deactivate
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <label className="text-sm text-gray-600 mb-3 block">QR Code</label>
                  <div className="flex justify-center mb-4">
                    <QRCodeDisplay url={activeLink.url} size={128} />
                  </div>
                  <p className="text-xs text-gray-600">Scan to pay</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Payment Links List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-gray-900">
              All Payment Links ({paymentLinks.length})
            </h3>
          </div>

          <div className="space-y-3">
            {paymentLinks.length > 0 ? (
              paymentLinks.map((link, index) => (
                <motion.div
                  key={link.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card padding="default" className="hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <QRCodeDisplay url={link.url} size={48} />
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              ${link.amount}
                            </h4>
                            <Badge variant={getStatusColor(link.status)} size="sm">
                              {link.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {link.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created {formatDate(link.createdAt)} • 
                            Expires {formatDate(link.expiresAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveLink(link)}
                        >
                          <ApperIcon name="Eye" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(link.url)}
                        >
                          <ApperIcon name="Copy" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareLink(link)}
                        >
                          <ApperIcon name="Share2" size={16} />
                        </Button>
                        {link.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deactivateLink(link.Id)}
                            className="text-error hover:bg-error/5"
                          >
                            <ApperIcon name="XCircle" size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card padding="lg" className="text-center">
                <ApperIcon name="Link" size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Links</h3>
                <p className="text-gray-600 mb-4">Create your first payment link to get started</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Create Payment Link
                </Button>
              </Card>
            )}
          </div>
        </motion.div>
      </div>

      {/* Create Link Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" padding="lg">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                  Create Payment Link
                </h3>
                <p className="text-gray-600 text-sm">
                  Generate a shareable link for collecting payments
                </p>
              </div>

              <Input
                label="Payment Amount ($)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                step="0.01"
              />

              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Payment for..."
              />

              <Input
                label="Expiry Time (hours)"
                type="number"
                value={formData.expiryHours}
                onChange={(e) => setFormData({...formData, expiryHours: e.target.value})}
                placeholder="24"
                min="1"
                max="168"
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false)
                    setFormData({ amount: "", description: "", expiryHours: "24" })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createPaymentLink}
                  disabled={creating || !formData.amount}
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Link" size={16} className="mr-2" />
                      Create Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PaymentLinksPage