import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { businessService } from "@/services/api/businessService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";

const BusinessQuickActions = ({ onActionComplete }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState("")
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)
  const [availableTransactions, setAvailableTransactions] = useState([])
  const [searchingTransaction, setSearchingTransaction] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  
  const [refundForm, setRefundForm] = useState({
    transactionId: "",
    amount: "",
    reason: ""
  })
  
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    customerEmail: "",
    amount: "",
    description: "",
    dueDate: ""
  })
  
  const [paymentLinkForm, setPaymentLinkForm] = useState({
    amount: "",
    description: "",
    expiryHours: "24"
  })

  const searchTransaction = async (transactionId) => {
    if (!transactionId) {
      setSelectedTransaction(null)
      return
    }
    
    try {
      setSearchingTransaction(true)
      const transactions = await businessService.getBusinessTransactions()
      const found = transactions.find(t => t.Id.toString() === transactionId.toString())
      
      if (found && found.refundable && found.status === "completed") {
        setSelectedTransaction(found)
        setRefundForm(prev => ({
          ...prev,
          amount: found.amount.toString()
        }))
      } else if (found && !found.refundable) {
        toast.error("This transaction is not refundable")
        setSelectedTransaction(null)
      } else if (found && found.status !== "completed") {
        toast.error("Only completed transactions can be refunded")
        setSelectedTransaction(null)
      } else {
        toast.error("Transaction not found")
        setSelectedTransaction(null)
      }
    } catch (error) {
      toast.error("Error searching for transaction")
      setSelectedTransaction(null)
    } finally {
      setSearchingTransaction(false)
    }
  }

  const handleRefund = async () => {
    if (!selectedTransaction) {
      toast.error("Please search and select a valid transaction first")
      return
    }
    
    if (!refundForm.amount || parseFloat(refundForm.amount) <= 0) {
      toast.error("Please enter a valid refund amount")
      return
    }
    
    if (parseFloat(refundForm.amount) > selectedTransaction.amount) {
      toast.error("Refund amount cannot exceed original transaction amount")
      return
    }
    
    if (!refundForm.reason.trim()) {
      toast.error("Please provide a reason for the refund")
      return
    }

    try {
      setLoading("refund")
      await businessService.processRefund(
        selectedTransaction.Id,
        refundForm.amount,
        refundForm.reason
      )
      toast.success(`Refund of $${refundForm.amount} processed successfully for ${selectedTransaction.customer}`)
      setShowRefundModal(false)
      setRefundForm({ transactionId: "", amount: "", reason: "" })
      setSelectedTransaction(null)
      onActionComplete?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading("")
    }
  }

  const handleGenerateInvoice = async () => {
    try {
      setLoading("invoice")
      const customerData = {
        name: invoiceForm.customerName,
        email: invoiceForm.customerEmail
      }
      const items = [{
        description: invoiceForm.description,
        quantity: 1,
        price: parseFloat(invoiceForm.amount)
      }]
      
      const invoice = await businessService.generateInvoice(
        customerData,
        items,
        invoiceForm.dueDate
      )
      
      toast.success(`Invoice ${invoice.Id} generated successfully`)
      setShowInvoiceModal(false)
      setInvoiceForm({
        customerName: "",
        customerEmail: "",
        amount: "",
        description: "",
        dueDate: ""
      })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading("")
    }
  }

  const handleCreatePaymentLink = async () => {
    try {
      setLoading("payment-link")
      const link = await businessService.createPaymentLink(
        paymentLinkForm.amount,
        paymentLinkForm.description,
        parseInt(paymentLinkForm.expiryHours)
      )
      
      // Copy link to clipboard
      await navigator.clipboard.writeText(link.url)
      toast.success("Payment link created and copied to clipboard")
      setShowPaymentLinkModal(false)
      setPaymentLinkForm({ amount: "", description: "", expiryHours: "24" })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading("")
    }
  }

  const handleDownloadReport = async (reportType) => {
    try {
      setLoading(`report-${reportType}`)
      const report = await businessService.downloadReport(reportType, {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      })
      
      toast.success(`${reportType} report generated successfully`)
      // In a real app, this would trigger a download
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading("")
    }
  }

  const quickActions = [
    {
      icon: "RefreshCcw",
      label: "Process Refund",
      color: "text-warning",
      bgColor: "bg-warning/10",
      onClick: () => setShowRefundModal(true)
    },
    {
      icon: "FileText",
      label: "Generate Invoice",
      color: "text-info",
      bgColor: "bg-info/10",
      onClick: () => setShowInvoiceModal(true)
    },
{
      icon: "Link",
      label: "Payment Link",
      color: "text-success",
      bgColor: "bg-success/10",
      onClick: () => navigate('/business/payment-links')
    },
    {
      icon: "Download",
      label: "Download Reports",
      color: "text-primary",
      bgColor: "bg-primary/10",
      onClick: () => handleDownloadReport("sales")
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-semibold text-gray-900">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              padding="default"
              className="hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={action.onClick}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center`}>
                  <ApperIcon name={action.icon} size={24} className={action.color} />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {action.label}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

{/* Enhanced Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" padding="lg">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                  Process Refund
                </h3>
                <p className="text-gray-600 text-sm">
                  Search for the original transaction and process a refund
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={refundForm.transactionId}
                      onChange={(e) => {
                        const value = e.target.value
                        setRefundForm({...refundForm, transactionId: value})
                        if (value.length >= 2) {
                          searchTransaction(value)
                        } else {
                          setSelectedTransaction(null)
                        }
                      }}
                      placeholder="Enter transaction ID (e.g., 101)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10"
                    />
                    {searchingTransaction && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <ApperIcon name="Loader2" size={16} className="animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedTransaction && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ApperIcon name="CheckCircle" size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">Transaction Found</span>
                    </div>
                    <div className="text-xs text-green-700 space-y-1">
                      <p><span className="font-medium">Customer:</span> {selectedTransaction.customer}</p>
                      <p><span className="font-medium">Amount:</span> ${selectedTransaction.amount}</p>
                      <p><span className="font-medium">Payment Method:</span> {selectedTransaction.paymentMethod}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedTransaction.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Input
                label="Refund Amount *"
                type="number"
                value={refundForm.amount}
                onChange={(e) => setRefundForm({...refundForm, amount: e.target.value})}
                placeholder="0.00"
                max={selectedTransaction?.amount}
                disabled={!selectedTransaction}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Refund *
                </label>
                <textarea
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({...refundForm, reason: e.target.value})}
                  placeholder="Provide a detailed reason for the refund..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  disabled={!selectedTransaction}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRefundModal(false)
                    setRefundForm({ transactionId: "", amount: "", reason: "" })
                    setSelectedTransaction(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={loading === "refund" || !selectedTransaction || !refundForm.amount || !refundForm.reason}
                  className="flex-1"
                >
                  {loading === "refund" ? "Processing..." : "Process Refund"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" padding="lg">
            <div className="space-y-4">
              <h3 className="text-lg font-display font-semibold text-gray-900">
                Generate Invoice
              </h3>
              
              <Input
                label="Customer Name"
                value={invoiceForm.customerName}
                onChange={(e) => setInvoiceForm({...invoiceForm, customerName: e.target.value})}
                placeholder="Enter customer name"
              />
              
              <Input
                label="Customer Email"
                type="email"
                value={invoiceForm.customerEmail}
                onChange={(e) => setInvoiceForm({...invoiceForm, customerEmail: e.target.value})}
                placeholder="customer@email.com"
              />
              
              <Input
                label="Amount"
                type="number"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                placeholder="0.00"
              />
              
              <Input
                label="Description"
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                placeholder="Invoice description"
              />
              
              <Input
                label="Due Date"
                type="date"
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
              />
              
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateInvoice}
                  disabled={loading === "invoice"}
                  className="flex-1"
                >
                  {loading === "invoice" ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Link Modal */}
      {showPaymentLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" padding="lg">
            <div className="space-y-4">
              <h3 className="text-lg font-display font-semibold text-gray-900">
                Create Payment Link
              </h3>
              
              <Input
                label="Amount"
                type="number"
                value={paymentLinkForm.amount}
                onChange={(e) => setPaymentLinkForm({...paymentLinkForm, amount: e.target.value})}
                placeholder="0.00"
              />
              
              <Input
                label="Description"
                value={paymentLinkForm.description}
                onChange={(e) => setPaymentLinkForm({...paymentLinkForm, description: e.target.value})}
                placeholder="Payment description"
              />
              
              <Input
                label="Expiry (hours)"
                type="number"
                value={paymentLinkForm.expiryHours}
                onChange={(e) => setPaymentLinkForm({...paymentLinkForm, expiryHours: e.target.value})}
                placeholder="24"
              />
              
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowPaymentLinkModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePaymentLink}
                  disabled={loading === "payment-link"}
                  className="flex-1"
                >
                  {loading === "payment-link" ? "Creating..." : "Create Link"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default BusinessQuickActions