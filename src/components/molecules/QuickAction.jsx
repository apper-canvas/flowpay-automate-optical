import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const QuickAction = ({ icon, label, onClick, variant = "default" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-br from-primary to-secondary text-white shadow-lg"
      case "accent":
        return "bg-gradient-to-br from-accent to-orange-500 text-white shadow-lg"
      case "glass":
        return "glass text-gray-700"
      default:
        return "bg-surface text-gray-700 shadow-sm hover:shadow-md border border-gray-100"
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center space-y-2 focus:outline-none"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${getVariantStyles()}`}>
        <ApperIcon name={icon} size={24} />
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </motion.button>
  )
}

export default QuickAction