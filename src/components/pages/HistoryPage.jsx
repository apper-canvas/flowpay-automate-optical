import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import TransactionRow from "@/components/molecules/TransactionRow"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

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

  useEffect(() => {
    let filtered = transactions

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(t => t.type === filterType)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.recipient.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchQuery, filterType])

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "payment", label: "Payments" },
    { value: "received", label: "Received" },
    { value: "deposit", label: "Deposits" },
    { value: "exchange", label: "Exchange" }
  ]

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
            View all your transaction activity
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="px-4 space-y-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-2 overflow-x-auto pb-2"
        >
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filterType === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterType(option.value)}
              className="whitespace-nowrap"
            >
              {option.label}
            </Button>
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4">
        {filteredTransactions.length === 0 ? (
          <Empty
            title={searchQuery || filterType !== "all" ? "No transactions found" : "No transaction history"}
            message={
              searchQuery || filterType !== "all"
                ? "Try adjusting your search or filters."
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