import { motion } from "framer-motion"
import { format } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"

const TransactionRow = ({ transaction, onClick }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case "payment":
        return "ArrowUpRight"
      case "received":
        return "ArrowDownLeft"
      case "deposit":
        return "Plus"
      case "exchange":
        return "RefreshCw"
      default:
        return "DollarSign"
    }
  }

  const getTransactionColor = (type, amount) => {
    if (type === "received" || type === "deposit") return "text-success"
    if (amount < 0) return "text-error"
    return "text-gray-900"
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "failed":
        return "error"
      default:
        return "default"
    }
  }

  const formatAmount = (amount, currency) => {
    const absAmount = Math.abs(amount)
    const prefix = amount >= 0 ? "+" : "-"
    
    if (currency === "BTC" || currency === "ETH") {
      return `${prefix}${absAmount.toFixed(8)} ${currency}`
    }
    
    const formatted = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absAmount)
    
    return `${prefix}$${formatted}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="bg-surface p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ApperIcon 
              name={getTransactionIcon(transaction.type)} 
              size={18} 
              className="text-gray-600" 
            />
          </div>
          
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {transaction.recipient}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500">
                {format(new Date(transaction.timestamp), "MMM dd, yyyy")}
              </p>
              <Badge variant={getStatusVariant(transaction.status)} size="xs">
                {transaction.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`font-semibold text-sm ${getTransactionColor(transaction.type, transaction.amount)}`}>
            {formatAmount(transaction.amount, transaction.currency)}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(transaction.timestamp), "HH:mm")}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default TransactionRow