import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import { businessService } from "@/services/api/businessService"

const InvoiceTemplateCard = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    itemDescription: "",
    itemQuantity: "1",
    itemPrice: "",
    dueDate: "",
    notes: ""
  })
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateInvoice = async () => {
    try {
      setLoading(true)
      
      if (!formData.customerName || !formData.customerEmail || !formData.itemPrice) {
        toast.error("Please fill in all required fields")
        return
      }

      const customerData = {
        name: formData.customerName,
        email: formData.customerEmail
      }

      const items = [{
        description: formData.itemDescription || "Service/Product",
        quantity: parseInt(formData.itemQuantity),
        price: parseFloat(formData.itemPrice)
      }]

      const invoiceData = await businessService.generateInvoice(
        customerData,
        items,
        formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      )

      setInvoice({
        ...invoiceData,
        notes: formData.notes
      })
      
      toast.success("Invoice generated successfully!")
    } catch (error) {
      toast.error(error.message || "Failed to generate invoice")
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = () => {
    if (!invoice) return

    // Simulate PDF download
    toast.success("Invoice PDF downloaded!")
    
    // In a real app, this would generate and download an actual PDF
    const link = document.createElement('a')
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Invoice ${invoice.Id}\nCustomer: ${invoice.customer.name}\nAmount: $${invoice.total}`)
    link.download = `invoice-${invoice.Id}.txt`
    link.click()
  }

  const sendInvoice = async () => {
    if (!invoice) return

    try {
      // Simulate sending invoice
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Invoice sent to ${invoice.customer.email}`)
    } catch (error) {
      toast.error("Failed to send invoice")
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const calculateTotal = () => {
    const quantity = parseInt(formData.itemQuantity) || 0
    const price = parseFloat(formData.itemPrice) || 0
    return quantity * price
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
          <ApperIcon name="FileText" size={24} className="text-info" />
        </div>
        <div>
          <h3 className="text-xl font-display font-semibold text-gray-900">
            Invoice Templates
          </h3>
          <p className="text-gray-600 text-sm">
            Generate professional invoices for your customers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name *"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              placeholder="John Doe"
            />
            
            <Input
              label="Customer Email *"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
              placeholder="john@example.com"
            />
          </div>

          <Input
            label="Item Description"
            value={formData.itemDescription}
            onChange={(e) => setFormData({...formData, itemDescription: e.target.value})}
            placeholder="Web development services"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              value={formData.itemQuantity}
              onChange={(e) => setFormData({...formData, itemQuantity: e.target.value})}
              placeholder="1"
              min="1"
            />
            
            <Input
              label="Unit Price ($) *"
              type="number"
              value={formData.itemPrice}
              onChange={(e) => setFormData({...formData, itemPrice: e.target.value})}
              placeholder="100.00"
              step="0.01"
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
          />

          <Input
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes or terms..."
          />

          {formData.itemPrice && formData.itemQuantity && (
            <Card variant="default" padding="sm" className="bg-blue-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                <span className="text-lg font-display font-bold text-info">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </Card>
          )}

          <Button
            onClick={generateInvoice}
            disabled={loading || !formData.customerName || !formData.customerEmail || !formData.itemPrice}
            className="w-full"
            variant="accent"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Generating...
              </>
            ) : (
              <>
                <ApperIcon name="FileText" size={16} className="mr-2" />
                Generate Invoice
              </>
            )}
          </Button>
        </div>

        {/* Invoice Preview */}
        <div className="flex flex-col">
          {invoice ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Invoice Preview */}
              <Card variant="default" padding="lg" className="bg-gray-50">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-display font-bold text-gray-900">INVOICE</h4>
                      <p className="text-sm text-gray-600">#{invoice.Id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">FlowPay Business</p>
                      <p className="text-sm text-gray-600">business@flowpay.com</p>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Bill To */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Bill To:</h5>
                    <p className="text-sm font-medium text-gray-900">{invoice.customer.name}</p>
                    <p className="text-sm text-gray-600">{invoice.customer.email}</p>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Invoice Date:</span>
                      <p className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date:</span>
                      <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-300">
                      <span>Description</span>
                      <span className="text-center">Qty</span>
                      <span className="text-center">Price</span>
                      <span className="text-right">Total</span>
                    </div>
                    {invoice.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 text-sm mb-2">
                        <span className="text-gray-900">{item.description}</span>
                        <span className="text-center text-gray-600">{item.quantity}</span>
                        <span className="text-center text-gray-600">{formatCurrency(item.price)}</span>
                        <span className="text-right font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <hr className="border-gray-200" />

                  {/* Total */}
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 mr-8">Subtotal:</span>
                        <span className="text-sm font-medium">{formatCurrency(invoice.total)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900 mr-8">Total:</span>
                        <span className="text-lg font-display font-bold text-info">
                          {formatCurrency(invoice.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-1">Notes:</h5>
                      <p className="text-sm text-gray-600">{invoice.notes}</p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                      Pending Payment
                    </span>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={downloadInvoice}
                  className="flex-1"
                >
                  <ApperIcon name="Download" size={16} className="mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="info"
                  onClick={sendInvoice}
                  className="flex-1"
                >
                  <ApperIcon name="Mail" size={16} className="mr-2" />
                  Send Invoice
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setInvoice(null)}
                className="w-full"
              >
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Create New Invoice
              </Button>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 py-12 flex-1 flex flex-col items-center justify-center">
              <ApperIcon name="FileText" size={48} className="mx-auto mb-4 opacity-30" />
              <p>Invoice preview will appear here</p>
              <p className="text-sm">Complete the form to generate an invoice</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default InvoiceTemplateCard