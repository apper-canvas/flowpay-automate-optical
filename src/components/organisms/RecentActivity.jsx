import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import TransactionRow from "@/components/molecules/TransactionRow"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { walletService } from "@/services/api/walletService"
import ApperIcon from "@/components/ApperIcon"

const RecentActivity = ({ refreshTrigger = 0 }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadRecentTransactions = async () => {
    try {
      setLoading(true)
      setError("")
      
      const recentTransactions = await walletService.getRecentTransactions(3)
      setTransactions(recentTransactions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecentTransactions()
  }, [refreshTrigger])

  if (loading) {
    return <Loading type="transactions" />
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadRecentTransactions}
        title="Failed to load transactions"
      />
    )
  }

  if (transactions.length === 0) {
    return (
      <Empty
        title="No recent activity"
        message="Your recent transactions will appear here."
        icon="Activity"
        actionLabel="View All History"
        onAction={() => {/* Navigate to history page */}}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold text-gray-900">
          Recent Activity
        </h3>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {/* Navigate to history page */}}
        >
          View All
          <ApperIcon name="ArrowRight" size={16} className="ml-1" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.Id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <TransactionRow 
              transaction={transaction}
              onClick={() => {/* Open transaction details */}}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default RecentActivity