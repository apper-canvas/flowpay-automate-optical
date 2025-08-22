import { motion } from "framer-motion"
import QuickAction from "@/components/molecules/QuickAction"

const QuickActions = ({ onAddMoney, onSend, onRequest, onScan, onCreateCard }) => {
  const actions = [
    { icon: "Plus", label: "Add Money", onClick: onAddMoney, variant: "primary" },
    { icon: "Send", label: "Send", onClick: onSend, variant: "default" },
    { icon: "ArrowDownLeft", label: "Request", onClick: onRequest, variant: "default" },
    { icon: "QrCode", label: "Scan QR", onClick: onScan, variant: "glass" }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-display font-semibold text-gray-900">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <QuickAction
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
              variant={action.variant}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default QuickActions