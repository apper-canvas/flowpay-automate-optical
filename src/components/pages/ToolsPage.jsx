import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import QRCodeGeneratorCard from "@/components/molecules/QRCodeGeneratorCard"
import PaymentLinkCard from "@/components/molecules/PaymentLinkCard"
import InvoiceTemplateCard from "@/components/molecules/InvoiceTemplateCard"

const ToolsPage = () => {
  const navigate = useNavigate()

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/business')}
            >
              <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Business Tools
              </h1>
              <p className="text-gray-600 mt-1">
                Manage payments, invoices, and QR codes
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tools Grid */}
      <div className="px-4 space-y-8 pb-8">
        {/* QR Code Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QRCodeGeneratorCard />
        </motion.div>

{/* Payment Link Creator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PaymentLinkCard onNavigate={() => navigate('/business/payment-links')} />
        </motion.div>
        {/* Invoice Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InvoiceTemplateCard />
        </motion.div>
      </div>
    </div>
  )
}

export default ToolsPage