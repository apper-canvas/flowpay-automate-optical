import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: "/", icon: "Wallet", label: "Wallet" },
    { path: "/payments", icon: "Send", label: "Payments" },
    { path: "/history", icon: "Clock", label: "History" },
    { path: "/business", icon: "Briefcase", label: "Business" },
    { path: "/more", icon: "MoreHorizontal", label: "More" },
  ]

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path)
          
          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px]"
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                active 
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg" 
                  : "text-gray-400 hover:text-gray-600"
              }`}>
                <ApperIcon 
                  name={item.icon} 
                  size={20}
                />
              </div>
              
              <span className={`text-xs font-medium transition-all duration-200 ${
                active ? "text-primary" : "text-gray-400"
              }`}>
                {item.label}
              </span>
              
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1 h-1 bg-primary rounded-full"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation