import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Empty from "@/components/ui/Empty"

const BusinessPage = () => {
  const businessFeatures = [
    {
      icon: "Store",
      title: "Merchant Dashboard",
      description: "Manage your business payments and analytics",
      badge: "Pro",
      comingSoon: true
    },
    {
      icon: "QrCode",
      title: "Payment QR Codes",
      description: "Generate QR codes for easy customer payments",
      badge: "Popular",
      comingSoon: true
    },
    {
      icon: "BarChart3",
      title: "Sales Analytics",
      description: "Track your business performance and insights",
      badge: "Premium",
      comingSoon: true
    },
    {
      icon: "CreditCard",
      title: "Point of Sale",
      description: "Accept payments in-person with our POS system",
      badge: "New",
      comingSoon: true
    },
    {
      icon: "FileText",
      title: "Invoicing",
      description: "Create and send professional invoices",
      comingSoon: true
    },
    {
      icon: "Users",
      title: "Team Management",
      description: "Manage staff access and permissions",
      comingSoon: true
    }
  ]

  const getBadgeVariant = (badge) => {
    switch (badge) {
      case "Pro":
        return "primary"
      case "Popular":
        return "success"
      case "Premium":
        return "warning"
      case "New":
        return "info"
      default:
        return "default"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Business Tools
          </h1>
          <p className="text-gray-600 mt-1">
            Powerful tools to grow your business
          </p>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card variant="gradient" padding="default" className="text-white">
            <div className="text-center">
              <p className="text-white/80 text-sm mb-1">Monthly Revenue</p>
              <p className="text-2xl font-display font-bold">$12,450</p>
            </div>
          </Card>
          
          <Card padding="default" className="text-center">
            <p className="text-gray-600 text-sm mb-1">Active Customers</p>
            <p className="text-2xl font-display font-bold text-gray-900">248</p>
          </Card>
        </motion.div>
      </div>

      {/* Business Features */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {businessFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card 
                padding="lg"
                className="relative hover:shadow-lg transition-all duration-200 cursor-pointer h-full"
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ApperIcon name={feature.icon} size={24} className="text-primary" />
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {feature.badge && (
                          <Badge variant={getBadgeVariant(feature.badge)} size="xs">
                            {feature.badge}
                          </Badge>
                        )}
                        {feature.comingSoon && (
                          <Badge variant="warning" size="xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
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
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State for Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <Empty
            title="Business tools launching soon"
            message="We're building powerful business tools to help you accept payments, manage customers, and grow your business."
            icon="Building2"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default BusinessPage