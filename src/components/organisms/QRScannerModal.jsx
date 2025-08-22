import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Card from "@/components/atoms/Card"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import { walletService } from "@/services/api/walletService"

const QRScannerModal = ({ 
  isOpen, 
  onClose, 
  scannedData, 
  onPaymentComplete, 
  onCancel 
}) => {
  const [step, setStep] = useState(1) // 1: Review, 2: Confirm, 3: Processing
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Parse QR code data to extract payment information
  const parsePaymentData = () => {
    if (!scannedData) return null

    const { parsed } = scannedData
    
    // Handle different QR code formats
    if (parsed.merchantId) {
      return {
        type: 'merchant',
        merchantId: parsed.merchantId,
        merchantName: parsed.merchantName || 'Unknown Merchant',
        amount: parsed.amount || null,
        description: parsed.description || 'Payment to merchant'
      }
    } else if (parsed.walletId || parsed.userId) {
      return {
        type: 'p2p',
        walletId: parsed.walletId || parsed.userId,
        recipientName: parsed.name || 'Unknown User',
        amount: parsed.amount || null,
        description: parsed.description || 'P2P Transfer'
      }
    } else {
      // Generic payment QR
      return {
        type: 'generic',
        data: parsed.data || scannedData.raw,
        amount: parsed.amount || null,
        description: 'QR Code Payment'
      }
    }
  }

  const paymentData = parsePaymentData()

  const formatAmount = (value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numValue)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount")
        return
      }
      setStep(2)
    } else if (step === 2) {
      handleProcessPayment()
    }
  }

  const handleProcessPayment = async () => {
    try {
      setStep(3)
      setLoading(true)
      setError("")

      // Get primary wallet
      const wallets = await walletService.getAll()
      const primaryWallet = wallets.find(w => w.isPrimary)
      
      if (!primaryWallet) {
        throw new Error("No primary wallet found")
      }

      if (primaryWallet.balance < parseFloat(amount)) {
        throw new Error("Insufficient funds")
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create transaction record
      const transactionData = {
        type: paymentData.type === 'merchant' ? 'merchant_payment' : 'qr_payment',
        amount: parseFloat(amount),
        description: paymentData.description,
        recipientId: paymentData.merchantId || paymentData.walletId,
        recipientName: paymentData.merchantName || paymentData.recipientName,
        qrData: scannedData.raw
      }

      // Update wallet balance
      await walletService.update(primaryWallet.Id, {
        balance: primaryWallet.balance - parseFloat(amount)
      })

      toast.success("Payment completed successfully!")
      onPaymentComplete()
    } catch (err) {
      console.error("Payment failed:", err)
      setError(err.message || "Payment failed")
      toast.error(err.message || "Payment failed")
      setStep(2) // Go back to confirm step
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  if (!isOpen || !paymentData) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={step < 3 ? onClose : undefined}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <Card variant="elevated" padding="lg" className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {step > 1 && step < 3 && (
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    <ApperIcon name="ArrowLeft" size={18} />
                  </Button>
                )}
                <h2 className="text-xl font-display font-semibold text-gray-900">
                  {step === 1 && "Review Payment"}
                  {step === 2 && "Confirm Payment"}
                  {step === 3 && "Processing..."}
                </h2>
              </div>
              
              {step < 3 && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ApperIcon name="X" size={18} />
                </Button>
              )}
            </div>

            {/* Step 1: Review Payment */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* QR Code Info */}
                <Card variant="default" padding="default" className="bg-gray-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <ApperIcon 
                        name={paymentData.type === 'merchant' ? 'Store' : 'User'} 
                        size={24} 
                        className="text-primary" 
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {paymentData.merchantName || paymentData.recipientName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {paymentData.type === 'merchant' ? 'Merchant Payment' : 'P2P Transfer'}
                      </p>
                    </div>
                  </div>
                  
                  {paymentData.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {paymentData.description}
                    </p>
                  )}
                </Card>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Amount {paymentData.amount && `(Suggested: ${formatAmount(paymentData.amount)})`}
                  </label>
                  
                  <div className="text-center py-4">
                    <div className="text-3xl font-display font-bold text-gray-900 mb-2">
                      {formatAmount(amount || paymentData.amount || 0)}
                    </div>
                    
                    <Input
                      type="number"
                      placeholder={paymentData.amount || "0.00"}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-center text-xl font-semibold border-0 bg-transparent focus:ring-0 focus:border-0"
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    {[10, 25, 50].map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(preset.toString())}
                      >
                        ${preset}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirm Payment */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ApperIcon name="CreditCard" size={32} className="text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                    {formatAmount(amount)}
                  </h3>
                  
                  <p className="text-gray-600">
                    Payment to {paymentData.merchantName || paymentData.recipientName}
                  </p>
                </div>

                {/* Transaction Summary */}
                <Card variant="default" padding="default" className="bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatAmount(amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">To</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paymentData.merchantName || paymentData.recipientName}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fee</span>
                      <span className="text-sm font-semibold text-success">
                        Free
                      </span>
                    </div>
                    
                    <hr className="border-gray-200" />
                    
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-base font-bold text-gray-900">
                        {formatAmount(amount)}
                      </span>
                    </div>
                  </div>
                </Card>

                {error && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                    <p className="text-error text-sm">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1"
                  >
                    Pay Now
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                  Processing Payment
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Please wait while we process your payment...
                </p>
                
                <div className="text-2xl font-display font-bold text-primary">
                  {formatAmount(amount)}
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QRScannerModal