import { motion } from "framer-motion"

const Loading = ({ type = "page" }) => {
  if (type === "balance") {
    return (
      <div className="space-y-6">
        {/* Primary Balance Card Skeleton */}
        <div className="bg-gradient-to-br from-primary via-secondary to-primary p-6 rounded-2xl shadow-lg">
          <div className="space-y-4">
            <motion.div
              className="h-4 bg-white/20 rounded-lg w-24"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-12 bg-white/20 rounded-lg w-48"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="h-3 bg-white/20 rounded-lg w-20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>

        {/* Secondary Cards Skeleton */}
        <div className="flex space-x-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="min-w-[160px] bg-surface p-4 rounded-xl shadow-sm border border-gray-100"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-12" />
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-2 bg-gray-200 rounded w-16" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center space-y-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="h-3 bg-gray-200 rounded w-12" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (type === "transactions") {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-12" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

export default Loading