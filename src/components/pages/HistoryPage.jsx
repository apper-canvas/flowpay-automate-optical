import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import TransactionRow from "@/components/molecules/TransactionRow"
import TransactionFilterBar from "@/components/molecules/TransactionFilterBar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import { walletService } from "@/services/api/walletService"
import { splitBillService } from "@/services/api/splitBillService"

const HistoryPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all") // all, transactions, split-bills
  const [transactions, setTransactions] = useState([])
  const [splitBills, setSplitBills] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [filteredSplitBills, setFilteredSplitBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    searchQuery: "",
    type: "all",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    settlementStatus: "all" // all, settled, active, pending
  })

  const loadTransactions = async () => {
    try {
setLoading(true)
      setError("")
      
      const [allTransactions, allSplitBills] = await Promise.all([
        walletService.getAllTransactions(),
        splitBillService.getAllSplitBills()
      ])
      
      setTransactions(allTransactions)
      setSplitBills(allSplitBills)
      setFilteredTransactions(allTransactions)
      setFilteredSplitBills(allSplitBills)
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
      const filteredTxns = await walletService.getFilteredTransactions(transactions, filters)
      setFilteredTransactions(filteredTxns)
      
      // Filter split bills
      let filteredBills = [...splitBills]
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        filteredBills = filteredBills.filter(bill =>
          bill.title.toLowerCase().includes(query) ||
          bill.description.toLowerCase().includes(query)
        )
      }
      
      if (filters.settlementStatus !== "all") {
        filteredBills = filteredBills.filter(bill => bill.status === filters.settlementStatus)
      }
      
      if (filters.dateFrom || filters.dateTo) {
        filteredBills = filteredBills.filter(bill => {
          const billDate = new Date(bill.createdAt)
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
          const toDate = filters.dateTo ? new Date(filters.dateTo + "T23:59:59") : null
          
          if (fromDate && billDate < fromDate) return false
          if (toDate && billDate > toDate) return false
          return true
        })
      }
      
      setFilteredSplitBills(filteredBills)
    } catch (err) {
      console.error("Filter error:", err)
      toast.error("Error applying filters")
      setFilteredTransactions(transactions)
      setFilteredSplitBills(splitBills)
    }
  }

  useEffect(() => {
    if (transactions.length > 0 || splitBills.length > 0) {
      applyFilters()
    }
  }, [transactions, splitBills, filters])

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

const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "warning"
      case "settled": return "success"
      default: return "default"
    }
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
            Transaction & Split History
          </h1>
          <p className="text-gray-600 mt-1">
            View and filter all your transaction activity and group expenses
          </p>
          
          {/* Tab Navigation */}
          <div className="mt-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: "all", label: "All Activity", count: filteredTransactions.length + filteredSplitBills.length },
                { key: "transactions", label: "Transactions", count: filteredTransactions.length },
                { key: "split-bills", label: "Split Bills", count: filteredSplitBills.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {((filteredTransactions.length < transactions.length) || (filteredSplitBills.length < splitBills.length)) && (
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
        {/* All Activity */}
        {activeTab === "all" && (
          <>
            {(filteredTransactions.length === 0 && filteredSplitBills.length === 0) ? (
              <Empty
                title="No activity found"
                message="No transactions or split bills match your current filters."
                icon="Receipt"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* Split Bills Section */}
                {filteredSplitBills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold text-gray-900 mb-3">
                      Group Expenses
                    </h3>
                    <div className="space-y-3">
                      {filteredSplitBills.map((bill, index) => (
                        <motion.div
                          key={`split-${bill.Id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                        >
                          <Card padding="lg" className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/payments/split-bill/${bill.Id}`)}>
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-display font-semibold text-gray-900">
                                      {bill.title}
                                    </h4>
                                    <Badge variant={getStatusColor(bill.status)} size="xs">
                                      {bill.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {bill.description || "Group expense"}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>{formatAmount(bill.totalAmount)}</span>
                                    <span>•</span>
                                    <span>{bill.participants.length} participants</span>
                                    <span>•</span>
                                    <span>{bill.participants.filter(p => p.status === "paid").length} paid</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions Section */}
                {filteredTransactions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold text-gray-900 mb-3">
                      Recent Transactions
                    </h3>
                    <div className="space-y-3">
                      {filteredTransactions.slice(0, 10).map((transaction, index) => (
                        <motion.div
                          key={`txn-${transaction.Id}`}
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
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* Transactions Only */}
        {activeTab === "transactions" && (
          <>
            {filteredTransactions.length === 0 ? (
              <Empty
                title="No transactions found"
                message="No transactions match your current filters."
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
          </>
        )}

        {/* Split Bills Only */}
        {activeTab === "split-bills" && (
          <>
            {filteredSplitBills.length === 0 ? (
              <Empty
                title="No split bills found"
                message="No group expenses match your current filters."
                icon="Users"
                action={
                  <Button onClick={() => navigate("/payments/split-bill")}>
                    <ApperIcon name="Plus" size={16} className="mr-2" />
                    Create Split Bill
                  </Button>
                }
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                {/* Summary Stats */}
                <Card padding="lg" className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-gray-900">
                        {filteredSplitBills.filter(b => b.status === "settled").length}
                      </p>
                      <p className="text-xs text-gray-600">Settled</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-warning">
                        {filteredSplitBills.filter(b => b.status === "active").length}
                      </p>
                      <p className="text-xs text-gray-600">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-primary">
                        {formatAmount(filteredSplitBills.reduce((sum, bill) => sum + bill.totalAmount, 0))}
                      </p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>
                </Card>

                {filteredSplitBills.map((bill, index) => (
                  <motion.div
                    key={bill.Id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <Card padding="lg" className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/payments/split-bill/${bill.Id}`)}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-display font-semibold text-gray-900">
                                {bill.title}
                              </h4>
                              <Badge variant={getStatusColor(bill.status)} size="xs">
                                {bill.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {bill.description || "Group expense"}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{formatAmount(bill.totalAmount)}</span>
                              <span>•</span>
                              <span>{bill.participants.length} participants</span>
                              <span>•</span>
                              <span>Created {new Date(bill.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Settlement Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Settlement Progress</span>
                            <span className="text-gray-900">
                              {bill.participants.filter(p => p.status === "paid").length} of {bill.participants.length} paid
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-success h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(bill.participants.filter(p => p.status === "paid").length / bill.participants.length) * 100}%`
                              }}
                            />
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation()
                            toast.info("Expense report download started")
                          }}>
                            <ApperIcon name="Download" size={14} className="mr-1" />
                            Export
                          </Button>
                          {bill.status === "active" && (
                            <Button size="sm" variant="ghost" onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/payments/split-bill/${bill.Id}`)
                            }}>
                              <ApperIcon name="Eye" size={14} className="mr-1" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HistoryPage