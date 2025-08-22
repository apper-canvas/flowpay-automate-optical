import virtualCardData from "@/services/mockData/virtualCards.json"

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage for runtime data
let virtualCardsState = [...virtualCardData]

export const virtualCardService = {
  async getAll() {
    await delay(300)
    try {
      return virtualCardsState.map(card => ({ ...card }))
    } catch (error) {
      throw new Error("Failed to load virtual cards")
    }
  },

  async getById(id) {
    await delay(250)
    try {
      const card = virtualCardsState.find(c => c.Id === parseInt(id))
      if (!card) {
        throw new Error("Virtual card not found")
      }
      return { ...card }
    } catch (error) {
      throw new Error("Failed to load virtual card")
    }
  },

  async create({ purpose, spendingLimit, walletId }) {
    await delay(500)
    try {
      const newCard = {
        Id: Math.max(...virtualCardsState.map(c => c.Id), 0) + 1,
        cardNumber: generateCardNumber(),
        expiryDate: generateExpiryDate(),
        cvv: generateCVV(),
        purpose,
        spendingLimit: parseFloat(spendingLimit),
        currentSpending: 0,
        walletId: parseInt(walletId),
        currency: "USD",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsed: null
      }

      virtualCardsState.unshift(newCard)
      return { ...newCard }
    } catch (error) {
      throw new Error("Failed to create virtual card")
    }
  },

  async update(id, updates) {
    await delay(400)
    try {
      const cardIndex = virtualCardsState.findIndex(c => c.Id === parseInt(id))
      if (cardIndex === -1) {
        throw new Error("Virtual card not found")
      }

      virtualCardsState[cardIndex] = {
        ...virtualCardsState[cardIndex],
        ...updates
      }

      return { ...virtualCardsState[cardIndex] }
    } catch (error) {
      throw new Error("Failed to update virtual card")
    }
  },

  async delete(id) {
    await delay(300)
    try {
      const cardIndex = virtualCardsState.findIndex(c => c.Id === parseInt(id))
      if (cardIndex === -1) {
        throw new Error("Virtual card not found")
      }

      const deletedCard = virtualCardsState.splice(cardIndex, 1)[0]
      return { ...deletedCard }
    } catch (error) {
      throw new Error("Failed to delete virtual card")
    }
  },

  async recordSpending(id, amount) {
    await delay(400)
    try {
      const cardIndex = virtualCardsState.findIndex(c => c.Id === parseInt(id))
      if (cardIndex === -1) {
        throw new Error("Virtual card not found")
      }

      const card = virtualCardsState[cardIndex]
      const newSpending = card.currentSpending + parseFloat(amount)

      if (newSpending > card.spendingLimit) {
        throw new Error("Spending limit exceeded")
      }

      virtualCardsState[cardIndex] = {
        ...card,
        currentSpending: newSpending,
        lastUsed: new Date().toISOString()
      }

      return { ...virtualCardsState[cardIndex] }
    } catch (error) {
      throw new Error("Failed to record spending")
    }
  },

  getSpendingProgress(card) {
    return (card.currentSpending / card.spendingLimit) * 100
  },

  getRemainingBalance(card) {
    return card.spendingLimit - card.currentSpending
},

  async toggleFreeze(id) {
    await delay(400)
    try {
      const cardIndex = virtualCardsState.findIndex(c => c.Id === parseInt(id))
      if (cardIndex === -1) {
        throw new Error("Virtual card not found")
      }

      const card = virtualCardsState[cardIndex]
      virtualCardsState[cardIndex] = {
        ...card,
        isFrozen: !card.isFrozen
      }

      return { ...virtualCardsState[cardIndex] }
    } catch (error) {
      throw new Error("Failed to toggle card freeze status")
    }
  },

  async updateSpendingLimit(id, newLimit) {
    await delay(400)
    try {
      const cardIndex = virtualCardsState.findIndex(c => c.Id === parseInt(id))
      if (cardIndex === -1) {
        throw new Error("Virtual card not found")
      }

      const card = virtualCardsState[cardIndex]
      const limit = parseFloat(newLimit)
      
      if (limit <= 0) {
        throw new Error("Spending limit must be greater than 0")
      }

      if (limit < card.currentSpending) {
        throw new Error("New limit cannot be less than current spending")
      }

      virtualCardsState[cardIndex] = {
        ...card,
        spendingLimit: limit
      }

      return { ...virtualCardsState[cardIndex] }
    } catch (error) {
      throw new Error("Failed to update spending limit")
    }
  },

  async getTransactionHistory(cardId) {
    await delay(300)
    try {
      // Import transactions here to avoid circular dependency
      const { default: transactionData } = await import("@/services/mockData/transactions.json")
      
      // Filter transactions related to this virtual card
      const cardTransactions = transactionData.filter(transaction => 
        transaction.cardId === parseInt(cardId)
      )

      return cardTransactions.map(transaction => ({ ...transaction }))
    } catch (error) {
      throw new Error("Failed to load transaction history")
    }
  }
}

// Helper functions for card generation
function generateCardNumber() {
  const prefixes = ["4532", "5555", "4111", "4000"]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  let number = prefix
  
  for (let i = 0; i < 12; i++) {
    number += Math.floor(Math.random() * 10)
  }
  
  return number.replace(/(.{4})/g, '$1 ').trim()
}

function generateExpiryDate() {
  const currentYear = new Date().getFullYear()
  const year = currentYear + Math.floor(Math.random() * 5) + 1
  const month = Math.floor(Math.random() * 12) + 1
  return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
}

function generateCVV() {
  return Math.floor(Math.random() * 900 + 100).toString()
}