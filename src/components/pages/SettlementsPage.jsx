import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { format, parseISO } from "date-fns"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { businessService } from "@/services/api/businessService"

const SettlementsPage = () => {
  const [settlements, setSettlements] = useState([])
  const [pendingPayouts, setPendingPayouts] = useState([])
  const [settlementMetrics, setSettlementMetrics] = useState(null)
  const [feeBreakdown, setFeeBreakdown] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const loadSettlementData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [settlementsData, payoutsData, metricsData, feesData] = await Promise.all([
        businessService.getSettlementSchedule(),
        businessService.getPendingPayouts(),
        businessService.getSettlementMetrics(),
        businessService.getFeeBreakdown()
      ])
      
      setSettlements(settlementsData)
      setPendingPayouts(payoutsData)
      setSettlementMetrics(metricsData)
      setFeeBreakdown(feesData)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load settlement data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettlementData()
  }, [])

  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch = settlement.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         settlement.Id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || settlement.status === statusFilter
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "upcoming" && new Date(settlement.settlementDate) > new Date()) ||
                       (dateFilter === "completed" && settlement.status === "completed")
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed": return "success"
      case "pending": return "warning"
      case "processing": return "info"
      case "failed": return "error"
      default: return "default"
    }
  }

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Settlement Tracking
          </h1>
        </div>
        <div className="px-4">
          <Loading type="page" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Settlement Tracking
          </h1>
        </div>
        <div className="px-4">
          <Error 
            message={error}
            onRetry={loadSettlementData}
            title="Failed to load settlement data"
          />
        </div>
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
            Settlement Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor pending payouts, settlement schedule, and fee breakdown
          </p>
        </motion.div>
      </div>

      <div className="px-4 space-y-6 pb-8">
        {/* Settlement Overview Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-display font-bold text-gray-900">
                  {formatCurrency(settlementMetrics?.totalPending || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <ApperIcon name="Clock" size={24} className="text-warning" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Settlement</p>
                <p className="text-lg font-display font-semibold text-gray-900">
                  {settlementMetrics?.nextSettlementDate ? 
                    format(parseISO(settlementMetrics.nextSettlementDate), "MMM dd") : "TBD"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <ApperIcon name="Calendar" size={24} className="text-info" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fees</p>
                <p className="text-2xl font-display font-bold text-gray-900">
                  {formatCurrency(settlementMetrics?.totalFees || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                <ApperIcon name="CreditCard" size={24} className="text-error" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card padding="lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search settlements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon="Search"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pending Payouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900">
              Pending Payouts
            </h2>
            <Badge variant="warning" size="sm">
              {pendingPayouts.length} pending
            </Badge>
          </div>

          {pendingPayouts.length === 0 ? (
            <Card padding="lg">
              <Empty
                title="No pending payouts"
                message="All payments have been settled"
                icon="CheckCircle"
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingPayouts.map((payout, index) => (
                <motion.div
                  key={payout.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Card padding="lg" className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <ApperIcon name="Clock" size={18} className="text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {payout.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-gray-500">
                              Transactions: {payout.transactionCount}
                            </p>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-500">
                              Expected: {format(parseISO(payout.expectedDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">
                          {formatCurrency(payout.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Fee: {formatCurrency(payout.fee)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Settlement Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900">
              Settlement Schedule
            </h2>
            <p className="text-sm text-gray-500">
              {filteredSettlements.length} settlements
            </p>
          </div>

          {filteredSettlements.length === 0 ? (
            <Card padding="lg">
              <Empty
                title="No settlements found"
                message="No settlements match your current filters"
                icon="Calendar"
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSettlements.map((settlement, index) => (
                <motion.div
                  key={settlement.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <Card padding="lg" className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ApperIcon name="Banknote" size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-900">
                              {settlement.description}
                            </p>
                            <Badge variant={getStatusVariant(settlement.status)} size="xs">
                              {settlement.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {format(parseISO(settlement.settlementDate), "MMM dd, yyyy 'at' HH:mm")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-lg text-success">
                          {formatCurrency(settlement.netAmount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Gross: {formatCurrency(settlement.grossAmount)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Fee Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Fee Breakdown (Last 30 Days)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="lg">
              <h3 className="font-display font-semibold text-gray-900 mb-4">
                Fee Categories
              </h3>
              <div className="space-y-4">
                {feeBreakdown?.categories?.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ['#5B3FFF', '#7C5CFF', '#FF6B35', '#22C55E'][index] }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(category.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {category.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg">
              <h3 className="font-display font-semibold text-gray-900 mb-4">
                Fee Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Transaction Volume</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(feeBreakdown?.summary?.totalVolume || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Fees Paid</span>
                  <span className="font-semibold text-error">
                    {formatCurrency(feeBreakdown?.summary?.totalFees || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Fee Rate</span>
                  <span className="font-semibold text-gray-900">
                    {feeBreakdown?.summary?.averageRate || 0}%
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Net Received</span>
                    <span className="font-semibold text-success text-lg">
                      {formatCurrency(feeBreakdown?.summary?.netReceived || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettlementsPage