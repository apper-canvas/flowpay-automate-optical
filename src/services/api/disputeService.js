import transactionsData from "@/services/mockData/transactions.json";
import { format } from "date-fns";

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage for runtime data
let disputesState = [
  {
    Id: 1,
    transactionId: 101,
    type: "unauthorized",
    status: "investigating",
    title: "Unauthorized Transaction",
    description: "I did not authorize this payment to Unknown Merchant. This appears to be a fraudulent transaction.",
    amount: 850.00,
    currency: "USD",
    merchant: "Unknown Merchant",
    transactionDate: "2024-01-10T14:30:00Z",
    disputeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expectedResolution: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      {
        id: 1,
        name: "bank_statement.pdf",
        type: "pdf",
        size: "2.4 MB",
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    timeline: [
      {
        id: 1,
        action: "Dispute Filed",
        description: "Dispute case opened and assigned case number DSP-2024-001",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      },
      {
        id: 2,
        action: "Under Review",
        description: "Case assigned to fraud investigation team",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      },
      {
        id: 3,
        action: "Investigation in Progress",
        description: "Contacting merchant for transaction details",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: "current"
      }
    ],
    caseNumber: "DSP-2024-001",
    assignedAgent: "Sarah Johnson",
    priority: "high",
    category: "fraud"
  },
  {
    Id: 2,
    transactionId: 98,
    type: "billing_error",
    status: "resolved",
    title: "Incorrect Billing Amount",
    description: "I was charged twice for the same service. The duplicate charge should be refunded.",
    amount: 29.99,
    currency: "USD",
    merchant: "Netflix",
    transactionDate: "2024-01-08T09:15:00Z",
    disputeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolution: "Full refund processed. Duplicate charge was confirmed and reversed.",
    refundAmount: 29.99,
    documents: [],
    timeline: [
      {
        id: 1,
        action: "Dispute Filed",
        description: "Dispute case opened for duplicate billing",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      },
      {
        id: 2,
        action: "Merchant Contacted",
        description: "Reached out to Netflix for billing clarification",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      },
      {
        id: 3,
        action: "Resolution Approved",
        description: "Full refund authorized and processed",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      }
    ],
    caseNumber: "DSP-2024-002",
    assignedAgent: "Mike Chen",
    priority: "medium",
    category: "billing"
  }
]

let nextId = Math.max(...disputesState.map(d => d.Id), 0) + 1

export const disputeService = {
  async getAllDisputes() {
    await delay(300)
    try {
      // Sort by dispute date (newest first)
      const sorted = [...disputesState].sort((a, b) => new Date(b.disputeDate) - new Date(a.disputeDate))
      return sorted.map(dispute => ({ ...dispute }))
    } catch (error) {
      throw new Error("Failed to load disputes")
    }
  },

  async getDisputeById(id) {
    await delay(250)
    try {
      const dispute = disputesState.find(d => d.Id === parseInt(id))
      if (!dispute) {
        throw new Error("Dispute not found")
      }
      return { ...dispute }
    } catch (error) {
      throw new Error("Failed to load dispute")
    }
  },

  async getDisputesByStatus(status) {
    await delay(200)
    try {
      const filtered = disputesState.filter(d => d.status === status)
      return filtered.map(dispute => ({ ...dispute }))
    } catch (error) {
      throw new Error("Failed to load disputes by status")
    }
  },

  async getDisputesByTransactionId(transactionId) {
    await delay(200)
    try {
      const filtered = disputesState.filter(d => d.transactionId === parseInt(transactionId))
      return filtered.map(dispute => ({ ...dispute }))
    } catch (error) {
      throw new Error("Failed to load disputes for transaction")
    }
  },

  async createDispute(disputeData) {
    await delay(400)
    try {
      // Validate required fields
      if (!disputeData.transactionId || !disputeData.type || !disputeData.description) {
        throw new Error("Missing required dispute information")
      }

      // Check if transaction exists and is disputable
      const transaction = transactionsData.find(t => t.Id === disputeData.transactionId)
      if (!transaction) {
        throw new Error("Transaction not found")
      }

      // Check if dispute already exists for this transaction
      const existingDispute = disputesState.find(d => d.transactionId === disputeData.transactionId)
      if (existingDispute) {
        throw new Error("A dispute already exists for this transaction")
      }

      const caseNumber = `DSP-2024-${String(nextId).padStart(3, '0')}`
      
      const newDispute = {
        Id: nextId++,
        transactionId: disputeData.transactionId,
        type: disputeData.type,
        status: "pending",
        title: disputeData.title || `${disputeData.type.replace('_', ' ')} Dispute`,
        description: disputeData.description,
        amount: transaction.amount,
        currency: transaction.currency,
        merchant: transaction.recipient,
        transactionDate: transaction.timestamp,
        disputeDate: new Date().toISOString(),
        expectedResolution: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        timeline: [
          {
            id: 1,
            action: "Dispute Filed",
            description: `Dispute case opened and assigned case number ${caseNumber}`,
            timestamp: new Date().toISOString(),
            status: "completed"
          }
        ],
        caseNumber,
        assignedAgent: "Customer Service Team",
        priority: disputeData.amount > 500 ? "high" : disputeData.amount > 100 ? "medium" : "low",
        category: disputeData.type === "unauthorized" ? "fraud" : disputeData.type === "billing_error" ? "billing" : "general"
      }

      disputesState.unshift(newDispute) // Add to beginning for newest first
      return { ...newDispute }
    } catch (error) {
      throw new Error("Failed to create dispute: " + error.message)
    }
  },

  async updateDispute(id, updates) {
    await delay(350)
    try {
      const disputeIndex = disputesState.findIndex(d => d.Id === parseInt(id))
      if (disputeIndex === -1) {
        throw new Error("Dispute not found")
      }

      // Prevent updating certain fields
      const { Id, transactionId, disputeDate, caseNumber, ...allowedUpdates } = updates

      disputesState[disputeIndex] = {
        ...disputesState[disputeIndex],
        ...allowedUpdates
      }

      return { ...disputesState[disputeIndex] }
    } catch (error) {
      throw new Error("Failed to update dispute: " + error.message)
    }
  },

  async addDisputeDocument(disputeId, documentData) {
    await delay(300)
    try {
      const disputeIndex = disputesState.findIndex(d => d.Id === parseInt(disputeId))
      if (disputeIndex === -1) {
        throw new Error("Dispute not found")
      }

      const newDocument = {
        id: Date.now(),
        name: documentData.name,
        type: documentData.type || "unknown",
        size: documentData.size || "0 KB",
        uploadDate: new Date().toISOString()
      }

      disputesState[disputeIndex].documents.push(newDocument)

      // Add timeline entry
      const timelineEntry = {
        id: Date.now(),
        action: "Document Uploaded",
        description: `Document "${documentData.name}" added to case`,
        timestamp: new Date().toISOString(),
        status: "completed"
      }
      disputesState[disputeIndex].timeline.push(timelineEntry)

      return { ...disputesState[disputeIndex] }
    } catch (error) {
      throw new Error("Failed to add document: " + error.message)
    }
  },

  async removeDisputeDocument(disputeId, documentId) {
    await delay(250)
    try {
      const disputeIndex = disputesState.findIndex(d => d.Id === parseInt(disputeId))
      if (disputeIndex === -1) {
        throw new Error("Dispute not found")
      }

      const documentIndex = disputesState[disputeIndex].documents.findIndex(doc => doc.id === parseInt(documentId))
      if (documentIndex === -1) {
        throw new Error("Document not found")
      }

      const removedDocument = disputesState[disputeIndex].documents.splice(documentIndex, 1)[0]
      return { ...disputesState[disputeIndex] }
    } catch (error) {
      throw new Error("Failed to remove document: " + error.message)
    }
  },

  async addTimelineEntry(disputeId, entryData) {
    await delay(250)
    try {
      const disputeIndex = disputesState.findIndex(d => d.Id === parseInt(disputeId))
      if (disputeIndex === -1) {
        throw new Error("Dispute not found")
      }

      const newEntry = {
        id: Date.now(),
        action: entryData.action,
        description: entryData.description,
        timestamp: new Date().toISOString(),
        status: entryData.status || "completed"
      }

      disputesState[disputeIndex].timeline.push(newEntry)
      return { ...disputesState[disputeIndex] }
    } catch (error) {
      throw new Error("Failed to add timeline entry: " + error.message)
    }
  },

  async closeDispute(id, resolution, refundAmount = 0) {
    await delay(400)
    try {
      const disputeIndex = disputesState.findIndex(d => d.Id === parseInt(id))
      if (disputeIndex === -1) {
        throw new Error("Dispute not found")
      }

      const dispute = disputesState[disputeIndex]
      if (dispute.status === "resolved" || dispute.status === "closed") {
        throw new Error("Dispute is already closed")
      }

      disputesState[disputeIndex] = {
        ...dispute,
        status: "resolved",
        resolution,
        refundAmount,
        resolvedDate: new Date().toISOString()
      }

      // Add final timeline entry
      const timelineEntry = {
        id: Date.now(),
        action: "Dispute Resolved",
        description: resolution,
        timestamp: new Date().toISOString(),
        status: "completed"
      }
      disputesState[disputeIndex].timeline.push(timelineEntry)

      return { ...disputesState[disputeIndex] }
    } catch (error) {
      throw new Error("Failed to close dispute: " + error.message)
    }
  },

  async getDisputeAnalytics() {
    await delay(300)
    try {
      const total = disputesState.length
      const byStatus = disputesState.reduce((acc, dispute) => {
        acc[dispute.status] = (acc[dispute.status] || 0) + 1
        return acc
      }, {})
      
      const byType = disputesState.reduce((acc, dispute) => {
        acc[dispute.type] = (acc[dispute.type] || 0) + 1
        return acc
      }, {})

      const totalAmount = disputesState.reduce((sum, dispute) => sum + dispute.amount, 0)
      const resolvedAmount = disputesState
        .filter(d => d.status === "resolved" && d.refundAmount)
        .reduce((sum, d) => sum + d.refundAmount, 0)

      const avgResolutionTime = disputesState
        .filter(d => d.resolvedDate)
        .reduce((acc, d) => {
          const resolutionTime = new Date(d.resolvedDate) - new Date(d.disputeDate)
          return acc + (resolutionTime / (1000 * 60 * 60 * 24)) // Convert to days
        }, 0) / disputesState.filter(d => d.resolvedDate).length || 0

      return {
        total,
        byStatus,
        byType,
        totalAmount,
        resolvedAmount,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        successRate: total > 0 ? Math.round((byStatus.resolved || 0) / total * 100) : 0
      }
    } catch (error) {
      throw new Error("Failed to load dispute analytics")
    }
  },

  async searchDisputes(query) {
    await delay(200)
    try {
      const lowercaseQuery = query.toLowerCase()
      const filtered = disputesState.filter(dispute => 
        dispute.title.toLowerCase().includes(lowercaseQuery) ||
        dispute.description.toLowerCase().includes(lowercaseQuery) ||
        dispute.merchant.toLowerCase().includes(lowercaseQuery) ||
        dispute.caseNumber.toLowerCase().includes(lowercaseQuery)
      )

      return filtered.map(dispute => ({ ...dispute }))
    } catch (error) {
      throw new Error("Failed to search disputes")
    }
  },

  async canDisputeTransaction(transactionId) {
    await delay(100)
    try {
      const transaction = transactionsData.find(t => t.Id === parseInt(transactionId))
      if (!transaction) {
        return { canDispute: false, reason: "Transaction not found" }
      }

      // Check if already disputed
      const existingDispute = disputesState.find(d => d.transactionId === parseInt(transactionId))
      if (existingDispute) {
        return { canDispute: false, reason: "Transaction already disputed" }
      }

      // Check transaction age (disputes must be filed within 60 days)
      const transactionDate = new Date(transaction.timestamp)
      const daysSinceTransaction = (Date.now() - transactionDate) / (1000 * 60 * 60 * 24)
      
      if (daysSinceTransaction > 60) {
        return { canDispute: false, reason: "Dispute period expired (60 days)" }
      }

      // Check transaction status
      if (transaction.status !== "completed") {
        return { canDispute: false, reason: "Only completed transactions can be disputed" }
      }

      return { canDispute: true, reason: null }
    } catch (error) {
      throw new Error("Failed to check dispute eligibility")
    }
  }
}

export default disputeService