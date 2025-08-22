import contactData from "@/services/mockData/contacts.json"

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage for runtime data
let contactsState = [...contactData]

export const contactService = {
  async getAllContacts() {
    await delay(200)
    try {
      return [...contactsState]
    } catch (error) {
      throw new Error("Failed to load contacts")
    }
  },

  async getContactById(id) {
    await delay(150)
    try {
      const contact = contactsState.find(c => c.Id === parseInt(id))
      if (!contact) {
        throw new Error("Contact not found")
      }
      return { ...contact }
    } catch (error) {
      throw new Error("Failed to load contact")
    }
  },

  async getFrequentContacts() {
    await delay(150)
    try {
      return contactsState
        .filter(c => c.isFrequent)
        .sort((a, b) => {
          if (!a.lastTransactionDate) return 1
          if (!b.lastTransactionDate) return -1
          return new Date(b.lastTransactionDate) - new Date(a.lastTransactionDate)
        })
        .map(c => ({ ...c }))
    } catch (error) {
      throw new Error("Failed to load frequent contacts")
    }
  },

  async searchContacts(query) {
    await delay(100)
    try {
      if (!query) {
        return [...contactsState]
      }
      
      const searchTerm = query.toLowerCase()
      return contactsState.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.phone.includes(searchTerm)
      ).map(c => ({ ...c }))
    } catch (error) {
      throw new Error("Failed to search contacts")
    }
  },

  async addContact(contactData) {
    await delay(300)
    try {
      const newContact = {
        Id: Math.max(...contactsState.map(c => c.Id)) + 1,
        ...contactData,
        isFrequent: false,
        lastTransactionDate: null,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150`
      }
      
      contactsState.push(newContact)
      return { ...newContact }
    } catch (error) {
      throw new Error("Failed to add contact")
    }
  },

  async updateContactFrequency(contactId) {
    await delay(100)
    try {
      const contactIndex = contactsState.findIndex(c => c.Id === parseInt(contactId))
      if (contactIndex === -1) return
      
      contactsState[contactIndex] = {
        ...contactsState[contactIndex],
        isFrequent: true,
        lastTransactionDate: new Date().toISOString()
      }
      
      return { ...contactsState[contactIndex] }
    } catch (error) {
      throw new Error("Failed to update contact frequency")
    }
  }
}