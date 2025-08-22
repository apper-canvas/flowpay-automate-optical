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

{/* Enhanced Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" padding="lg">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                  Confirm Refund Process
                </h3>
                <p className="text-gray-600 text-sm">
                  Process refund through payment system for {selectedTransaction.customer}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <ApperIcon name="Info" size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Transaction Details</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600">Transaction ID:</span>
                    <p className="font-medium text-gray-900">#{selectedTransaction.Id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Original Amount:</span>
                    <p className="font-medium text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <p className="font-medium text-gray-900">{selectedTransaction.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer Email:</span>
                    <p className="font-medium text-gray-900">{selectedTransaction.customerEmail}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Amount *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={selectedTransaction.amount}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      Max: {formatCurrency(selectedTransaction.amount)}
                    </div>
                  </div>
                  {refundAmount && parseFloat(refundAmount) > selectedTransaction.amount && (
                    <p className="text-xs text-red-600 mt-1">Amount cannot exceed original transaction</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Refund *
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows="3"
                    placeholder="Provide a detailed reason for this refund (required for payment system processing)..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{refundReason.length}/500 characters</p>
                </div>
              </div>
              
              <div className="bg-warning-50 border border-warning-200 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="AlertTriangle" size={14} className="text-warning-600" />
                  <span className="text-xs font-medium text-warning-800">Refund Processing Notice</span>
                </div>
                <p className="text-xs text-warning-700 mt-1">
                  This will process the refund through the payment system and notify the customer. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRefundModal(false)
                    setRefundAmount("")
                    setRefundReason("")
                    setSelectedTransaction(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={
                    loading === "refund" || 
                    !refundAmount || 
                    !refundReason.trim() ||
                    parseFloat(refundAmount) <= 0 ||
                    parseFloat(refundAmount) > selectedTransaction.amount
                  }
                  className="flex-1"
                  variant="outline"
                >
                  {loading === "refund" ? (
                    <>
                      <ApperIcon name="Loader2" size={14} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="RefreshCcw" size={14} className="mr-2" />
                      Process Refund
                    </>
                  )}
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