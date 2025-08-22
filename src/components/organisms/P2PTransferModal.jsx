import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Card from "@/components/atoms/Card"
import ContactPicker from "@/components/molecules/ContactPicker"
import FundingSourceCard from "@/components/molecules/FundingSourceCard"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { walletService } from "@/services/api/walletService"
import { contactService } from "@/services/api/contactService"

const P2PTransferModal = ({ isOpen, onClose, primaryWallet, onSuccess }) => {
  const [step, setStep] = useState(1) // 1: Select recipient, 2: Enter amount, 3: Select payment method, 4: Confirm
  const [selectedContact, setSelectedContact] = useState(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [fundingSources, setFundingSources] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sourcesLoading, setSourcesLoading] = useState(false)
  const [error, setError] = useState("")

  const loadFundingSources = async () => {
    try {
      setSourcesLoading(true)
      setError("")
      
      const sources = await walletService.getFundingSources()
      setFundingSources(sources)
      
      // Auto-select default source
      const defaultSource = sources.find(s => s.isDefault)
      if (defaultSource) {
        setSelectedPaymentMethod(defaultSource)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSourcesLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (step === 3 && fundingSources.length === 0) {
        loadFundingSources()
      }
    } else {
      // Reset state when modal closes
      setStep(1)
      setSelectedContact(null)
      setAmount("")
      setNote("")
      setSelectedPaymentMethod(null)
      setError("")
    }
  }, [isOpen, step])

  const handleNext = () => {
    if (step === 1 && selectedContact) {
      setStep(2)
    } else if (step === 2 && amount && parseFloat(amount) > 0) {
      setStep(3)
    } else if (step === 3 && selectedPaymentMethod) {
      setStep(4)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleConfirm = async () => {
    if (!selectedContact || !amount || !selectedPaymentMethod || !primaryWallet) return

    try {
      setLoading(true)
      
      const result = await walletService.sendP2PTransfer({
        fromWalletId: primaryWallet.Id,
        toContactId: selectedContact.Id,
        amount: parseFloat(amount),
        paymentMethodId: selectedPaymentMethod.Id,
        note: note.trim()
      })
      
      // Update contact frequency
      await contactService.updateContactFrequency(selectedContact.Id)
      
      toast.success(`$${amount} sent to ${selectedContact.name}!`)
      
      if (onSuccess) {
        onSuccess(result.wallet, result.transaction)
      }
      
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numValue)
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Send to"
      case 2: return "Enter amount"
      case 3: return "Payment method"
      case 4: return "Confirm transfer"
      default: return "Send Money"
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <Card variant="elevated" padding="lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {step > 1 && (
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    <ApperIcon name="ArrowLeft" size={18} />
                  </Button>
                )}
                <h2 className="text-xl font-display font-semibold text-gray-900">
                  {getStepTitle()}
                </h2>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ApperIcon name="X" size={18} />
              </Button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center space-x-2 mb-6">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex-1 h-2 rounded-full ${
                    stepNumber <= step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Select Recipient */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose who you'd like to send money to.
                  </p>
                </div>

                <ContactPicker
                  onSelect={setSelectedContact}
                  selectedContact={selectedContact}
                />

                <Button 
                  onClick={handleNext}
                  disabled={!selectedContact}
                  className="w-full"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Enter Amount */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <p className="text-sm text-gray-600">
                    How much would you like to send to {selectedContact?.name}?
                  </p>
                </div>

                <div className="text-center py-6">
                  <div className="text-4xl font-display font-bold text-gray-900 mb-2">
                    {formatAmount(amount)}
                  </div>
                  
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-center text-2xl font-semibold border-0 bg-transparent focus:ring-0 focus:border-0"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[25, 50, 100].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      onClick={() => setAmount(preset.toString())}
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>

                <Input
                  placeholder="Add a note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full"
                />

                <Button 
                  onClick={handleNext}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 3: Select Payment Method */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose how you'd like to fund this transfer.
                  </p>
                </div>

                {sourcesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : error ? (
                  <Error message={error} onRetry={loadFundingSources} />
                ) : (
                  <div className="space-y-3">
                    {fundingSources.map((source) => (
                      <FundingSourceCard
                        key={source.Id}
                        fundingSource={source}
                        isSelected={selectedPaymentMethod?.Id === source.Id}
                        onClick={setSelectedPaymentMethod}
                      />
                    ))}
                  </div>
                )}

                <Button 
                  onClick={handleNext}
                  disabled={!selectedPaymentMethod}
                  className="w-full"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <p className="text-sm text-gray-600">
                    Please review your transfer details.
                  </p>
                </div>

                <Card variant="default" padding="default" className="bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">To</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                          {selectedContact?.avatar ? (
                            <img 
                              src={selectedContact.avatar} 
                              alt={selectedContact.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <ApperIcon name="User" size={12} className="text-primary" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedContact?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatAmount(amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">From</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {selectedPaymentMethod?.name} ••••{selectedPaymentMethod?.lastFour}
                      </span>
                    </div>
                    
                    {note && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Note</span>
                        <span className="text-sm font-semibold text-gray-900 max-w-[150px] text-right">
                          {note}
                        </span>
                      </div>
                    )}
                    
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

                <Button 
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Confirm & Send"
                  )}
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default P2PTransferModal