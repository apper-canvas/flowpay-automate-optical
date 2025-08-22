import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"

const MorePage = () => {
  const menuSections = [
    {
title: "Account",
      items: [
        { icon: "User", title: "Profile Settings", description: "Manage your personal information", action: () => toast.info("Profile settings coming soon!") },
        { icon: "Shield", title: "Security", description: "Password, 2FA, and privacy settings", action: () => toast.info("Security settings coming soon!") },
{ icon: "Bell", title: "Notifications", description: "Customize your alerts and updates", action: () => toast.info("Notification settings coming soon!") },
        { icon: "CreditCard", title: "Manage Subscriptions", description: "View and manage your recurring payments", action: () => window.location.href = "/subscriptions" },
        { icon: "Calendar", title: "Billing Calendar", description: "Monthly view of all upcoming payments", action: () => window.location.href = "/billing-calendar" }
      ]
    },
    {
      title: "Preferences",
items: [
        { icon: "Palette", title: "Appearance", description: "Theme and display settings", badge: "New", action: () => toast.info("Appearance settings coming soon!") },
        { icon: "Globe", title: "Language & Region", description: "Language, currency, and locale", action: () => toast.info("Language settings coming soon!") },
        { icon: "Settings", title: "Settings", description: "Security, notifications, and preferences", action: () => window.location.href = "/settings" }
      ]
    },
    {
      title: "Support",
      items: [
        { icon: "HelpCircle", title: "Help Center", description: "FAQs and troubleshooting", action: () => toast.info("Help center coming soon!") },
        { icon: "MessageCircle", title: "Contact Support", description: "Get help from our team", action: () => toast.info("Support chat coming soon!") },
        { icon: "Star", title: "Rate FlowPay", description: "Share your experience", action: () => toast.success("Thanks for using FlowPay!") }
      ]
    },
    {
      title: "Legal",
      items: [
        { icon: "FileText", title: "Terms of Service", description: "Read our terms and conditions", action: () => toast.info("Terms coming soon!") },
        { icon: "Lock", title: "Privacy Policy", description: "How we protect your data", action: () => toast.info("Privacy policy coming soon!") },
        { icon: "Scale", title: "Compliance", description: "Regulatory information", action: () => toast.info("Compliance info coming soon!") }
      ]
    }
  ]

  const getBadgeVariant = (badge) => {
    switch (badge) {
      case "New":
        return "info"
      case "Pro":
        return "primary"
      case "Beta":
        return "warning"
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
            More
          </h1>
          <p className="text-gray-600 mt-1">
            Settings, support, and more options
          </p>
        </motion.div>
      </div>

      {/* Profile Card */}
      <div className="px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="gradient" padding="lg" className="text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <ApperIcon name="User" size={32} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-display font-semibold text-white mb-1">
                  Welcome back!
                </h3>
                <p className="text-white/80 text-sm">
                  FlowPay Premium Member
                </p>
              </div>
              
              <div className="text-right">
                <Badge variant="default" className="bg-white/20 text-white">
                  Premium
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Menu Sections */}
      <div className="px-4 space-y-6">
        {menuSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sectionIndex * 0.1 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-display font-semibold text-gray-900 px-2">
              {section.title}
            </h2>
            
            <Card padding="none" className="overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <motion.button
                  key={item.title}
                  whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <ApperIcon name={item.icon} size={18} className="text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 text-sm">
                          {item.title}
                        </p>
                        {item.badge && (
                          <Badge variant={getBadgeVariant(item.badge)} size="xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                </motion.button>
              ))}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-4 py-8 text-center"
      >
        <p className="text-gray-400 text-sm">
          FlowPay v1.0.0
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Made with ❤️ for seamless payments
        </p>
      </motion.div>
    </div>
  )
}

export default MorePage