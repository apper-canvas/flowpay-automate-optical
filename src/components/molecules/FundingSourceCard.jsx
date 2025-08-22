import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"

const FundingSourceCard = ({ 
  fundingSource, 
  isSelected = false, 
  onClick, 
  showUsageStats = false,
  onEdit,
  onDelete
}) => {
  const getIconColor = (type) => {
    switch (type) {
      case "bank":
        return "text-blue-600"
      case "card":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const formatLastUsed = (dateString) => {
    if (!dateString) return "Never used"
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick && onClick(fundingSource)}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card 
        className={`border-2 transition-all duration-200 ${
          isSelected 
            ? "border-primary bg-primary/5" 
            : "border-gray-100 hover:border-gray-200"
        }`}
        padding="default"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center`}>
                <ApperIcon 
                  name={fundingSource.icon} 
                  size={20} 
                  className={getIconColor(fundingSource.type)} 
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 text-sm">
                    {fundingSource.alias || fundingSource.name}
                  </p>
                  {fundingSource.alias && fundingSource.alias !== fundingSource.name && (
                    <Badge variant="outline" size="xs">
                      {fundingSource.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  •••• {fundingSource.lastFour}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {fundingSource.isDefault && (
                <Badge variant="primary" size="xs">
                  Default
                </Badge>
              )}
              
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <ApperIcon name="Check" size={12} className="text-white" />
                </div>
              )}

              {(onEdit || onDelete) && (
                <div className="flex items-center space-x-1">
                  {onEdit && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(fundingSource)
                      }}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <ApperIcon name="Edit2" size={14} className="text-gray-600" />
                    </motion.button>
                  )}
                  
                  {onDelete && !fundingSource.isDefault && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(fundingSource)
                      }}
                      className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                    >
                      <ApperIcon name="Trash2" size={14} className="text-red-600" />
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </div>

          {showUsageStats && (
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-gray-500">Usage Count</p>
                  <p className="font-medium text-gray-900">{fundingSource.usageCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Spent</p>
                  <p className="font-medium text-gray-900">${(fundingSource.totalSpent || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Used</p>
                  <p className="font-medium text-gray-900">{formatLastUsed(fundingSource.lastUsed)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default FundingSourceCard