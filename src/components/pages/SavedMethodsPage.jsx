import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Badge from "@/components/atoms/Badge"
import FundingSourceCard from "@/components/molecules/FundingSourceCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { walletService } from "@/services/api/walletService"
import { toast } from "react-toastify"

const SavedMethodsPage = () => {
  const navigate = useNavigate()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [newAlias, setNewAlias] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [selectedMethodStats, setSelectedMethodStats] = useState(null)

  const loadPaymentMethods = async () => {
    try {
      setLoading(true)
      setError("")
      
      const methods = await walletService.getFundingSources()
      setPaymentMethods(methods)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const handleEditAlias = (method) => {
    setEditingMethod(method)
    setNewAlias(method.alias || method.name)
    setShowEditModal(true)
  }

  const handleSaveAlias = async () => {
    if (!editingMethod) return
    
    try {
      setLoading(true)
      await walletService.updatePaymentMethodAlias(editingMethod.Id, newAlias)
      await loadPaymentMethods()
      setShowEditModal(false)
      setEditingMethod(null)
      setNewAlias("")
      toast.success("Payment method alias updated successfully!")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (method) => {
    if (method.isDefault) return
    
    try {
      setLoading(true)
      await walletService.setDefaultPaymentMethod(method.Id)
      await loadPaymentMethods()
      toast.success(`${method.alias || method.name} is now your default payment method!`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMethod = (method) => {
    setMethodToDelete(method)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!methodToDelete) return
    
    try {
      setLoading(true)
      await walletService.deletePaymentMethod(methodToDelete.Id)
      await loadPaymentMethods()
      setShowDeleteConfirm(false)
      setMethodToDelete(null)
      toast.success("Payment method deleted successfully!")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewStats = async (method) => {
    try {
      const stats = await walletService.getPaymentMethodUsageStats(method.Id)
      setSelectedMethodStats(stats)
      setShowStats(true)
    } catch (err) {
      toast.error("Failed to load payment method statistics")
    }
  }

  const calculateTotalSpent = () => {
    return paymentMethods.reduce((total, method) => total + (method.totalSpent || 0), 0)
  }

  const getMostUsedMethod = () => {
    return paymentMethods.reduce((most, method) => 
      (method.usageCount || 0) > (most.usageCount || 0) ? method : most
    , paymentMethods[0])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-12">
          <Loading type="page" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-12">
          <Error 
            message={error}
            onRetry={loadPaymentMethods}
            title="Failed to load saved methods"
          />
        </div>
      </div>
    )
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
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-surface border border-gray-200 flex items-center justify-center"
            >
              <ApperIcon name="ArrowLeft" size={20} className="text-gray-600" />
            </motion.button>
            
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Saved Methods
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your payment methods and preferences
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info("Add new payment method coming soon!")}
          >
            <ApperIcon name="Plus" size={16} />
            Add Method
          </Button>
        </motion.div>
      </div>

      {/* Overview Stats */}
      {paymentMethods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mb-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <Card padding="default">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  ${calculateTotalSpent().toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
            </Card>
            
            <Card padding="default">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {paymentMethods.length}
                </p>
                <p className="text-sm text-gray-500">Saved Methods</p>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Payment Methods List */}
      <div className="px-4 space-y-4">
        {paymentMethods.length === 0 ? (
          <Empty
            title="No saved payment methods"
            message="Add your first payment method to get started."
            icon="CreditCard"
            actionLabel="Add Method"
            onAction={() => toast.info("Add new payment method coming soon!")}
          />
        ) : (
          <>
            <h3 className="text-lg font-display font-semibold text-gray-900">
              Payment Methods ({paymentMethods.length})
            </h3>
            
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FundingSourceCard
                    fundingSource={method}
                    showUsageStats={true}
                    onEdit={handleEditAlias}
                    onDelete={handleDeleteMethod}
                    onClick={() => handleViewStats(method)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Alias Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold">Edit Alias</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <ApperIcon name="X" size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Alias
                  </label>
                  <Input
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder="Enter custom alias"
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAlias}
                    disabled={!newAlias.trim()}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl p-6 w-full max-w-md"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="Trash2" size={24} className="text-red-600" />
                </div>
                
                <h3 className="text-lg font-display font-semibold mb-2">
                  Delete Payment Method
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{methodToDelete?.alias || methodToDelete?.name}"? 
                  This action cannot be undone.
                </p>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="error"
                    size="sm"
                    onClick={confirmDelete}
                    className="flex-1"
                  >
                    Delete Method
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Statistics Modal */}
      <AnimatePresence>
        {showStats && selectedMethodStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowStats(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold">
                  Usage Statistics
                </h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <ApperIcon name="X" size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Method Info */}
                <Card padding="default" className="bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <ApperIcon 
                        name={selectedMethodStats.icon} 
                        size={24} 
                        className="text-primary" 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedMethodStats.alias || selectedMethodStats.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        •••• {selectedMethodStats.lastFour}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card padding="default">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedMethodStats.usageCount}
                      </p>
                      <p className="text-sm text-gray-500">Total Transactions</p>
                    </div>
                  </Card>
                  
                  <Card padding="default">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        ${selectedMethodStats.totalSpent.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Total Spent</p>
                    </div>
                  </Card>
                </div>

                {/* Monthly Usage */}
                {selectedMethodStats.monthlyUsage && selectedMethodStats.monthlyUsage.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Monthly Usage</h4>
                    <div className="space-y-3">
                      {selectedMethodStats.monthlyUsage.map((month, index) => (
                        <Card key={index} padding="sm">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{month.month}</p>
                            <div className="text-right">
                              <p className="text-sm font-medium">${month.amount.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">{month.transactions} transactions</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(selectedMethodStats)}
                    disabled={selectedMethodStats.isDefault}
                    className="flex-1"
                  >
                    {selectedMethodStats.isDefault ? "Default Method" : "Set as Default"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SavedMethodsPage