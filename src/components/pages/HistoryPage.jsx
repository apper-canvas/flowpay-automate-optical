import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import TransactionRow from "@/components/molecules/TransactionRow"
import TransactionFilterBar from "@/components/molecules/TransactionFilterBar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { walletService } from "@/services/api/walletService"
const HistoryPage = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    searchQuery: "",
    type: "all",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: ""
  })
  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError("")
      
      const allTransactions = await walletService.getAllTransactions()
      setTransactions(allTransactions)
      setFilteredTransactions(allTransactions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

const applyFilters = async () => {
    try {
      const filtered = await walletService.getFilteredTransactions(transactions, filters)
      setFilteredTransactions(filtered)
    } catch (err) {
      console.error("Filter error:", err)
      toast.error("Error applying filters")
      setFilteredTransactions(transactions)
    }
  }

  useEffect(() => {
    if (transactions.length > 0) {
      applyFilters()
    }
  }, [transactions, filters])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }
const getFilterSummary = () => {
    const activeFilters = []
    if (filters.type !== "all") activeFilters.push(`Type: ${filters.type}`)
    if (filters.dateFrom || filters.dateTo) {
      const dateRange = `${filters.dateFrom || 'Start'} - ${filters.dateTo || 'Today'}`
      activeFilters.push(`Date: ${dateRange}`)
    }
    if (filters.amountMin || filters.amountMax) {
      const amountRange = `$${filters.amountMin || '0'} - $${filters.amountMax || '∞'}`
      activeFilters.push(`Amount: ${amountRange}`)
    }
    if (filters.searchQuery) activeFilters.push(`Search: "${filters.searchQuery}"`)
    return activeFilters
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Transaction History
          </h1>
        </div>
        <div className="px-4">
          <Loading type="transactions" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Transaction History
          </h1>
        </div>
        <div className="px-4">
          <Error 
            message={error}
            onRetry={loadTransactions}
            title="Failed to load transactions"
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
            Transaction History
          </h1>
<p className="text-gray-600 mt-1">
            View and filter all your transaction activity
          </p>
          {filteredTransactions.length < transactions.length && (
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-sm text-gray-500">Active filters:</span>
              {getFilterSummary().map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                >
                  {filter}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

{/* Enhanced Filter Bar */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TransactionFilterBar
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </motion.div>
      </div>

      {/* Results Summary */}
      {(filters.searchQuery || filters.type !== "all" || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax) && (
        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ApperIcon name="Info" size={16} className="text-blue-600" />
                <span className="text-sm text-blue-700">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div className="px-4">
{filteredTransactions.length === 0 ? (
          <Empty
            title={
              filters.searchQuery || filters.type !== "all" || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax
                ? "No transactions match your filters"
                : "No transaction history"
            }
            message={
              filters.searchQuery || filters.type !== "all" || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax
                ? "Try adjusting your filters or date range to see more results."
                : "Your transaction history will appear here as you use FlowPay."
            }
            icon="Receipt"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <TransactionRow 
                  transaction={transaction}
                  onClick={() => {/* Open transaction details */}}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage