import splitBillData from "@/services/mockData/splitBills.json";
import { contactService } from "@/services/api/contactService";

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage for runtime data
let splitBillsState = [...splitBillData]

export const splitBillService = {
  async getAllSplitBills() {
    await delay(300)
    try {
      return [...splitBillsState]
    } catch (error) {
      throw new Error("Failed to load split bills")
    }
  },

  async getSplitBillById(id) {
    await delay(250)
    try {
      const splitBill = splitBillsState.find(sb => sb.Id === parseInt(id))
      if (!splitBill) {
        throw new Error("Split bill not found")
      }
      return { ...splitBill }
    } catch (error) {
      throw new Error("Failed to load split bill")
    }
  },

  async getUserSplitBills(userId) {
    await delay(300)
    try {
      return splitBillsState
        .filter(sb => 
          sb.createdBy === parseInt(userId) || 
          sb.participants.some(p => p.contactId === parseInt(userId))
        )
        .map(sb => ({ ...sb }))
    } catch (error) {
      throw new Error("Failed to load user split bills")
    }
  },

async createSplitBill({ 
    title, 
    description, 
    category,
    totalAmount, 
    dueDate, 
    receiptPhoto,
    participantIds, 
    createdBy,
    splitMethod = "equal",
    splitData = {}
  }) {
    await delay(500)
    try {
      const amount = parseFloat(totalAmount)
      const participantCount = participantIds.length

      // Validate participants exist
      for (const contactId of participantIds) {
        try {
          await contactService.getContactById(contactId)
        } catch (error) {
          throw new Error(`Contact with ID ${contactId} not found`)
        }
      }

      // Calculate amounts based on split method
      let participants = []
      
      switch (splitMethod) {
        case "equal":
          const amountPerPerson = amount / participantCount
          participants = participantIds.map(contactId => ({
            contactId: parseInt(contactId),
            amountOwed: Math.round(amountPerPerson * 100) / 100,
            status: "pending",
            paidAt: null
          }))
          break
          
        case "custom":
          participants = participantIds.map(contactId => ({
            contactId: parseInt(contactId),
            amountOwed: Math.round((splitData.customAmounts[contactId] || 0) * 100) / 100,
            status: "pending",
            paidAt: null
          }))
          break
          
        case "percentage":
          participants = participantIds.map(contactId => ({
            contactId: parseInt(contactId),
            amountOwed: Math.round((amount * (splitData.percentages[contactId] / 100)) * 100) / 100,
            status: "pending",
            paidAt: null
          }))
          break
          
        case "itemized":
          const participantTotals = {}
          splitData.lineItems.forEach(item => {
            const itemCost = item.amount / item.participants.length
            item.participants.forEach(participantId => {
              participantTotals[participantId] = (participantTotals[participantId] || 0) + itemCost
            })
          })
          
          participants = participantIds.map(contactId => ({
            contactId: parseInt(contactId),
            amountOwed: Math.round((participantTotals[contactId] || 0) * 100) / 100,
            status: "pending",
            paidAt: null
          }))
          break
      }

      const newSplitBill = {
        Id: Math.max(...splitBillsState.map(sb => sb.Id), 0) + 1,
        title: title.trim(),
        description: description.trim(),
        category: category || null,
        totalAmount: amount,
        currency: "USD",
        splitMethod,
        splitData,
        receiptPhoto: receiptPhoto || null,
        createdBy: parseInt(createdBy),
        createdAt: new Date().toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        status: "active",
        participants,
        remindersSent: [],
        lastReminderDate: null
      }

      splitBillsState.unshift(newSplitBill)
      return { ...newSplitBill }
    } catch (error) {
      throw new Error("Failed to create split bill: " + error.message)
    }
  },

  async updateSplitBill(id, updates) {
    await delay(400)
    try {
      const splitBillIndex = splitBillsState.findIndex(sb => sb.Id === parseInt(id))
      if (splitBillIndex === -1) {
        throw new Error("Split bill not found")
      }

      splitBillsState[splitBillIndex] = {
        ...splitBillsState[splitBillIndex],
        ...updates
      }

      return { ...splitBillsState[splitBillIndex] }
    } catch (error) {
      throw new Error("Failed to update split bill")
    }
  },

  async markParticipantAsPaid(splitBillId, contactId) {
    await delay(400)
    try {
      const splitBillIndex = splitBillsState.findIndex(sb => sb.Id === parseInt(splitBillId))
      if (splitBillIndex === -1) {
        throw new Error("Split bill not found")
      }

      const splitBill = splitBillsState[splitBillIndex]
      const participantIndex = splitBill.participants.findIndex(p => p.contactId === parseInt(contactId))
      if (participantIndex === -1) {
        throw new Error("Participant not found in split bill")
      }

      splitBill.participants[participantIndex] = {
        ...splitBill.participants[participantIndex],
        status: "paid",
        paidAt: new Date().toISOString()
      }

      // Check if all participants have paid
      const allPaid = splitBill.participants.every(p => p.status === "paid")
      if (allPaid) {
        splitBill.status = "settled"
      }

      splitBillsState[splitBillIndex] = splitBill
      return { ...splitBill }
    } catch (error) {
      throw new Error("Failed to mark participant as paid")
    }
  },

  async deleteSplitBill(id) {
    await delay(300)
    try {
      const splitBillIndex = splitBillsState.findIndex(sb => sb.Id === parseInt(id))
      if (splitBillIndex === -1) {
        throw new Error("Split bill not found")
      }

      const deletedSplitBill = splitBillsState.splice(splitBillIndex, 1)[0]
      return { ...deletedSplitBill }
    } catch (error) {
      throw new Error("Failed to delete split bill")
    }
  },

  async getSplitBillStats() {
    await delay(200)
    try {
      const totalBills = splitBillsState.length
      const activeBills = splitBillsState.filter(sb => sb.status === "active").length
      const settledBills = splitBillsState.filter(sb => sb.status === "settled").length
      
      const totalOwed = splitBillsState
        .filter(sb => sb.status === "active")
        .reduce((sum, sb) => {
          const pendingAmount = sb.participants
            .filter(p => p.status === "pending")
            .reduce((pSum, p) => pSum + p.amountOwed, 0)
          return sum + pendingAmount
        }, 0)

      return {
        totalBills,
        activeBills,
        settledBills,
        totalOwed: Math.round(totalOwed * 100) / 100
      }
    } catch (error) {
      throw new Error("Failed to load split bill statistics")
    }
  },

  async getParticipantDetails(participantIds) {
    await delay(200)
    try {
      const participants = []
      for (const contactId of participantIds) {
        try {
          const contact = await contactService.getContactById(contactId)
          participants.push(contact)
        } catch (error) {
          // Skip invalid contacts
          console.warn(`Contact ${contactId} not found`)
        }
      }
      return participants
    } catch (error) {
      throw new Error("Failed to load participant details")
    }
  },

async sendPaymentReminder(splitBillId, contactId) {
    await delay(300)
    try {
      const splitBillIndex = splitBillsState.findIndex(sb => sb.Id === parseInt(splitBillId))
      if (splitBillIndex === -1) {
        throw new Error("Split bill not found")
      }

      const splitBill = splitBillsState[splitBillIndex]
      const participant = splitBill.participants.find(p => p.contactId === parseInt(contactId))
      if (!participant) {
        throw new Error("Participant not found")
      }

      if (participant.status === "paid") {
        throw new Error("Participant has already paid")
      }

      // Update reminder tracking
      const now = new Date().toISOString()
      splitBill.remindersSent = splitBill.remindersSent || []
      splitBill.remindersSent.push({
        contactId: parseInt(contactId),
        sentAt: now,
        type: 'payment_reminder'
      })
      splitBill.lastReminderDate = now

      splitBillsState[splitBillIndex] = splitBill

      // In a real app, this would integrate with notification service
      return {
        success: true,
        message: "Payment reminder sent successfully",
        reminderCount: splitBill.remindersSent.filter(r => r.contactId === parseInt(contactId)).length
      }
    } catch (error) {
      throw new Error("Failed to send payment reminder: " + error.message)
    }
  },

  async getSettlementSummary(splitBillId) {
    await delay(200)
    try {
      const splitBill = splitBillsState.find(sb => sb.Id === parseInt(splitBillId))
      if (!splitBill) {
        throw new Error("Split bill not found")
      }

      const totalPaid = splitBill.participants
        .filter(p => p.status === "paid")
        .reduce((sum, p) => sum + p.amountOwed, 0)
      
      const totalPending = splitBill.participants
        .filter(p => p.status === "pending")
        .reduce((sum, p) => sum + p.amountOwed, 0)

      const paidParticipants = splitBill.participants.filter(p => p.status === "paid").length
      const pendingParticipants = splitBill.participants.filter(p => p.status === "pending").length

      return {
        splitBillId: splitBill.Id,
        title: splitBill.title,
        totalAmount: splitBill.totalAmount,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalPending: Math.round(totalPending * 100) / 100,
        paidParticipants,
        pendingParticipants,
        isFullySettled: splitBill.status === "settled",
        remindersSent: splitBill.remindersSent?.length || 0,
        lastReminderDate: splitBill.lastReminderDate
      }
    } catch (error) {
      throw new Error("Failed to get settlement summary: " + error.message)
    }
  },

  async getSplitBillsByCategory() {
    await delay(200)
    try {
      const categorySummary = splitBillsState.reduce((acc, bill) => {
        const category = bill.category || "Uncategorized"
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            totalAmount: 0,
            activeBills: 0,
            settledBills: 0
          }
        }
        acc[category].count++
        acc[category].totalAmount += bill.totalAmount
        if (bill.status === "active") acc[category].activeBills++
        if (bill.status === "settled") acc[category].settledBills++
        return acc
      }, {})

      return categorySummary
    } catch (error) {
      throw new Error("Failed to get split bills by category: " + error.message)
    }
  }
}