import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"

const BusinessMetrics = ({ metrics, loading = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getTrendIcon = (value) => {
    return value >= 0 ? "TrendingUp" : "TrendingDown"
  }

  const getTrendColor = (value) => {
    return value >= 0 ? "text-success" : "text-error"
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          >
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-2 bg-gray-200 rounded w-12" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const metricCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(metrics?.todaySales || 0),
      icon: "DollarSign",
      trend: "+12.5%",
      trendValue: 12.5,
      color: "text-primary"
    },
    {
      title: "Transactions",
      value: metrics?.todayTransactions || 0,
      icon: "CreditCard",
      trend: "+8.2%",
      trendValue: 8.2,
      color: "text-info"
    },
    {
      title: "Pending Settlements",
      value: formatCurrency(metrics?.pendingSettlements || 0),
      icon: "Clock",
      trend: "+5.1%",
      trendValue: 5.1,
      color: "text-warning"
    },
    {
      title: "Success Rate",
      value: `${metrics?.successRate || 0}%`,
      icon: "CheckCircle",
      trend: "+0.3%",
      trendValue: 0.3,
      color: "text-success"
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card padding="default" className="h-full hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center`}>
                    <ApperIcon name={metric.icon} size={16} className={metric.color} />
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-1">{metric.title}</p>
                <p className="text-lg font-display font-bold text-gray-900 mb-2">
                  {metric.value}
                </p>
                
                <div className="flex items-center space-x-1">
                  <ApperIcon 
                    name={getTrendIcon(metric.trendValue)} 
                    size={12} 
                    className={getTrendColor(metric.trendValue)} 
                  />
                  <span className={`text-xs font-medium ${getTrendColor(metric.trendValue)}`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default BusinessMetrics