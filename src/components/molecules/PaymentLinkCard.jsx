import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import { businessService } from "@/services/api/businessService"

const PaymentLinkCard = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    expiryHours: "24"
  })
  const [paymentLink, setPaymentLink] = useState(null)
  const [loading, setLoading] = useState(false)

  const createPaymentLink = async () => {
    try {
      setLoading(true)
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        toast.error("Please enter a valid amount")
        return
      }

      const link = await businessService.createPaymentLink(
        formData.amount,
        formData.description || "Payment Request",
        parseInt(formData.expiryHours)
      )

      setPaymentLink(link)
      toast.success("Payment link created successfully!")
    } catch (error) {
      toast.error(error.message || "Failed to create payment link")
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (!paymentLink) return

    try {
      await navigator.clipboard.writeText(paymentLink.url)
      toast.success("Payment link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const shareLink = async () => {
    if (!paymentLink) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Payment Request',
          text: `Payment of $${formData.amount} - ${formData.description}`,
          url: paymentLink.url
        })
      } else {
        await copyLink()
      }
    } catch (error) {
      toast.error("Failed to share link")
    }
  }

  const formatExpiryTime = () => {
    if (!paymentLink) return ""
    const expiryDate = new Date(paymentLink.expiresAt)
    return expiryDate.toLocaleString()
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
          <ApperIcon name="Link" size={24} className="text-success" />
        </div>
        <div>
          <h3 className="text-xl font-display font-semibold text-gray-900">
            Payment Link Creator
          </h3>
          <p className="text-gray-600 text-sm">
            Create shareable payment links with QR codes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-4">
          <Input
            label="Payment Amount ($)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            placeholder="0.00"
            step="0.01"
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Payment for..."
          />

          <Input
            label="Expiry Time (hours)"
            type="number"
            value={formData.expiryHours}
            onChange={(e) => setFormData({...formData, expiryHours: e.target.value})}
            placeholder="24"
            min="1"
            max="168"
          />

          <Button
            onClick={createPaymentLink}
            disabled={loading || !formData.amount}
            className="w-full"
            variant="success"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Creating...
              </>
            ) : (
              <>
                <ApperIcon name="Link" size={16} className="mr-2" />
                Create Payment Link
              </>
            )}
          </Button>
        </div>

        {/* Link Display */}
        <div className="flex flex-col">
          {paymentLink ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Link Preview */}
              <Card variant="default" padding="default" className="bg-gray-50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Payment Amount</span>
                    <span className="text-lg font-display font-bold text-success">
                      ${formData.amount}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Description</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.description || "Payment Request"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expires</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatExpiryTime()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      Active
                    </span>
                  </div>
                </div>
              </Card>

              {/* Generated Link */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Link
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={paymentLink.url}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                  >
                    <ApperIcon name="Copy" size={16} />
                  </Button>
                </div>
              </div>

              {/* Mini QR Code */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-24 h-24 bg-black relative">
                    <div className="absolute inset-1 bg-white"></div>
                    <div className="absolute top-2 left-2 w-4 h-4 bg-black"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-black"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 bg-black"></div>
                    
                    {Array.from({ length: 36 }, (_, i) => {
                      const row = Math.floor(i / 6)
                      const col = i % 6
                      const shouldShow = (row + col) % 2 === 0
                      return shouldShow ? (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-black"
                          style={{
                            left: `${8 + col * 12}px`,
                            top: `${8 + row * 12}px`
                          }}
                        />
                      ) : null
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-600">Scan to pay</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={shareLink}
                  className="flex-1"
                >
                  <ApperIcon name="Share2" size={16} className="mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPaymentLink(null)}
                  className="flex-1"
                >
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  New Link
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 py-12 flex-1 flex flex-col items-center justify-center">
              <ApperIcon name="Link" size={48} className="mx-auto mb-4 opacity-30" />
              <p>Payment link will be generated here</p>
              <p className="text-sm">Complete the form to create a link</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default PaymentLinkCard