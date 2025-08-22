import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { contactService } from "@/services/api/contactService"

const ContactPicker = ({ onSelect, selectedContact }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [frequentContacts, setFrequentContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadContacts = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [allContacts, frequent] = await Promise.all([
        contactService.getAllContacts(),
        contactService.getFrequentContacts()
      ])
      
      setContacts(allContacts)
      setFilteredContacts(allContacts)
      setFrequentContacts(frequent)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    const searchContacts = async () => {
      if (!searchQuery.trim()) {
        setFilteredContacts(contacts)
        return
      }
      
      try {
        const results = await contactService.searchContacts(searchQuery)
        setFilteredContacts(results)
      } catch (err) {
        console.error("Search failed:", err.message)
      }
    }
    
    const timeoutId = setTimeout(searchContacts, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, contacts])

  const ContactItem = ({ contact, isFrequent = false }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(contact)}
      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        selectedContact?.Id === contact.Id
          ? "bg-primary/10 border border-primary"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
        {contact.avatar ? (
          <img 
            src={contact.avatar} 
            alt={contact.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <ApperIcon name="User" size={18} className="text-primary" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-gray-900 text-sm truncate">
            {contact.name}
          </p>
          {isFrequent && (
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {contact.email}
        </p>
      </div>
      
      {selectedContact?.Id === contact.Id && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <ApperIcon name="Check" size={12} className="text-white" />
        </div>
      )}
    </motion.div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      
      {!searchQuery && frequentContacts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Recent
          </h3>
          <div className="space-y-2">
            {frequentContacts.slice(0, 3).map((contact) => (
              <ContactItem 
                key={contact.Id} 
                contact={contact} 
                isFrequent={true}
              />
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {searchQuery ? "Search Results" : "All Contacts"}
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactItem 
                key={contact.Id} 
                contact={contact}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <ApperIcon name="UserX" size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {searchQuery ? "No contacts found" : "No contacts available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactPicker