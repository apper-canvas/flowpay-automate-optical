import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import BalanceCard from "@/components/molecules/BalanceCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { walletService } from "@/services/api/walletService"

const WalletBalance = ({ onPrimaryWalletUpdate }) => {
  const [primaryWallet, setPrimaryWallet] = useState(null)
  const [secondaryWallets, setSecondaryWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadWallets = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [primary, secondary] = await Promise.all([
        walletService.getPrimaryWallet(),
        walletService.getSecondaryWallets()
      ])
      
      setPrimaryWallet(primary)
      setSecondaryWallets(secondary)
      
      if (onPrimaryWalletUpdate) {
        onPrimaryWalletUpdate(primary)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWallets()
  }, [])

  if (loading) {
    return <Loading type="balance" />
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadWallets}
        title="Failed to load wallets"
      />
    )
  }

  if (!primaryWallet && secondaryWallets.length === 0) {
    return (
      <Empty
        title="No wallets found"
        message="Add your first wallet to get started with FlowPay."
        icon="Wallet"
        actionLabel="Add Wallet"
        onAction={loadWallets}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Primary Wallet */}
      {primaryWallet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BalanceCard 
            wallet={primaryWallet} 
            isPrimary={true}
          />
        </motion.div>
      )}

      {/* Secondary Wallets */}
      {secondaryWallets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-display font-semibold text-gray-900">
            Other Currencies
          </h3>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 scroll-smooth">
            {secondaryWallets.map((wallet, index) => (
              <motion.div
                key={wallet.Id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <BalanceCard wallet={wallet} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default WalletBalance