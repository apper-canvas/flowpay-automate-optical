import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"

const SupportPage = () => {
  const navigate = useNavigate()

  const handleContactSupport = (method) => {
    switch (method) {
      case 'chat':
        toast.info("Opening support chat...")
        // In a real app, this would open a chat widget
        break
      case 'email':
        window.open('mailto:support@flowpay.com?subject=FlowPay Support Request')
        break
      case 'phone':
        toast.info("Support Phone: +1 (555) 123-4567")
        break
      case 'twitter':
        window.open('https://twitter.com/flowpay_support', '_blank')
        break
      default:
        toast.info(`${method} support coming soon!`)
    }
  }

  const handleFAQClick = (question) => {
    toast.info(`Opening FAQ: ${question}`)
    // In a real app, this would navigate to specific FAQ articles
  }

  const supportOptions = [
    {
      icon: "MessageCircle",
      title: "Live Chat",
      description: "Get instant help from our support team",
      badge: "Fastest Response",
      badgeVariant: "success",
      action: () => handleContactSupport('chat'),
      available: "24/7"
    },
    {
      icon: "Mail",
      title: "Email Support",
      description: "Send us a detailed message about your issue",
      action: () => handleContactSupport('email'),
      available: "Response within 24h"
    },
    {
      icon: "Phone",
      title: "Phone Support",
      description: "Speak directly with our support specialists",
      action: () => handleContactSupport('phone'),
      available: "Mon-Fri 9AM-6PM PST"
    },
    {
      icon: "Twitter",
      title: "Social Media",
      description: "Reach out to us on Twitter for quick updates",
      action: () => handleContactSupport('twitter'),
      available: "Follow @flowpay_support"
    }
  ]

  const faqCategories = [
    {
      title: "Getting Started",
      icon: "BookOpen",
      questions: [
        "How do I create my FlowPay account?",
        "How to add money to my wallet?",
        "Setting up biometric authentication",
        "Understanding transaction limits"
      ]
    },
    {
      title: "Payments & Transfers",
      icon: "CreditCard",
      questions: [
        "How to send money to friends?",
        "International transfer fees",
        "Payment processing times",
        "Canceling pending transactions"
      ]
    },
    {
      title: "Security & Privacy",
      icon: "Shield",
      questions: [
        "How secure is my data?",
        "Two-factor authentication setup",
        "Reporting suspicious activity",
        "Account recovery process"
      ]
    },
    {
      title: "Troubleshooting",
      icon: "AlertCircle",
      questions: [
        "Transaction not showing up",
        "App won't open or crashes",
        "Forgotten password recovery",
        "Card linking issues"
      ]
    }
  ]

  const emergencyContacts = [
    {
      title: "Report Fraud",
      description: "Suspicious activity on your account",
      phone: "+1 (555) 911-FRAUD",
      urgent: true
    },
    {
      title: "Lost Card",
      description: "Report and freeze your linked cards",
      phone: "+1 (555) 123-CARD",
      urgent: true
    },
    {
      title: "Account Locked",
      description: "Urgent account access issues",
      phone: "+1 (555) 123-HELP",
      urgent: false
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Help & Support
            </h1>
            <p className="text-gray-600 mt-1">
              We're here to help you with any questions
            </p>
          </div>
        </motion.div>
      </div>

      {/* Emergency Support */}
      <div className="px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-display font-semibold text-gray-900 px-2">
            Emergency Support
          </h2>
          
          <Card padding="none" className="overflow-hidden border-red-200">
            {emergencyContacts.map((contact, index) => (
              <motion.button
                key={contact.title}
                whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.02)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast.info(`Calling ${contact.phone}`)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-red-50/50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.urgent ? 'bg-red-100' : 'bg-orange-100'
                  }`}>
                    <ApperIcon name="Phone" size={18} className={
                      contact.urgent ? 'text-red-600' : 'text-orange-600'
                    } />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {contact.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {contact.description}
                    </p>
                    <p className="text-xs font-mono text-gray-700 mt-1">
                      {contact.phone}
                    </p>
                  </div>
                </div>
                
                <ApperIcon name="Phone" size={16} className="text-gray-400" />
              </motion.button>
            ))}
          </Card>
        </motion.div>
      </div>

      {/* Support Options */}
      <div className="px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-display font-semibold text-gray-900 px-2">
            Contact Support
          </h2>
          
          <Card padding="none" className="overflow-hidden">
            {supportOptions.map((option, index) => (
              <motion.button
                key={option.title}
                whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                whileTap={{ scale: 0.98 }}
                onClick={option.action}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ApperIcon name={option.icon} size={18} className="text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 text-sm">
                        {option.title}
                      </p>
                      {option.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          option.badgeVariant === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                    <p className="text-xs text-primary font-medium mt-1">
                      {option.available}
                    </p>
                  </div>
                </div>
                
                <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
              </motion.button>
            ))}
          </Card>
        </motion.div>
      </div>

      {/* FAQ Categories */}
      <div className="px-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-display font-semibold text-gray-900 px-2 mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>
        
        {faqCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + categoryIndex * 0.1 }}
            className="space-y-3"
          >
            <div className="px-2 flex items-center space-x-2">
              <ApperIcon name={category.icon} size={18} className="text-primary" />
              <h3 className="text-md font-display font-semibold text-gray-900">
                {category.title}
              </h3>
            </div>
            
            <Card padding="none" className="overflow-hidden">
              {category.questions.map((question, questionIndex) => (
                <motion.button
                  key={question}
                  whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFAQClick(question)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <p className="text-sm text-gray-700">
                      {question}
                    </p>
                  </div>
                  
                  <ApperIcon name="ChevronRight" size={14} className="text-gray-400" />
                </motion.button>
              ))}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-4 py-8 text-center"
      >
        <p className="text-gray-400 text-sm">
          Still need help? Our support team is always ready to assist you.
        </p>
      </motion.div>
    </div>
  )
}

export default SupportPage