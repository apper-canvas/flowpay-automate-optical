import { useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import { businessService } from "@/services/api/businessService"

const BusinessTransactionList = ({ transactions, onRefund }) => {
  const [loading, setLoading] = useState("")
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [refundAmount, setRefundAmount] = useState("")
  const [refundReason, setRefundReason] = useState("")

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Math.abs(amount))
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

  const getTransactionIcon = (type) => {
    switch (type) {
      case "business_payment":
        return "ArrowDownLeft"
      case "business_refund":
        return "ArrowUpRight"
      default:
        return "DollarSign"
    }
  }

  const getTransactionColor = (type, amount) => {
    if (type === "business_payment" && amount > 0) return "text-success"
    if (type === "business_refund" || amount < 0) return "text-error"
    return "text-gray-900"
  }

  const handleRefundClick = (transaction) => {
    setSelectedTransaction(transaction)
    setRefundAmount(transaction.amount.toString())
    setRefundReason("")
    setShowRefundModal(true)
  }

  const handleRefund = async () => {
    try {
      setLoading("refund")
      await businessService.processRefund(
        selectedTransaction.Id,
        refundAmount,
        refundReason
      )
      toast.success("Refund processed successfully")
      setShowRefundModal(false)
      onRefund?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading("")
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ApperIcon name="Receipt" size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
          No Business Transactions
        </h3>
        <p className="text-gray-600">
          Your business transactions will appear here once customers start making payments.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold text-gray-900">
          Recent Business Transactions
        </h3>
        <Button variant="ghost" size="sm">
          View All
          <ApperIcon name="ArrowRight" size={16} className="ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card padding="default" className="hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <ApperIcon 
                      name={getTransactionIcon(transaction.type)} 
                      size={18} 
                      className="text-gray-600" 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {transaction.customer}
                      </p>
                      <Badge variant={getStatusVariant(transaction.status)} size="xs">
                        {transaction.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{transaction.customerEmail}</span>
                      <span>•</span>
                      <span>{transaction.paymentMethod}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.timestamp), "MMM dd, HH:mm")}</span>
                    </div>
                    
                    {transaction.invoiceId && (
                      <p className="text-xs text-primary font-medium mt-1">
                        {transaction.invoiceId}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${getTransactionColor(transaction.type, transaction.amount)}`}>
                      {transaction.amount > 0 ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  {transaction.refundable && transaction.status === "completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRefundClick(transaction)}
                      className="text-xs"
                    >
                      <ApperIcon name="RefreshCcw" size={14} className="mr-1" />
                      Refund
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" padding="lg">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                  Process Refund
                </h3>
                <p className="text-gray-600 text-sm">
                  Refund payment to {selectedTransaction.customer}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original Amount:</span>
                  <span className="font-medium">{formatCurrency(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{selectedTransaction.paymentMethod}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="0.00"
                    max={selectedTransaction.amount}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Refund
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    rows="3"
                    placeholder="Enter reason for refund..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={loading === "refund" || !refundAmount || !refundReason}
                  className="flex-1"
                >
                  {loading === "refund" ? "Processing..." : "Process Refund"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default BusinessTransactionList