import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { splitBillService } from "@/services/api/splitBillService";
import { contactService } from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import ContactPicker from "@/components/molecules/ContactPicker";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";

const SplitBillPage = () => {
  const navigate = useNavigate()
  const [view, setView] = useState("list") // list, create, details
  const [step, setStep] = useState(1) // 1: Details, 2: Participants, 3: Split Method, 4: Confirm
  const [splitBills, setSplitBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Create form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [receiptPhoto, setReceiptPhoto] = useState(null)
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [participantDetails, setParticipantDetails] = useState([])
  const [splitMethod, setSplitMethod] = useState("equal") // equal, custom, percentage, itemized
  const [customAmounts, setCustomAmounts] = useState({})
  const [percentages, setPercentages] = useState({})
  const [lineItems, setLineItems] = useState([])
  const [selectedBillId, setSelectedBillId] = useState(null)

  // Categories for expense tracking
  const expenseCategories = [
    "Food & Dining", "Transportation", "Entertainment", "Shopping", 
    "Travel", "Utilities", "Healthcare", "Education", "Other"
  ]
  const loadSplitBills = async () => {
    try {
      setLoading(true)
      setError("")
      const bills = await splitBillService.getAllSplitBills()
      setSplitBills(bills)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadParticipantDetails = async () => {
    if (selectedParticipants.length === 0) return
    try {
      const details = []
      for (const participant of selectedParticipants) {
        const contact = await contactService.getContactById(participant.Id)
        details.push(contact)
      }
      setParticipantDetails(details)
    } catch (err) {
      toast.error("Failed to load participant details")
    }
  }

  useEffect(() => {
    loadSplitBills()
  }, [])

  useEffect(() => {
    if (step === 3) {
      loadParticipantDetails()
    }
  }, [step, selectedParticipants])

const handleCreateSplitBill = async () => {
    if (!title.trim() || !totalAmount || selectedParticipants.length === 0) return

    try {
      setSubmitting(true)
      
      const participantIds = selectedParticipants.map(p => p.Id)
      
      // Prepare split data based on method
      let splitData = {}
      
      if (splitMethod === "custom") {
        splitData = { customAmounts }
      } else if (splitMethod === "percentage") {
        splitData = { percentages }
      } else if (splitMethod === "itemized") {
        splitData = { lineItems }
      }

      const newSplitBill = await splitBillService.createSplitBill({
        title,
        description,
        category,
        totalAmount,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        receiptPhoto,
        participantIds,
        createdBy: 1, // Current user ID
        splitMethod,
        splitData
      })

      toast.success("Split bill created successfully!")
      resetForm()
      setView("list")
      loadSplitBills()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsPaid = async (splitBillId, contactId) => {
    try {
      await splitBillService.markParticipantAsPaid(splitBillId, contactId)
      toast.success("Payment marked as received!")
      loadSplitBills()
    } catch (err) {
      toast.error(err.message)
    }
  }
const handleSendReminder = async (splitBillId, contactId) => {
    try {
      await splitBillService.sendPaymentReminder(splitBillId, contactId)
      toast.success("Payment reminder sent!")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory("")
    setTotalAmount("")
    setDueDate("")
    setReceiptPhoto(null)
    setSelectedParticipants([])
    setParticipantDetails([])
    setSplitMethod("equal")
    setCustomAmounts({})
    setPercentages({})
    setLineItems([])
    setStep(1)
  }

  const handleNext = () => {
    if (step === 1 && title.trim() && totalAmount && parseFloat(totalAmount) > 0) {
      setStep(2)
    } else if (step === 2 && selectedParticipants.length > 0) {
      setStep(3)
    } else if (step === 3) {
      setStep(4)
    }
  }

const handleBack = () => {
    if (step === 1) {
      setView("list")
      resetForm()
    } else {
      setStep(step - 1)
    }
  }

  const handleReceiptUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB")
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setReceiptPhoto(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", amount: 0, participants: [] }])
  }

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems]
    updated[index][field] = value
    setLineItems(updated)
  }

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const calculateSplit = () => {
    const amount = parseFloat(totalAmount)
    if (!amount || selectedParticipants.length === 0) return {}

    switch (splitMethod) {
      case "equal":
        return selectedParticipants.reduce((acc, p) => {
          acc[p.Id] = amount / selectedParticipants.length
          return acc
        }, {})
      case "custom":
        return customAmounts
      case "percentage":
        return Object.keys(percentages).reduce((acc, id) => {
          acc[id] = (amount * (percentages[id] / 100))
          return acc
        }, {})
      case "itemized":
        return selectedParticipants.reduce((acc, p) => {
          acc[p.Id] = lineItems.reduce((sum, item) => {
            return item.participants.includes(p.Id) ? sum + (item.amount / item.participants.length) : sum
          }, 0)
          return acc
        }, {})
      default:
        return {}
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "warning"
      case "settled": return "success"
      default: return "default"
    }
  }
const getStepTitle = () => {
    switch (step) {
      case 1: return "Split Bill Details"
      case 2: return "Add Participants"
      case 3: return "Split Method"
      case 4: return "Confirm & Send"
      default: return "Create Split Bill"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <Button variant="ghost" size="sm" onClick={() => view === "list" ? navigate("/payments") : handleBack()}>
            <ApperIcon name="ArrowLeft" size={18} />
          </Button>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            {view === "list" ? "Split Bills" : getStepTitle()}
          </h1>
        </motion.div>
      </div>

      {view === "list" && (
        <>
          {/* Create Button */}
          <div className="px-4 mb-6">
            <Button onClick={() => setView("create")} className="w-full">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create Split Bill
            </Button>
          </div>

          {/* Split Bills List */}
          <div className="px-4">
            {error ? (
              <Error message={error} onRetry={loadSplitBills} />
            ) : splitBills.length > 0 ? (
              <div className="space-y-4">
                {splitBills.map((bill, index) => (
                  <motion.div
                    key={bill.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card padding="lg">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-display font-semibold text-gray-900">
                                {bill.title}
                              </h3>
                              <Badge variant={getStatusColor(bill.status)} size="xs">
                                {bill.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {bill.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{formatAmount(bill.totalAmount)}</span>
                              <span>•</span>
                              <span>{bill.participants.length} people</span>
                              <span>•</span>
                              <span>Due {format(new Date(bill.dueDate), "MMM dd")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Participants */}
<div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700">Participants</h4>
                          <div className="space-y-2">
                            {bill.participants.map((participant, pIndex) => (
                              <div key={pIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <ApperIcon name="User" size={12} className="text-gray-600" />
                                  </div>
                                  <span className="text-sm text-gray-700">Contact {participant.contactId}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatAmount(participant.amountOwed)}
                                  </span>
                                  {participant.status === "pending" ? (
                                    <div className="flex space-x-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSendReminder(bill.Id, participant.contactId)}
                                      >
                                        <ApperIcon name="Bell" size={12} className="mr-1" />
                                        Remind
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleMarkAsPaid(bill.Id, participant.contactId)}
                                      >
                                        <ApperIcon name="Check" size={12} className="mr-1" />
                                        Mark Paid
                                      </Button>
                                    </div>
                                  ) : (
                                    <Badge variant="success" size="xs">Paid</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Additional bill details */}
                        {bill.category && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Category</span>
                              <Badge variant="default" size="xs">{bill.category}</Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Empty
                title="No split bills yet"
                message="Create your first split bill to start sharing expenses with friends."
                icon="Users"
                action={
                  <Button onClick={() => setView("create")}>
                    <ApperIcon name="Plus" size={16} className="mr-2" />
                    Create Split Bill
                  </Button>
                }
              />
            )}
          </div>
        </>
      )}

      {view === "create" && (
        <>
{/* Step Indicator */}
          <div className="px-4 mb-6">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex-1 h-2 rounded-full ${
                    stepNumber <= step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-4">
            <Card variant="default" padding="lg">
              {/* Step 1: Bill Details */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bill Title
                    </label>
                    <Input
                      placeholder="e.g., Team Dinner, Weekend Trip"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <Input
                      placeholder="Add more details about this expense"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full"
                    />
                  </div>
<div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 px-4 py-3 text-sm border border-gray-200 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select category</option>
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Receipt Photo (Optional)
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="flex items-center justify-center w-full h-12 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors"
                      >
                        <ApperIcon name="Camera" size={16} className="mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {receiptPhoto ? "Change receipt" : "Upload receipt"}
                        </span>
                      </label>
                      {receiptPhoto && (
                        <div className="relative">
                          <img
                            src={receiptPhoto}
                            alt="Receipt"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setReceiptPhoto(null)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date (Optional)
                    </label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button 
                    onClick={handleNext}
                    disabled={!title.trim() || !totalAmount || parseFloat(totalAmount) <= 0}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Add Participants */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Who will split this bill?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select people to include in this split bill. Each person will owe{" "}
                      {totalAmount && selectedParticipants.length > 0
                        ? formatAmount(parseFloat(totalAmount) / selectedParticipants.length)
                        : "$0.00"}
                    </p>
                  </div>

                  <ContactPicker
                    onSelect={(contact) => {
                      const isSelected = selectedParticipants.some(p => p.Id === contact.Id)
                      if (isSelected) {
                        setSelectedParticipants(prev => prev.filter(p => p.Id !== contact.Id))
                      } else {
                        setSelectedParticipants(prev => [...prev, contact])
                      }
                    }}
                    selectedContact={null}
                    multiSelect={true}
                    selectedContacts={selectedParticipants}
                  />

                  {selectedParticipants.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Selected Participants ({selectedParticipants.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedParticipants.map((participant) => (
                          <div key={participant.Id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <ApperIcon name="User" size={12} className="text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-700">{participant.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatAmount(parseFloat(totalAmount) / selectedParticipants.length)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleNext}
                    disabled={selectedParticipants.length === 0}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </motion.div>
              )}
{/* Step 3: Split Method */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      How would you like to split {formatAmount(totalAmount)}?
                    </h3>
                  </div>

                  {/* Split method selection */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "equal", label: "Equal Split", icon: "Users" },
                      { key: "custom", label: "Custom Amounts", icon: "Calculator" },
                      { key: "percentage", label: "Percentage", icon: "Percent" },
                      { key: "itemized", label: "Line Items", icon: "List" }
                    ].map(method => (
                      <button
                        key={method.key}
                        onClick={() => setSplitMethod(method.key)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          splitMethod === method.key
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <ApperIcon name={method.icon} size={24} className={
                            splitMethod === method.key ? "text-primary" : "text-gray-500"
                          } />
                          <span className={`text-sm font-medium ${
                            splitMethod === method.key ? "text-primary" : "text-gray-700"
                          }`}>
                            {method.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom amounts input */}
                  {splitMethod === "custom" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700">Enter custom amounts:</h4>
                      {selectedParticipants.map(participant => (
                        <div key={participant.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{participant.name}</span>
                          <div className="w-24">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={customAmounts[participant.Id] || ""}
                              onChange={(e) => setCustomAmounts({
                                ...customAmounts,
                                [participant.Id]: parseFloat(e.target.value) || 0
                              })}
                              size="sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Percentage split */}
                  {splitMethod === "percentage" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700">Enter percentages (must total 100%):</h4>
                      {selectedParticipants.map(participant => (
                        <div key={participant.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{participant.name}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16">
                              <Input
                                type="number"
                                placeholder="0"
                                value={percentages[participant.Id] || ""}
                                onChange={(e) => setPercentages({
                                  ...percentages,
                                  [participant.Id]: parseFloat(e.target.value) || 0
                                })}
                                size="sm"
                              />
                            </div>
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Itemized split */}
                  {splitMethod === "itemized" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">Line items:</h4>
                        <Button size="sm" variant="ghost" onClick={addLineItem}>
                          <ApperIcon name="Plus" size={14} className="mr-1" />
                          Add Item
                        </Button>
                      </div>
                      
                      {lineItems.map((item, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Item description"
                              value={item.description}
                              onChange={(e) => updateLineItem(index, "description", e.target.value)}
                              className="flex-1 mr-3"
                              size="sm"
                            />
                            <div className="w-24 mr-2">
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={item.amount}
                                onChange={(e) => updateLineItem(index, "amount", parseFloat(e.target.value) || 0)}
                                size="sm"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLineItem(index)}
                            >
                              <ApperIcon name="X" size={14} />
                            </Button>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2">Who shares this item?</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedParticipants.map(participant => (
                              <button
                                key={participant.Id}
                                onClick={() => {
                                  const participants = item.participants.includes(participant.Id)
                                    ? item.participants.filter(id => id !== participant.Id)
                                    : [...item.participants, participant.Id]
                                  updateLineItem(index, "participants", participants)
                                }}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  item.participants.includes(participant.Id)
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {participant.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    onClick={handleNext}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </motion.div>
              )}

              {/* Step 4: Confirm */}
{step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      Review split bill details
                    </h3>
                  </div>

                  <Card variant="default" padding="default" className="bg-gray-50">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Title</span>
                        <span className="text-sm font-semibold text-gray-900">{title}</span>
                      </div>
                      
                      {description && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Description</span>
                          <span className="text-sm font-semibold text-gray-900 max-w-[200px] text-right">
                            {description}
                          </span>
                        </div>
                      )}

                      {category && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Category</span>
                          <span className="text-sm font-semibold text-gray-900">{category}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatAmount(totalAmount)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Participants</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedParticipants.length} people
                        </span>
                      </div>
                      
                      <hr className="border-gray-200" />
                      
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">Split Method</span>
                        <span className="text-base font-bold text-gray-900">
                          {splitMethod === "equal" ? "Equal Split" :
                           splitMethod === "custom" ? "Custom Amounts" :
                           splitMethod === "percentage" ? "Percentage Split" :
                           "Itemized Split"}
                        </span>
                      </div>

                      {/* Show participant breakdown */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700">Amount breakdown:</h4>
                        {selectedParticipants.map(participant => {
                          const splits = calculateSplit()
                          const amount = splits[participant.Id] || 0
                          return (
                            <div key={participant.Id} className="flex justify-between text-sm">
                              <span className="text-gray-600">{participant.name}</span>
                              <span className="font-semibold text-gray-900">{formatAmount(amount)}</span>
                            </div>
                          )
                        })}
</div>
                    </div>
                  </Card>

                  <Button
                    onClick={handleCreateSplitBill}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Split Bill"
                    )}
                  </Button>
                </motion.div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default SplitBillPage