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

  async createSplitBill({ title, description, totalAmount, dueDate, participantIds, createdBy }) {
    await delay(500)
    try {
      const amount = parseFloat(totalAmount)
      const participantCount = participantIds.length
      const amountPerPerson = amount / participantCount

      // Validate participants exist
      for (const contactId of participantIds) {
        try {
          await contactService.getContactById(contactId)
        } catch (error) {
          throw new Error(`Contact with ID ${contactId} not found`)
        }
      }

      const newSplitBill = {
        Id: Math.max(...splitBillsState.map(sb => sb.Id), 0) + 1,
        title: title.trim(),
        description: description.trim(),
        totalAmount: amount,
        currency: "USD",
        splitMethod: "equal",
        createdBy: parseInt(createdBy),
        createdAt: new Date().toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        status: "active",
        participants: participantIds.map(contactId => ({
          contactId: parseInt(contactId),
          amountOwed: Math.round(amountPerPerson * 100) / 100,
          status: "pending",
          paidAt: null
        }))
      }

      splitBillsState.unshift(newSplitBill)
      return { ...newSplitBill }
    } catch (error) {
      throw new Error("Failed to create split bill")
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
      const splitBill = splitBillsState.find(sb => sb.Id === parseInt(splitBillId))
      if (!splitBill) {
        throw new Error("Split bill not found")
      }

      const participant = splitBill.participants.find(p => p.contactId === parseInt(contactId))
      if (!participant) {
        throw new Error("Participant not found")
      }

      if (participant.status === "paid") {
        throw new Error("Participant has already paid")
      }

      // In a real app, this would send an actual notification/email
      return {
        success: true,
        message: "Payment reminder sent successfully"
      }
    } catch (error) {
      throw new Error("Failed to send payment reminder")
    }
  }
}