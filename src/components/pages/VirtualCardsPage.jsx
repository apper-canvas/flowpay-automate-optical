import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import VirtualCard from "@/components/molecules/VirtualCard"
import VirtualCardCreator from "@/components/organisms/VirtualCardCreator"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { virtualCardService } from "@/services/api/virtualCardService"
import { toast } from "react-toastify"

const VirtualCardsPage = () => {
  const [virtualCards, setVirtualCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreator, setShowCreator] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPurpose, setFilterPurpose] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const navigate = useNavigate()

  useEffect(() => {
    loadVirtualCards()
  }, [])

  useEffect(() => {
    filterCards()
  }, [virtualCards, searchQuery, filterPurpose, filterStatus])

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

  const filterCards = () => {
    let filtered = [...virtualCards]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(card =>
        card.cardNumber.toLowerCase().includes(query) ||
        card.purpose.toLowerCase().includes(query)
      )
    }

    // Filter by purpose
    if (filterPurpose !== "all") {
      filtered = filtered.filter(card => card.purpose === filterPurpose)
    }

    // Filter by status
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active"
      filtered = filtered.filter(card => card.isActive === isActive)
    }

    setFilteredCards(filtered)
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

  const handleToggleStatus = async (cardId, currentStatus) => {
    try {
      const updatedCard = await virtualCardService.update(cardId, { 
        isActive: !currentStatus 
      })
      setVirtualCards(prev => prev.map(card => 
        card.Id === cardId ? updatedCard : card
      ))
      toast.success(`Card ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <Loading message="Loading virtual cards..." />
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
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Virtual Cards
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your secure payment cards
              </p>
            </div>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setShowCreator(true)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={16} />
            <span>Create Card</span>
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="default" className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={filterPurpose}
                onChange={(e) => setFilterPurpose(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Purposes</option>
                <option value="online-shopping">Online Shopping</option>
                <option value="subscription">Subscriptions</option>
                <option value="one-time">One-time Use</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Cards List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredCards.length > 0 ? (
            <AnimatePresence>
              {filteredCards.map((card, index) => (
                <motion.div
                  key={card.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <VirtualCard
                    card={card}
                    onDelete={handleDeleteCard}
                  />
                  
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <Button
                      variant={card.isActive ? "warning" : "success"}
                      size="sm"
                      onClick={() => handleToggleStatus(card.Id, card.isActive)}
                      className="text-xs"
                    >
                      {card.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <Card padding="lg" className="text-center">
              <div className="py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <ApperIcon name="Search" size={32} className="text-gray-400" />
                </motion.div>
                
                <h4 className="text-xl font-display font-semibold text-gray-900 mb-2">
                  No Cards Found
                </h4>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterPurpose !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search criteria."
                    : "Create your first virtual card to get started."}
                </p>
                
                {(!searchQuery && filterPurpose === "all" && filterStatus === "all") && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreator(true)}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <ApperIcon name="Plus" size={20} />
                    <span>Create Virtual Card</span>
                  </Button>
                )}
              </div>
            </Card>
          )}
        </motion.div>

        {/* Stats */}
        {virtualCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card padding="default">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-display font-bold text-gray-900">
                    {virtualCards.length}
                  </p>
                  <p className="text-gray-600 text-sm">Total Cards</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-success">
                    {virtualCards.filter(card => card.isActive).length}
                  </p>
                  <p className="text-gray-600 text-sm">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-primary">
                    $
                    {virtualCards
                      .reduce((sum, card) => sum + (card.spendingLimit - card.currentSpending), 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-sm">Available Limit</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Virtual Card Creator Modal */}
      <VirtualCardCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onSuccess={handleCreateCard}
      />
    </div>
  )
}

export default VirtualCardsPage