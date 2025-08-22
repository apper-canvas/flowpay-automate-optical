import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import InvoiceTemplateCard from "@/components/molecules/InvoiceTemplateCard";

const InvoicePage = () => {
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/business')}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Invoice Generator
              </h1>
              <p className="text-gray-600 mt-1">
                Create professional invoices for your customers
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InvoiceTemplateCard />
        </motion.div>
      </div>
    </div>
  )
}

export default InvoicePage