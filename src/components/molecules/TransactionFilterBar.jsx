import { useState } from "react"
import { motion } from "framer-motion"
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const TransactionFilterBar = ({ 
  onFiltersChange, 
  initialFilters = {}, 
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    searchQuery: initialFilters.searchQuery || "",
    type: initialFilters.type || "all",
    dateFrom: initialFilters.dateFrom || "",
    dateTo: initialFilters.dateTo || "",
    amountMin: initialFilters.amountMin || "",
    amountMax: initialFilters.amountMax || ""
  })

  const typeOptions = [
    { value: "all", label: "All Types", icon: "Receipt" },
    { value: "payment", label: "Payments", icon: "ArrowUpRight" },
    { value: "received", label: "Received", icon: "ArrowDownLeft" },
    { value: "deposit", label: "Deposits", icon: "Plus" },
    { value: "exchange", label: "Exchange", icon: "RefreshCw" }
  ]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      searchQuery: "",
      type: "all",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: ""
    }
    setFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.type !== "all") count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.amountMin || filters.amountMax) count++
    if (filters.searchQuery) count++
    return count
  }

  const hasActiveFilters = getActiveFilterCount() > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search by recipient name..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
          className="bg-surface pl-10"
        />
        <ApperIcon 
          name="Search" 
          size={18} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
      </div>

      {/* Filter Toggle & Quick Types */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto flex-1">
          {typeOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.type === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("type", option.value)}
              className="whitespace-nowrap flex items-center gap-2"
            >
              <ApperIcon name={option.icon} size={14} />
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-error hover:text-error hover:bg-error/10"
            >
              <ApperIcon name="X" size={14} />
              Reset
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-2",
              hasActiveFilters && "border-primary text-primary"
            )}
          >
            <ApperIcon name="Filter" size={14} />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px]">
                {getActiveFilterCount()}
              </span>
            )}
            <ApperIcon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              size={14} 
            />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <ApperIcon name="SlidersHorizontal" size={16} className="text-gray-600" />
            <h3 className="font-medium text-gray-900 text-sm">Advanced Filters</h3>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ApperIcon name="Calendar" size={14} />
              Date Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="date"
                label="From Date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                max={filters.dateTo || format(new Date(), "yyyy-MM-dd")}
              />
              <Input
                type="date"
                label="To Date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                min={filters.dateFrom}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ApperIcon name="DollarSign" size={14} />
              Amount Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="number"
                label="Min Amount ($)"
                placeholder="0.00"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange("amountMin", e.target.value)}
                min="0"
                step="0.01"
              />
              <Input
                type="number"
                label="Max Amount ($)"
                placeholder="No limit"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange("amountMax", e.target.value)}
                min={filters.amountMin || "0"}
                step="0.01"
              />
            </div>
          </div>

          {/* Quick Amount Presets */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Under $50", min: "", max: "50" },
                { label: "$50-$200", min: "50", max: "200" },
                { label: "$200-$1000", min: "200", max: "1000" },
                { label: "Over $1000", min: "1000", max: "" }
              ].map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleFilterChange("amountMin", preset.min)
                    handleFilterChange("amountMax", preset.max)
                  }}
                  className="text-xs border border-gray-200 hover:border-primary hover:text-primary"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-800"
            >
              <ApperIcon name="RotateCcw" size={14} className="mr-2" />
              Reset All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TransactionFilterBar