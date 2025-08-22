import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import TransactionRow from "@/components/molecules/TransactionRow"
import Loading from "@/components/ui/Loading"
import { virtualCardService } from "@/services/api/virtualCardService"
import { toast } from "react-toastify"

const VirtualCardDetailsModal = ({ 
  isOpen, 
  onClose, 
  card: initialCard,
  onUpdate,
  onDelete 
}) => {
  const [card, setCard] = useState(initialCard || null)
  const [activeTab, setActiveTab] = useState("details")
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [spendingLimit, setSpendingLimit] = useState(card?.spendingLimit || 0)
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false)

  useEffect(() => {
    if (initialCard) {
      setCard(initialCard)
      setSpendingLimit(initialCard.spendingLimit)
    }
  }, [initialCard])

  useEffect(() => {
    if (isOpen && card && activeTab === "transactions") {
      loadTransactions()
    }
  }, [isOpen, card, activeTab])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const cardTransactions = await virtualCardService.getTransactionHistory(card.Id)
      setTransactions(cardTransactions)
    } catch (error) {
      toast.error("Failed to load transaction history")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFreeze = async () => {
    try {
      const updatedCard = await virtualCardService.toggleFreeze(card.Id)
      setCard(updatedCard)
      onUpdate?.(updatedCard)
      toast.success(`Card ${updatedCard.isFrozen ? 'frozen' : 'unfrozen'} successfully`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUpdateSpendingLimit = async () => {
    try {
      setIsUpdatingLimit(true)
      const updatedCard = await virtualCardService.updateSpendingLimit(card.Id, spendingLimit)
      setCard(updatedCard)
      onUpdate?.(updatedCard)
      toast.success("Spending limit updated successfully")
    } catch (error) {
      toast.error(error.message)
      setSpendingLimit(card.spendingLimit) // Reset to original value
    } finally {
      setIsUpdatingLimit(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this virtual card? This action cannot be undone.")) {
      onDelete?.(card.Id)
      onClose()
    }
  }

  const formatCardNumber = (number) => {
    return number.replace(/\d(?=\d{4})/g, "*")
  }

  const getPurposeLabel = (purpose) => {
    switch (purpose) {
      case "online-shopping": return "Online Shopping"
      case "subscription": return "Subscriptions"
      case "one-time": return "One-time Use"
      default: return "General"
    }
  }

  const tabs = [
    { id: "details", label: "Card Details", icon: "CreditCard" },
    { id: "transactions", label: "Transactions", icon: "Receipt" },
    { id: "settings", label: "Settings", icon: "Settings" }
  ]

  if (!isOpen || !card) return null

  const spendingProgress = virtualCardService.getSpendingProgress(card)
  const remainingBalance = virtualCardService.getRemainingBalance(card)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-display font-bold text-gray-900">
                  Card Management
                </h3>
                <Badge className={`text-xs font-medium ${
                  card.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {card.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {card.isFrozen && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs font-medium">
                    Frozen
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Card Display */}
                <Card variant="gradient" padding="lg" className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/20 text-white text-xs font-medium">
                        {getPurposeLabel(card.purpose)}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={card.isFrozen ? "success" : "warning"}
                          size="sm"
                          onClick={handleToggleFreeze}
                          className="text-xs"
                        >
                          {card.isFrozen ? (
                            <>
                              <ApperIcon name="Play" size={14} className="mr-1" />
                              Unfreeze
                            </>
                          ) : (
                            <>
                              <ApperIcon name="Pause" size={14} className="mr-1" />
                              Freeze
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="text-2xl font-mono font-bold text-white tracking-wider">
                      {formatCardNumber(card.cardNumber)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wide">Valid Thru</p>
                        <p className="text-white font-mono text-lg">{card.expiryDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-xs uppercase tracking-wide">CVV</p>
                        <p className="text-white font-mono text-lg">***</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Spending Overview */}
                <Card padding="default">
                  <h4 className="font-display font-semibold text-gray-900 mb-4">
                    Spending Overview
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Spending</span>
                      <span className="font-medium">${card.currentSpending.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Spending Limit</span>
                      <span className="font-medium">${card.spendingLimit.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          spendingProgress >= 90 ? 'bg-error' :
                          spendingProgress >= 70 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(spendingProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-medium text-success">
                        ${remainingBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-gray-900">
                    Transaction History
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadTransactions}
                    disabled={loading}
                  >
                    <ApperIcon name="RefreshCw" size={16} />
                  </Button>
                </div>

                {loading ? (
                  <div className="py-12">
                    <Loading message="Loading transactions..." />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <TransactionRow
                        key={transaction.Id}
                        transaction={transaction}
                      />
                    ))}
                  </div>
                ) : (
                  <Card padding="lg" className="text-center">
                    <div className="py-8">
                      <ApperIcon name="Receipt" size={32} className="text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No transactions found for this card</p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Spending Limit */}
                <Card padding="default">
                  <h4 className="font-display font-semibold text-gray-900 mb-4">
                    Spending Limit
                  </h4>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      label="New Spending Limit"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(parseFloat(e.target.value) || 0)}
                      min={card.currentSpending}
                      step="0.01"
                    />
                    <Button
                      variant="primary"
                      onClick={handleUpdateSpendingLimit}
                      disabled={isUpdatingLimit || spendingLimit === card.spendingLimit}
                      className="w-full"
                    >
                      {isUpdatingLimit ? "Updating..." : "Update Spending Limit"}
                    </Button>
                  </div>
                </Card>

                {/* Danger Zone */}
                <Card padding="default" className="border-error/20">
                  <h4 className="font-display font-semibold text-error mb-4">
                    Danger Zone
                  </h4>
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      Once you delete a virtual card, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      className="w-full"
                    >
                      <ApperIcon name="Trash2" size={16} className="mr-2" />
                      Delete Virtual Card
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VirtualCardDetailsModal