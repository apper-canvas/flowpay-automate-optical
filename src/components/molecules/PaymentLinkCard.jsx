import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import { businessService } from "@/services/api/businessService"

const PaymentLinkCard = ({ onNavigate }) => {
  const [recentLinks, setRecentLinks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecentLinks = async () => {
      try {
        const [linksData, analyticsData] = await Promise.all([
          businessService.getPaymentLinks(),
          businessService.getPaymentLinkAnalytics()
        ])
        
        // Get the 3 most recent links
        setRecentLinks(linksData.slice(0, 3))
        setAnalytics(analyticsData)
      } catch (error) {
        console.error("Failed to load payment links:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRecentLinks()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'expired': return 'warning'
      case 'inactive': return 'error'
      case 'used': return 'info'
      default: return 'default'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <Loading type="component" />
      </Card>
    )
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <ApperIcon name="Link" size={24} className="text-success" />
          </div>
          <div>
            <h3 className="text-xl font-display font-semibold text-gray-900">
              Payment Links
            </h3>
            <p className="text-gray-600 text-sm">
              Create and manage shareable payment links
            </p>
          </div>
        </div>
        <Button onClick={onNavigate} variant="success">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Link
        </Button>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Links</p>
            <p className="text-lg font-display font-bold text-gray-900">
              {analytics.totalLinks}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-lg font-display font-bold text-success">
              {analytics.activeLinks}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Collected</p>
            <p className="text-lg font-display font-bold text-gray-900">
              ${analytics.totalCollected.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Rate</p>
            <p className="text-lg font-display font-bold text-gray-900">
              {analytics.conversionRate}%
            </p>
          </div>
        </div>
      )}

      {/* Recent Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Recent Links</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigate}
          >
            View All
            <ApperIcon name="ArrowRight" size={14} className="ml-1" />
          </Button>
        </div>

        {recentLinks.length > 0 ? (
          <div className="space-y-2">
            {recentLinks.map((link) => (
              <motion.div
                key={link.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                    <div className="w-6 h-6 bg-black relative">
                      <div className="absolute inset-0.5 bg-white"></div>
                      <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-black"></div>
                      <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-black"></div>
                      <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-black"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        ${link.amount}
                      </span>
                      <Badge variant={getStatusColor(link.status)} size="sm">
                        {link.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {link.description} • {formatDate(link.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {link.payments || 0} payments
                  </p>
                  <p className="text-xs text-gray-500">
                    {link.clicks || 0} clicks
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ApperIcon name="Link" size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 mb-3">No payment links created yet</p>
            <Button onClick={onNavigate} size="sm">
              Create Your First Link
            </Button>
          </div>
        )}
      </div>

      {/* Quick Action */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button
          onClick={onNavigate}
          variant="outline"
          className="w-full"
        >
          <ApperIcon name="Settings" size={16} className="mr-2" />
          Manage All Payment Links
        </Button>
      </div>
    </Card>
  )
}

export default PaymentLinkCard