import { useState } from "react"
import { motion } from "framer-motion"
import WalletBalance from "@/components/organisms/WalletBalance"
import QuickActions from "@/components/organisms/QuickActions"
import RecentActivity from "@/components/organisms/RecentActivity"
import AddMoneyModal from "@/components/organisms/AddMoneyModal"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"

const WalletPage = () => {
  const [primaryWallet, setPrimaryWallet] = useState(null)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAddMoneySuccess = (updatedWallet, transaction) => {
    setPrimaryWallet(updatedWallet)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSend = () => {
    toast.info("Send feature coming soon!")
  }

  const handleRequest = () => {
    toast.info("Request feature coming soon!")
  }

  const handleScan = () => {
    toast.info("QR scan feature coming soon!")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Good morning! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your digital money
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-surface border border-gray-200 flex items-center justify-center"
            >
              <ApperIcon name="Bell" size={20} className="text-gray-600" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center"
            >
              <ApperIcon name="User" size={20} className="text-white" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-8">
        {/* Wallet Balance */}
        <WalletBalance onPrimaryWalletUpdate={setPrimaryWallet} />
        
        {/* Quick Actions */}
        <QuickActions
          onAddMoney={() => setShowAddMoneyModal(true)}
          onSend={handleSend}
          onRequest={handleRequest}
          onScan={handleScan}
        />
        
        {/* Recent Activity */}
        <RecentActivity refreshTrigger={refreshTrigger} />
      </div>

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        primaryWallet={primaryWallet}
        onSuccess={handleAddMoneySuccess}
      />
    </div>
  )
}

export default WalletPage