import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"

const VirtualCardCreator = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    purpose: "",
    spendingLimit: "",
    walletId: 1 // Default to primary wallet
  })

  const purposes = [
    {
      id: "online-shopping",
      label: "Online Shopping",
      description: "For e-commerce and online purchases",
      icon: "ShoppingBag",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "subscription",
      label: "Subscriptions",
      description: "For recurring monthly/yearly services",
      icon: "RefreshCw",
      color: "from-green-500 to-green-600"
    },
    {
      id: "one-time",
      label: "One-time Use",
      description: "For single transactions or trials",
      icon: "Zap",
      color: "from-orange-500 to-orange-600"
    }
  ]

  const spendingLimits = [
    { value: "50", label: "$50" },
    { value: "100", label: "$100" },
    { value: "250", label: "$250" },
    { value: "500", label: "$500" },
    { value: "1000", label: "$1,000" },
    { value: "custom", label: "Custom" }
  ]

  const handlePurposeSelect = (purpose) => {
    setFormData({ ...formData, purpose })
    setStep(2)
  }

  const handleSpendingLimitSelect = (limit) => {
    if (limit === "custom") {
      setFormData({ ...formData, spendingLimit: "" })
    } else {
      setFormData({ ...formData, spendingLimit: limit })
      handleCreateCard({ ...formData, spendingLimit: limit })
    }
  }

  const handleCustomLimitSubmit = () => {
    if (!formData.spendingLimit || parseFloat(formData.spendingLimit) <= 0) {
      toast.error("Please enter a valid spending limit")
      return
    }
    handleCreateCard(formData)
  }

  const handleCreateCard = async (data) => {
    try {
      setLoading(true)
      await onSuccess(data)
      // Reset form
      setFormData({ purpose: "", spendingLimit: "", walletId: 1 })
      setStep(1)
    } catch (error) {
      toast.error("Failed to create virtual card")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleClose = () => {
    setStep(1)
    setFormData({ purpose: "", spendingLimit: "", walletId: 1 })
    onClose()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card padding="lg" className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-2"
                >
                  <ApperIcon name="ArrowLeft" size={20} />
                </Button>
              )}
              <div>
                <h3 className="text-xl font-display font-semibold text-gray-900">
                  Create Virtual Card
                </h3>
                <p className="text-sm text-gray-600">
                  Step {step} of 2
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 2) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Purpose Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="font-display font-semibold text-gray-900 mb-2">
                    What will you use this card for?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Choose a purpose to help us set appropriate security settings.
                  </p>
                </div>

                <div className="space-y-3">
                  {purposes.map((purpose) => (
                    <motion.button
                      key={purpose.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePurposeSelect(purpose.id)}
                      className="w-full p-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${purpose.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <ApperIcon name={purpose.icon} size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {purpose.label}
                          </h5>
                          <p className="text-gray-600 text-sm">
                            {purpose.description}
                          </p>
                        </div>
                        <ApperIcon name="ChevronRight" size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Spending Limit */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="font-display font-semibold text-gray-900 mb-2">
                    Set spending limit
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Choose a spending limit to control your expenses.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {spendingLimits.map((limit) => (
                    <motion.button
                      key={limit.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSpendingLimitSelect(limit.value)}
                      disabled={loading}
                      className="p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 font-semibold text-gray-900 hover:text-primary disabled:opacity-50"
                    >
                      {limit.label}
                    </motion.button>
                  ))}
                </div>

                {formData.spendingLimit === "" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Input
                      type="number"
                      label="Custom Amount ($)"
                      placeholder="Enter custom amount"
                      value={formData.spendingLimit}
                      onChange={(e) => setFormData({ ...formData, spendingLimit: e.target.value })}
                      min="1"
                      step="0.01"
                    />
                    <Button
                      variant="primary"
                      onClick={handleCustomLimitSubmit}
                      disabled={loading || !formData.spendingLimit}
                      className="w-full"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <ApperIcon name="Loader2" size={16} />
                          </motion.div>
                          <span>Creating Card...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="CreditCard" size={16} />
                          <span>Create Card</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default VirtualCardCreator