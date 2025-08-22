import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"

const FundingSourceCard = ({ fundingSource, isSelected = false, onClick }) => {
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

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(fundingSource)}
      className="cursor-pointer"
    >
      <Card 
        className={`border-2 transition-all duration-200 ${
          isSelected 
            ? "border-primary bg-primary/5" 
            : "border-gray-100 hover:border-gray-200"
        }`}
        padding="default"
      >
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
              <p className="font-medium text-gray-900 text-sm">
                {fundingSource.name}
              </p>
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
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default FundingSourceCard