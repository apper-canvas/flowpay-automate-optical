// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock exchange rates data
const mockExchangeRates = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, CAD: 1.36, AUD: 1.52, CHF: 0.88, CNY: 7.24, BTC: 0.000023, ETH: 0.00041 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 162.78, CAD: 1.48, AUD: 1.66, CHF: 0.96, CNY: 7.89, BTC: 0.000025, ETH: 0.00045 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.14, CAD: 1.72, AUD: 1.93, CHF: 1.11, CNY: 9.17, BTC: 0.000029, ETH: 0.00052 },
  JPY: { USD: 0.0067, EUR: 0.0061, GBP: 0.0053, CAD: 0.0091, AUD: 0.010, CHF: 0.0059, CNY: 0.049, BTC: 0.00000015, ETH: 0.0000027 },
  CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 109.93, AUD: 1.12, CHF: 0.65, CNY: 5.33, BTC: 0.000017, ETH: 0.00030 },
  AUD: { USD: 0.66, EUR: 0.60, GBP: 0.52, JPY: 98.36, CAD: 0.89, CHF: 0.58, CNY: 4.76, BTC: 0.000015, ETH: 0.00027 },
  CHF: { USD: 1.14, EUR: 1.04, GBP: 0.90, JPY: 170.11, CAD: 1.54, AUD: 1.72, CNY: 8.23, BTC: 0.000026, ETH: 0.00047 },
  CNY: { USD: 0.138, EUR: 0.127, GBP: 0.109, JPY: 20.41, CAD: 0.188, AUD: 0.21, CHF: 0.121, BTC: 0.0000032, ETH: 0.000057 },
  BTC: { USD: 43500, EUR: 39900, GBP: 34400, JPY: 6512500, CAD: 59160, AUD: 66120, CHF: 38280, CNY: 314940, ETH: 17.85 },
  ETH: { USD: 2440, EUR: 2240, GBP: 1930, JPY: 365060, CAD: 3318, AUD: 3709, CHF: 2147, CNY: 17666, BTC: 0.056 }
}

// Supported currencies with metadata
const supportedCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "BTC", name: "Bitcoin", symbol: "₿", flag: "₿" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ", flag: "Ξ" }
]

// In-memory storage for exchange history
let exchangeHistory = []

export const currencyExchangeService = {
  async getSupportedCurrencies() {
    await delay(200)
    try {
      return [...supportedCurrencies]
    } catch (error) {
      throw new Error("Failed to load supported currencies")
    }
  },

  async getExchangeRate(fromCurrency, toCurrency) {
    await delay(300)
    try {
      if (fromCurrency === toCurrency) {
        return 1
      }
      
      const rate = mockExchangeRates[fromCurrency]?.[toCurrency]
      if (!rate) {
        throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`)
      }
      
      // Add small random fluctuation to simulate live rates
      const fluctuation = (Math.random() - 0.5) * 0.02 // ±1% fluctuation
      return parseFloat((rate * (1 + fluctuation)).toFixed(8))
    } catch (error) {
      throw new Error("Failed to fetch exchange rate")
    }
  },

  async getLiveRates(baseCurrency = "USD") {
    await delay(400)
    try {
      const rates = {}
      const baseRates = mockExchangeRates[baseCurrency]
      
      if (!baseRates) {
        throw new Error(`Base currency ${baseCurrency} not supported`)
      }
      
      for (const [currency, rate] of Object.entries(baseRates)) {
        // Add small random fluctuation to simulate live rates
        const fluctuation = (Math.random() - 0.5) * 0.02
        rates[currency] = {
          rate: parseFloat((rate * (1 + fluctuation)).toFixed(8)),
          change24h: parseFloat(((Math.random() - 0.5) * 10).toFixed(2)), // Random change ±5%
          timestamp: new Date().toISOString()
        }
      }
      
      return rates
    } catch (error) {
      throw new Error("Failed to fetch live exchange rates")
    }
  },

  async convertAmount(fromCurrency, toCurrency, amount) {
    await delay(250)
    try {
      const rate = await this.getExchangeRate(fromCurrency, toCurrency)
      const convertedAmount = parseFloat(amount) * rate
      
      return {
        fromCurrency,
        toCurrency,
        fromAmount: parseFloat(amount),
        toAmount: parseFloat(convertedAmount.toFixed(8)),
        exchangeRate: rate,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error("Failed to convert amount")
    }
  },

  async createExchangeRecord(exchangeData) {
    await delay(200)
    try {
      const newRecord = {
        Id: exchangeHistory.length + 1,
        ...exchangeData,
        timestamp: new Date().toISOString(),
        status: "completed"
      }
      
      exchangeHistory.unshift(newRecord)
      return { ...newRecord }
    } catch (error) {
      throw new Error("Failed to create exchange record")
    }
  },

  async getExchangeHistory(limit = 10) {
    await delay(300)
    try {
      return exchangeHistory
        .slice(0, limit)
        .map(record => ({ ...record }))
    } catch (error) {
      throw new Error("Failed to load exchange history")
    }
  },

  async getPopularPairs() {
    await delay(200)
    try {
      const popularPairs = [
        { from: "USD", to: "EUR", name: "USD/EUR" },
        { from: "USD", to: "GBP", name: "USD/GBP" },
        { from: "EUR", to: "GBP", name: "EUR/GBP" },
        { from: "USD", to: "JPY", name: "USD/JPY" },
        { from: "BTC", to: "USD", name: "BTC/USD" },
        { from: "ETH", to: "USD", name: "ETH/USD" }
      ]
      
      // Add live rates to popular pairs
      const pairsWithRates = await Promise.all(
        popularPairs.map(async (pair) => {
          const rate = await this.getExchangeRate(pair.from, pair.to)
          return {
            ...pair,
            rate,
            change24h: parseFloat(((Math.random() - 0.5) * 10).toFixed(2))
          }
        })
      )
      
      return pairsWithRates
    } catch (error) {
      throw new Error("Failed to load popular currency pairs")
    }
  },

  formatCurrency(amount, currency) {
    if (currency === "BTC" || currency === "ETH") {
      return parseFloat(amount).toFixed(8)
    }
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  },

  getCurrencyInfo(currencyCode) {
    return supportedCurrencies.find(c => c.code === currencyCode) || null
  }
}