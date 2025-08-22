import { useState } from "react"
import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import { virtualCardService } from "@/services/api/virtualCardService"

const VirtualCard = ({ card, onUpdate, onDelete }) => {
  const [showSensitive, setShowSensitive] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)

  const handleReveal = () => {
    setIsRevealing(true)
    setShowSensitive(true)
    setTimeout(() => setIsRevealing(false), 300)
  }

  const handleHide = () => {
    setShowSensitive(false)
  }

  const formatCardNumber = (number) => {
    if (showSensitive) {
      return number
    }
    return number.replace(/\d(?=\d{4})/g, "*")
  }

  const formatCVV = (cvv) => {
    return showSensitive ? cvv : "***"
  }

  const getPurposeLabel = (purpose) => {
    switch (purpose) {
      case "online-shopping":
        return "Online Shopping"
      case "subscription":
        return "Subscriptions"
      case "one-time":
        return "One-time Use"
      default:
        return "General"
    }
  }

  const getPurposeColor = (purpose) => {
    switch (purpose) {
      case "online-shopping":
        return "bg-blue-100 text-blue-700"
      case "subscription":
        return "bg-green-100 text-green-700"
      case "one-time":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const spendingProgress = virtualCardService.getSpendingProgress(card)
  const remainingBalance = virtualCardService.getRemainingBalance(card)

  const getProgressColor = () => {
    if (spendingProgress >= 90) return "bg-error"
    if (spendingProgress >= 70) return "bg-warning"
    return "bg-success"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card 
        variant="gradient" 
        padding="lg" 
        className="relative overflow-hidden min-h-[200px]"
      >
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={`${getPurposeColor(card.purpose)} text-xs font-medium`}>
                {getPurposeLabel(card.purpose)}
              </Badge>
              <Badge 
                className={`text-xs font-medium ${card.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
                }`}
              >
                {card.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={showSensitive ? handleHide : handleReveal}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2"
              >
                <ApperIcon 
                  name={showSensitive ? "EyeOff" : "Eye"} 
                  size={16} 
                />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(card.Id)}
                  className="text-white/80 hover:text-white hover:bg-red-500/20 p-2"
                >
                  <ApperIcon name="Trash2" size={16} />
                </Button>
              )}
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <motion.div
              animate={{ scale: isRevealing ? 1.05 : 1 }}
              className="text-2xl font-mono font-bold text-white tracking-wider"
            >
              {formatCardNumber(card.cardNumber)}
            </motion.div>
          </div>

          {/* Card Details */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white/60 text-xs uppercase tracking-wide">
                Valid Thru
              </p>
              <p className="text-white font-mono text-lg">
                {card.expiryDate}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-white/60 text-xs uppercase tracking-wide">
                CVV
              </p>
              <motion.p
                animate={{ scale: isRevealing ? 1.05 : 1 }}
                className="text-white font-mono text-lg"
              >
                {formatCVV(card.cvv)}
              </motion.p>
            </div>
          </div>

          {/* Spending Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white/80">
              <span className="text-sm">
                Spent: {card.currency} {card.currentSpending.toFixed(2)}
              </span>
              <span className="text-sm">
                Limit: {card.currency} {card.spendingLimit.toFixed(2)}
              </span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${spendingProgress}%` }}
                className={`h-2 rounded-full ${getProgressColor()}`}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span>
                Remaining: {card.currency} {remainingBalance.toFixed(2)}
              </span>
              <span>
                {spendingProgress.toFixed(1)}% used
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default VirtualCard