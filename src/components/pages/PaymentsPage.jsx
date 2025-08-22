import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";

const PaymentsPage = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (feature) => {
    if (feature.comingSoon) return;
    if (feature.path) {
      navigate(feature.path);
    }
  };
const PaymentsPage = () => {
  const paymentFeatures = [
    {
      icon: "Send",
      title: "Send Money",
      description: "Send money to friends and family instantly",
      comingSoon: false,
      path: "/payments/transfer"
    },
    {
      icon: "Users",
      title: "Split Bills",
      description: "Split expenses with your group easily",
      comingSoon: true
    },
    {
      icon: "QrCode",
      title: "Pay with QR",
      description: "Scan and pay at participating merchants",
      comingSoon: true
    },
    {
      icon: "Phone",
      title: "Mobile Top-up",
      description: "Recharge your mobile phone instantly",
      comingSoon: true
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Payments
          </h1>
          <p className="text-gray-600 mt-1">
            Send and receive money instantly
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2"
        >
{paymentFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card 
                padding="lg"
                className={`relative transition-all duration-200 cursor-pointer ${
                  feature.comingSoon 
                    ? "hover:shadow-lg" 
                    : "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                }`}
                onClick={() => handleFeatureClick(feature)}
              >
                {feature.comingSoon && (
                  <div className="absolute top-4 right-4 bg-warning/10 text-warning text-xs font-medium px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
                
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ApperIcon name={feature.icon} size={24} className="text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State for Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <Empty
            title="Payment features coming soon"
            message="We're working hard to bring you the best payment experience. Stay tuned for exciting updates!"
            icon="Rocket"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentsPage