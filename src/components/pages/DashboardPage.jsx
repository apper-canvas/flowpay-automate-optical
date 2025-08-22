import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { format, parseISO, startOfDay, endOfDay, subDays, isWithinInterval } from "date-fns"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { businessService } from "@/services/api/businessService"

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")
  const [reportLoading, setReportLoading] = useState("")

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [dashboardMetrics, businessTransactions, settlementSchedule] = await Promise.all([
        businessService.getDashboardMetrics(),
        businessService.getBusinessTransactions(),
        businessService.getSettlementSchedule()
      ])
      
      setDashboardData(dashboardMetrics)
      setTransactions(businessTransactions)
      setSettlements(settlementSchedule)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getDateRange = (filter) => {
    const now = new Date()
    switch (filter) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) }
      case "week":
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) }
      case "month":
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) }
      default:
        return null
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.Id.toString().includes(searchQuery)
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    
    let matchesDate = true
    if (dateFilter !== "all") {
      const range = getDateRange(dateFilter)
      if (range) {
        const transactionDate = new Date(transaction.timestamp)
        matchesDate = isWithinInterval(transactionDate, range)
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleDownloadReport = async (reportType) => {
    try {
      setReportLoading(reportType)
      const dateRange = getDateRange(dateFilter) || { start: subDays(new Date(), 30), end: new Date() }
      
      const report = await businessService.downloadSalesReport(reportType, {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      })
      
      // Simulate download
      const link = document.createElement('a')
      link.href = report.downloadUrl
      link.download = report.fileName
      link.click()
      
      toast.success(`${reportType} report downloaded successfully`)
    } catch (error) {
      toast.error(`Failed to download ${reportType} report`)
    } finally {
      setReportLoading("")
    }
  }

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed": return "success"
      case "pending": return "warning"
      case "processing": return "info"
      case "failed": return "error"
      default: return "default"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Business Dashboard
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
            Business Dashboard
          </h1>
        </div>
        <div className="px-4">
          <Error 
            message={error}
            onRetry={loadDashboardData}
            title="Failed to load dashboard"
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
            Business Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time analytics and settlement monitoring
          </p>
        </motion.div>
      </div>

      <div className="px-4 space-y-6 pb-8">
        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-xl font-display font-bold text-gray-900">
                  {formatCurrency(dashboardData?.todaySales || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <ApperIcon name="TrendingUp" size={12} className="text-success mr-1" />
                  <span className="text-xs text-success font-medium">+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ApperIcon name="DollarSign" size={24} className="text-primary" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-xl font-display font-bold text-gray-900">
                  {dashboardData?.todayTransactions || 0}
                </p>
                <div className="flex items-center mt-1">
                  <ApperIcon name="TrendingUp" size={12} className="text-success mr-1" />
                  <span className="text-xs text-success font-medium">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <ApperIcon name="CreditCard" size={24} className="text-info" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Settlements</p>
                <p className="text-xl font-display font-bold text-gray-900">
                  {formatCurrency(dashboardData?.pendingSettlements || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Next: {dashboardData?.nextSettlementDate ? 
                    format(parseISO(dashboardData.nextSettlementDate), "MMM dd") : "TBD"}
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
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-xl font-display font-bold text-gray-900">
                  {dashboardData?.successRate || 0}%
                </p>
                <div className="flex items-center mt-1">
                  <ApperIcon name="TrendingUp" size={12} className="text-success mr-1" />
                  <span className="text-xs text-success font-medium">+0.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <ApperIcon name="CheckCircle" size={24} className="text-success" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleDownloadReport("sales")}
              disabled={reportLoading === "sales"}
              className="h-auto py-4 flex-col space-y-2"
            >
              <ApperIcon name="Download" size={20} />
              <span className="text-sm">
                {reportLoading === "sales" ? "Generating..." : "Sales Report"}
              </span>
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleDownloadReport("settlements")}
              disabled={reportLoading === "settlements"}
              className="h-auto py-4 flex-col space-y-2"
            >
              <ApperIcon name="FileText" size={20} />
              <span className="text-sm">
                {reportLoading === "settlements" ? "Generating..." : "Settlement Report"}
              </span>
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleDownloadReport("analytics")}
              disabled={reportLoading === "analytics"}
              className="h-auto py-4 flex-col space-y-2"
            >
              <ApperIcon name="BarChart3" size={20} />
              <span className="text-sm">
                {reportLoading === "analytics" ? "Generating..." : "Analytics Report"}
              </span>
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              onClick={loadDashboardData}
              disabled={loading}
              className="h-auto py-4 flex-col space-y-2"
            >
              <ApperIcon name="RefreshCw" size={20} />
              <span className="text-sm">Refresh Data</span>
            </Button>
          </div>
        </motion.div>

        {/* Settlement Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900">
              Settlement Status
            </h2>
            <Button variant="ghost" size="sm">
              View All
              <ApperIcon name="ArrowRight" size={16} className="ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {settlements.slice(0, 3).map((settlement, index) => (
              <motion.div
                key={settlement.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card padding="lg" className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={getStatusVariant(settlement.status)} size="sm">
                      {settlement.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(parseISO(settlement.settlementDate), "MMM dd")}
                    </span>
                  </div>
                  
                  <p className="font-medium text-gray-900 mb-1">
                    {settlement.description}
                  </p>
                  <p className="text-lg font-display font-bold text-success">
                    {formatCurrency(settlement.netAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {settlement.transactionCount} transactions
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Transaction Monitoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900">
              Transaction Monitoring
            </h2>
            <p className="text-sm text-gray-500">
              {filteredTransactions.length} transactions
            </p>
          </div>

          {/* Filters */}
          <Card padding="lg" className="mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search transactions..."
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
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Transaction List */}
          {filteredTransactions.length === 0 ? (
            <Card padding="lg">
              <Empty
                title="No transactions found"
                message="No transactions match your current filters"
                icon="CreditCard"
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 10).map((transaction, index) => (
                <motion.div
                  key={transaction.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Card padding="lg" className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ApperIcon 
                            name={transaction.type === "business_payment" ? "ArrowDownLeft" : "ArrowUpRight"} 
                            size={18} 
                            className="text-primary" 
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-900">
                              {transaction.customer}
                            </p>
                            <Badge variant={getStatusVariant(transaction.status)} size="xs">
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {transaction.paymentMethod} • {format(new Date(transaction.timestamp), "MMM dd, HH:mm")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-success' : 'text-error'}`}>
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {transaction.Id}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage