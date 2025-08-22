import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import VirtualCard from "@/components/molecules/VirtualCard"
import VirtualCardCreator from "@/components/organisms/VirtualCardCreator"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { virtualCardService } from "@/services/api/virtualCardService"
import { toast } from "react-toastify"

const VirtualCards = () => {
  const [virtualCards, setVirtualCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreator, setShowCreator] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadVirtualCards()
  }, [])

  const loadVirtualCards = async () => {
    try {
      setLoading(true)
      setError(null)
      const cards = await virtualCardService.getAll()
      setVirtualCards(cards)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load virtual cards")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCard = async (cardData) => {
    try {
      const newCard = await virtualCardService.create(cardData)
      setVirtualCards(prev => [newCard, ...prev])
      setShowCreator(false)
      toast.success("Virtual card created successfully!")
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteCard = async (cardId) => {
    if (window.confirm("Are you sure you want to delete this virtual card?")) {
      try {
        await virtualCardService.delete(cardId)
        setVirtualCards(prev => prev.filter(card => card.Id !== cardId))
        toast.success("Virtual card deleted successfully")
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  if (loading) {
    return <Loading message="Loading virtual cards..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadVirtualCards} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold text-gray-900">
            Virtual Cards
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Secure cards for online purchases
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/virtual-cards")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Settings" size={16} />
            <span>Manage</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreator(true)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={16} />
            <span>Create Card</span>
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      {virtualCards.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {virtualCards.slice(0, 2).map((card, index) => (
              <motion.div
                key={card.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <VirtualCard
                  card={card}
                  onDelete={handleDeleteCard}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {virtualCards.length > 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center pt-4"
            >
              <Button
                variant="ghost"
                onClick={() => navigate("/virtual-cards")}
                className="text-primary hover:text-primary/80"
              >
                View {virtualCards.length - 2} more cards
                <ApperIcon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </motion.div>
          )}
        </div>
      ) : (
        <Card padding="lg" className="text-center">
          <div className="py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <ApperIcon name="CreditCard" size={32} className="text-gray-400" />
            </motion.div>
            
            <h4 className="text-xl font-display font-semibold text-gray-900 mb-2">
              No Virtual Cards Yet
            </h4>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Create secure virtual cards for online shopping, subscriptions, and one-time purchases.
            </p>
            
            <Button
              variant="primary"
              onClick={() => setShowCreator(true)}
              className="flex items-center space-x-2 mx-auto"
            >
              <ApperIcon name="Plus" size={20} />
              <span>Create Your First Card</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Virtual Card Creator Modal */}
      <VirtualCardCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onSuccess={handleCreateCard}
      />
    </motion.div>
  )
}

export default VirtualCards