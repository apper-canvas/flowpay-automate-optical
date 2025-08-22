import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { currencyExchangeService } from "@/services/api/currencyExchangeService"
import { walletService } from "@/services/api/walletService"

const CurrencyExchangePage = () => {
  const navigate = useNavigate()
  
  // State management
  const [currencies, setCurrencies] = useState([])
  const [wallets, setWallets] = useState([])
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [exchangeRate, setExchangeRate] = useState(0)
  const [popularPairs, setPopularPairs] = useState([])
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [exchanging, setExchanging] = useState(false)
  const [error, setError] = useState("")

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [currencyList, walletList, pairs] = await Promise.all([
        currencyExchangeService.getSupportedCurrencies(),
        walletService.getAllWallets(),
        currencyExchangeService.getPopularPairs()
      ])
      
      setCurrencies(currencyList)
      setWallets(walletList)
      setPopularPairs(pairs)
      
      // Set initial currencies if wallets exist
      if (walletList.length >= 2) {
        setFromCurrency(walletList[0].currency)
        setToCurrency(walletList[1].currency)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate conversion
  const calculateConversion = async (amount, from = fromCurrency, to = toCurrency) => {
    if (!amount || amount <= 0) {
      setToAmount("")
      setExchangeRate(0)
      return
    }
    
    try {
      setCalculating(true)
      const result = await currencyExchangeService.convertAmount(from, to, amount)
      setToAmount(result.toAmount.toString())
      setExchangeRate(result.exchangeRate)
    } catch (err) {
      toast.error(`Conversion failed: ${err.message}`)
    } finally {
      setCalculating(false)
    }
  }

  // Handle amount input changes
  const handleFromAmountChange = (e) => {
    const value = e.target.value
    setFromAmount(value)
    calculateConversion(value)
  }

  const handleToAmountChange = (e) => {
    const value = e.target.value
    setToAmount(value)
    // Reverse calculate from amount
    if (value && exchangeRate > 0) {
      const reverseAmount = parseFloat(value) / exchangeRate
      setFromAmount(reverseAmount.toFixed(8))
    }
  }

  // Handle currency changes
  const handleFromCurrencyChange = (e) => {
    const newCurrency = e.target.value
    setFromCurrency(newCurrency)
    if (fromAmount) {
      calculateConversion(fromAmount, newCurrency, toCurrency)
    }
  }

  const handleToCurrencyChange = (e) => {
    const newCurrency = e.target.value
    setToCurrency(newCurrency)
    if (fromAmount) {
      calculateConversion(fromAmount, fromCurrency, newCurrency)
    }
  }

  // Swap currencies
  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency
    const tempAmount = fromAmount
    
    setFromCurrency(toCurrency)
    setToCurrency(tempCurrency)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
    
    if (toAmount) {
      calculateConversion(toAmount, toCurrency, tempCurrency)
    }
    
    toast.success("Currencies swapped successfully!")
  }

  // Execute currency exchange
  const handleExchange = async () => {
    if (!fromAmount || !toAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter a valid amount to exchange")
      return
    }

    const fromWallet = wallets.find(w => w.currency === fromCurrency)
    const toWallet = wallets.find(w => w.currency === toCurrency)

    if (!fromWallet) {
      toast.error(`No wallet found for ${fromCurrency}`)
      return
    }

    if (!toWallet) {
      toast.error(`No wallet found for ${toCurrency}`)
      return
    }

    if (fromWallet.balance < parseFloat(fromAmount)) {
      toast.error("Insufficient funds in source wallet")
      return
    }

    try {
      setExchanging(true)
      
      const result = await walletService.currencyExchange({
        fromWalletId: fromWallet.Id,
        toWalletId: toWallet.Id,
        fromAmount,
        toAmount,
        exchangeRate
      })
      
      // Record exchange in service
      await currencyExchangeService.createExchangeRecord({
        fromCurrency,
        toCurrency,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        exchangeRate
      })
      
      toast.success(`Successfully exchanged ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`)
      
      // Reset form
      setFromAmount("")
      setToAmount("")
      setExchangeRate(0)
      
      // Refresh wallets
      loadInitialData()
      
    } catch (err) {
      toast.error(`Exchange failed: ${err.message}`)
    } finally {
      setExchanging(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadInitialData()
  }, [])

  // Format currency display
  const formatCurrencyAmount = (amount, currency) => {
    return currencyExchangeService.formatCurrency(amount, currency)
  }

  const getCurrencyInfo = (code) => {
    return currencyExchangeService.getCurrencyInfo(code)
  }

  if (loading) {
    return <Loading type="page" />
  }

  if (error) {
    return (
      <Error
        message={error}
        onRetry={loadInitialData}
        title="Failed to load currency exchange"
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-gray-100">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900">
                Currency Exchange
              </h1>
              <p className="text-sm text-gray-500">
                Convert between currencies with live rates
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Exchange Calculator */}
        <Card padding="lg" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-gray-900">
                Exchange Calculator
              </h2>
              {exchangeRate > 0 && (
                <div className="text-sm text-gray-600">
                  1 {fromCurrency} = {exchangeRate.toFixed(8)} {toCurrency}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* From Currency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">From</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={fromCurrency}
                    onChange={handleFromCurrencyChange}
                    className="h-12 px-4 rounded-xl border border-gray-200 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={fromAmount}
                    onChange={handleFromAmountChange}
                    className="text-right"
                  />
                </div>
                {fromCurrency && wallets.find(w => w.currency === fromCurrency) && (
                  <div className="text-xs text-gray-500">
                    Available: {formatCurrencyAmount(wallets.find(w => w.currency === fromCurrency).balance, fromCurrency)} {fromCurrency}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwapCurrencies}
                  className="p-2 rounded-full"
                  disabled={calculating}
                >
                  <ApperIcon name="ArrowUpDown" size={16} />
                </Button>
              </div>

              {/* To Currency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">To</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={toCurrency}
                    onChange={handleToCurrencyChange}
                    className="h-12 px-4 rounded-xl border border-gray-200 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Converted amount"
                    value={toAmount}
                    onChange={handleToAmountChange}
                    className="text-right"
                    disabled={calculating}
                  />
                </div>
                {toCurrency && wallets.find(w => w.currency === toCurrency) && (
                  <div className="text-xs text-gray-500">
                    Balance: {formatCurrencyAmount(wallets.find(w => w.currency === toCurrency).balance, toCurrency)} {toCurrency}
                  </div>
                )}
              </div>

              {/* Exchange Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleExchange}
                disabled={!fromAmount || !toAmount || exchanging || calculating}
                className="w-full"
              >
                {exchanging ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                    Processing Exchange...
                  </>
                ) : (
                  <>
                    <ApperIcon name="ArrowRightLeft" size={16} className="mr-2" />
                    Exchange Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Popular Currency Pairs */}
        {popularPairs.length > 0 && (
          <Card padding="lg">
            <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">
              Popular Pairs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popularPairs.map((pair, index) => (
                <motion.div
                  key={pair.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-gray-100 hover:border-primary/20 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setFromCurrency(pair.from)
                    setToCurrency(pair.to)
                    if (fromAmount) {
                      calculateConversion(fromAmount, pair.from, pair.to)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{pair.name}</div>
                      <div className="text-sm text-gray-500">
                        1 {pair.from} = {pair.rate.toFixed(8)} {pair.to}
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      pair.change24h > 0 ? 'text-success' : 
                      pair.change24h < 0 ? 'text-error' : 'text-gray-500'
                    }`}>
                      <ApperIcon 
                        name={pair.change24h > 0 ? "TrendingUp" : pair.change24h < 0 ? "TrendingDown" : "Minus"} 
                        size={12} 
                      />
                      <span className="text-xs font-medium">
                        {pair.change24h > 0 ? "+" : ""}{pair.change24h}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CurrencyExchangePage