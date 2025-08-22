import { motion } from "framer-motion";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const BalanceCard = ({ wallet, isPrimary = false, onClick }) => {
  const formatBalance = (balance, currency) => {
    if (currency === "BTC" || currency === "ETH") {
      return balance.toFixed(8)
    }
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance)
  }

  const getChangeColor = (change) => {
    if (change > 0) return "text-success"
    if (change < 0) return "text-error"
    return "text-gray-500"
  }

  const getChangeIcon = (change) => {
    if (change > 0) return "TrendingUp"
    if (change < 0) return "TrendingDown"
    return "Minus"
  }

  if (isPrimary) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        <Card variant="gradient" padding="lg" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-white/80 text-sm font-medium">Total Balance</span>
                {isPrimary && (
                  <Badge variant="default" className="bg-white/20 text-white text-xs">
                    Primary
                  </Badge>
                )}
              </div>
              <ApperIcon name="Eye" size={20} className="text-white/60" />
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-display font-bold text-white">
                  {wallet.symbol}
                </span>
                <motion.span 
                  key={wallet.balance}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-display font-bold text-white animate-number"
                >
                  {formatBalance(wallet.balance, wallet.currency)}
                </motion.span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ApperIcon 
                  name={getChangeIcon(wallet.change24h)} 
                  size={16} 
                  className="text-white/80" 
                />
                <span className="text-white/80 text-sm font-medium">
                  {wallet.change24h > 0 ? "+" : ""}{wallet.change24h}% (24h)
                </span>
</div>
            </div>
            
            {/* Optional spending alert indicator */}
            {wallet.hasSpendingAlert && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-warning rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer min-w-[160px]"
    >
      <Card padding="default" className="h-full hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {wallet.currency}
          </span>
          <div className={`flex items-center space-x-1 ${getChangeColor(wallet.change24h)}`}>
            <ApperIcon name={getChangeIcon(wallet.change24h)} size={12} />
            <span className="text-xs font-medium">
              {wallet.change24h > 0 ? "+" : ""}{wallet.change24h}%
            </span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-display font-bold text-gray-900">
              {wallet.symbol}
            </span>
            <motion.span 
              key={wallet.balance}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-display font-bold text-gray-900 animate-number"
            >
              {formatBalance(wallet.balance, wallet.currency)}
            </motion.span>
          </div>
          <p className="text-xs text-gray-500">{wallet.name}</p>
        </div>
      </Card>
    </motion.div>
  )
}

export default BalanceCard