import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useSearchParams } from "react-router-dom"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import VirtualCard from "@/components/molecules/VirtualCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { virtualCardService } from "@/services/api/virtualCardService"
import { walletService } from "@/services/api/walletService"
import { toast } from "react-toastify"

const CheckoutPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Get checkout parameters from URL
  const merchant = searchParams.get("merchant") || "Online Store"
  const amount = parseFloat(searchParams.get("amount")) || 0
  const currency = searchParams.get("currency") || "USD"
  const orderId = searchParams.get("orderId") || `ORDER-${Date.now()}`
  
  const [virtualCards, setVirtualCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1) // 1: Card Selection, 2: Confirmation, 3: Processing, 4: Success

  useEffect(() => {
    loadVirtualCards()
  }, [])

  const loadVirtualCards = async () => {
    try {
      setLoading(true)
      setError(null)
      const cards = await virtualCardService.getAll()
      // Only show active cards with available balance
      const availableCards = cards.filter(card => 
        card.isActive && 
        virtualCardService.getRemainingBalance(card) >= amount
      )
      setVirtualCards(availableCards)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load payment methods")
    } finally {
      setLoading(false)
    }
  }

  const handleCardSelect = (card) => {
    setSelectedCard(card)
    setStep(2)
  }

  const handleProcessPayment = async () => {
    if (!selectedCard) {
      toast.error("Please select a payment method")
      return
    }

    try {
      setProcessing(true)
      setStep(3)

      // Process the payment
      const result = await virtualCardService.processPayment(selectedCard.Id, {
        amount,
        merchant,
        orderId,
        currency
      })

      // Update local card state
      setVirtualCards(prev => prev.map(card => 
        card.Id === selectedCard.Id ? result.card : card
      ))

      // Show success
      setStep(4)
      toast.success("Payment processed successfully!")

      // Auto-redirect after success
      setTimeout(() => {
        navigate("/virtual-cards")
      }, 3000)

    } catch (error) {
      setStep(2)
      toast.error(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate(-1)
    }
  }

  if (loading) {
    return <Loading message="Loading payment methods..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadVirtualCards} />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
              disabled={processing}
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Checkout
              </h1>
              <p className="text-gray-600 mt-1">
                Complete your payment securely
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 space-y-6">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="default">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-gray-900">Order Summary</h3>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ApperIcon name="ShoppingBag" size={24} className="text-primary" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Merchant</span>
                <span className="font-medium text-gray-900">{merchant}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-sm text-gray-700">{orderId}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-display font-bold text-primary">
                    {currency === "USD" ? "$" : ""}{amount.toFixed(2)} {currency !== "USD" ? currency : ""}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Card Selection */}
          {step === 1 && (
            <motion.div
              key="card-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card padding="default">
                <h3 className="font-display font-semibold text-gray-900 mb-4">
                  Select Payment Method
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Choose a virtual card with sufficient balance for this purchase.
                </p>

                {virtualCards.length > 0 ? (
                  <div className="space-y-4">
                    {virtualCards.map((card) => (
                      <motion.div
                        key={card.Id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCardSelect(card)}
                        className="cursor-pointer"
                      >
                        <div className="relative">
                          <VirtualCard card={card} />
                          <div className="absolute inset-0 rounded-xl border-2 border-transparent hover:border-primary/50 transition-colors" />
                          
                          {/* Available Balance Indicator */}
                          <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg">
                            <p className="text-xs text-gray-600">Available</p>
                            <p className="font-bold text-success">
                              ${virtualCardService.getRemainingBalance(card).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <ApperIcon name="CreditCard" size={32} className="text-gray-400" />
                    </motion.div>
                    
                    <h4 className="text-xl font-display font-semibold text-gray-900 mb-2">
                      No Cards Available
                    </h4>
                    <p className="text-gray-600 mb-6">
                      You don't have any virtual cards with sufficient balance for this purchase.
                    </p>
                    
                    <Button
                      variant="primary"
                      onClick={() => navigate("/virtual-cards")}
                      className="flex items-center space-x-2 mx-auto"
                    >
                      <ApperIcon name="Plus" size={20} />
                      <span>Create Virtual Card</span>
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Step 2: Payment Confirmation */}
          {step === 2 && selectedCard && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card padding="default">
                <h3 className="font-display font-semibold text-gray-900 mb-4">
                  Confirm Payment
                </h3>
                
                <div className="space-y-6">
                  {/* Selected Card */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                          <ApperIcon name="CreditCard" size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            **** **** **** {selectedCard.cardNumber.slice(-4)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedCard.purpose} • Expires {selectedCard.expiryDate}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Available Balance</span>
                          <span className="font-semibold text-success">
                            ${virtualCardService.getRemainingBalance(selectedCard).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">After Payment</span>
                          <span className="font-semibold text-gray-900">
                            ${(virtualCardService.getRemainingBalance(selectedCard) - amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Transaction Details</h4>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Processing Fee</span>
                        <span className="font-semibold text-gray-900">$0.00</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-display font-bold text-primary">
                            ${amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleProcessPayment}
                    disabled={processing}
                    className="w-full text-lg py-4"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ApperIcon name="Lock" size={20} />
                      <span>Pay ${amount.toFixed(2)}</span>
                    </div>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card padding="lg" className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-6"
                />
                
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                  Processing Payment
                </h3>
                <p className="text-gray-600">
                  Please wait while we securely process your transaction...
                </p>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card padding="lg" className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <ApperIcon name="Check" size={32} className="text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your payment of ${amount.toFixed(2)} has been processed successfully.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono text-sm text-gray-900">{orderId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Merchant</span>
                      <span className="font-medium text-gray-900">{merchant}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/history")}
                    className="flex-1"
                  >
                    View Receipt
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/virtual-cards")}
                    className="flex-1"
                  >
                    Back to Cards
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CheckoutPage