import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { walletService } from "@/services/api/walletService";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import BusinessMetrics from "@/components/molecules/BusinessMetrics";
import BusinessChart from "@/components/molecules/BusinessChart";
import BusinessTransactionList from "@/components/organisms/BusinessTransactionList";
import BusinessQuickActions from "@/components/organisms/BusinessQuickActions";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
const BusinessPage = () => {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const loadBusinessData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [metricsData, transactionsData] = await Promise.all([
        walletService.getBusinessMetrics(),
        walletService.getBusinessTransactions(5)
      ])
      
      setMetrics(metricsData)
      setTransactions(transactionsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBusinessData()
  }, [refreshTrigger])

  const handleActionComplete = () => {
    setRefreshTrigger(prev => prev + 1)
    toast.success("Action completed successfully")
  }

  const handleRefund = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (loading) {
    return <Loading type="page" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Error 
          message={error}
          onRetry={loadBusinessData}
          title="Failed to load business dashboard"
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
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Business Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your merchant operations and analytics
          </p>
        </motion.div>
      </div>

      <div className="px-4 space-y-8 pb-8">
        {/* Business Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BusinessMetrics metrics={metrics} loading={loading} />
        </motion.div>

{/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BusinessQuickActions onActionComplete={handleActionComplete} />
        </motion.div>

        {/* Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-gray-900">
              Business Tools
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card 
              padding="lg"
              className="transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/business/tools')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ApperIcon name="QrCode" size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-gray-900 mb-1">
                    QR Generator
                  </h4>
                  <p className="text-sm text-gray-600">
                    Generate QR codes for payments
                  </p>
                </div>
              </div>
            </Card>
            
<Card 
              padding="lg"
              className="transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/business/payment-links')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <ApperIcon name="Link" size={24} className="text-success" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-gray-900 mb-1">
                    Payment Links
                  </h4>
                  <p className="text-sm text-gray-600">
                    Create shareable payment links
                  </p>
                </div>
              </div>
            </Card>
            <Card 
              padding="lg"
              className="transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/business/tools')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <ApperIcon name="FileText" size={24} className="text-info" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-gray-900 mb-1">
                    Invoice Templates
                  </h4>
                  <p className="text-sm text-gray-600">
Generate professional invoices
                  </p>
                </div>
              </div>
            </Card>
<Card
              padding="lg"
              className="transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/dashboard')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <ApperIcon name="BarChart3" size={24} className="text-success" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-gray-900 mb-1">
                    Business Dashboard
                  </h4>
                  <p className="text-sm text-gray-600">
                    View analytics and download reports
                  </p>
                </div>
              </div>
            </Card>

            <Card
              padding="lg"
              className="transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/business/settlements')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <ApperIcon name="Banknote" size={24} className="text-warning" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-gray-900 mb-1">
                    Settlement Tracking
                  </h4>
                  <p className="text-sm text-gray-600">
                    Monitor payouts and settlements
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Revenue Analytics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BusinessChart 
            revenueData={metrics?.revenueChart} 
            loading={loading} 
          />
        </motion.div>

        {/* Payment Methods Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Top Payment Methods */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
              Top Payment Methods
            </h3>
            <div className="space-y-3">
              {metrics?.topPaymentMethods?.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full`} 
                         style={{ backgroundColor: ['#5B3FFF', '#7C5CFF', '#FF6B35', '#22C55E'][index] }} />
                    <span className="text-sm font-medium text-gray-900">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(method.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{method.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
              Transaction Success Rate
            </h3>
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-200">
                  <div 
                    className="w-24 h-24 rounded-full bg-gradient-to-r from-success to-green-600"
                    style={{
                      background: `conic-gradient(from 0deg, #22C55E 0deg, #22C55E ${(metrics?.successRate || 0) * 3.6}deg, #E5E7EB ${(metrics?.successRate || 0) * 3.6}deg, #E5E7EB 360deg)`
                    }}
                  />
                  <div className="absolute inset-2 bg-surface rounded-full flex items-center justify-center">
                    <span className="text-lg font-display font-bold text-gray-900">
                      {metrics?.successRate || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {metrics?.todayTransactions || 0} transactions processed today
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Business Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <BusinessTransactionList 
            transactions={transactions} 
            onRefund={handleRefund} 
          />
        </motion.div>
      </div>
    </div>
  )
}

export default BusinessPage