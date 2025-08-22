import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { format, formatDistanceToNow } from "date-fns";
import disputeService from "@/services/api/disputeService";
import transactionsData from "@/services/mockData/transactions.json";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";

const DisputePage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState(id ? "details" : "center")
  const [disputes, setDisputes] = useState([])
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [showNewDisputeModal, setShowNewDisputeModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [newDisputeForm, setNewDisputeForm] = useState({
    transactionId: "",
    type: "unauthorized",
    title: "",
    description: "",
    documents: []
  })

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      if (id) {
        const dispute = await disputeService.getDisputeById(id)
        setSelectedDispute(dispute)
        setActiveTab("details")
      } else {
        const [disputesList, analyticsData] = await Promise.all([
          disputeService.getAllDisputes(),
          disputeService.getDisputeAnalytics()
        ])
        setDisputes(disputesList)
        setAnalytics(analyticsData)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleCreateDispute = async () => {
    try {
      if (!newDisputeForm.transactionId || !newDisputeForm.description) {
        toast.error("Please fill in all required fields")
        return
      }

      // Check if transaction can be disputed
      const eligibility = await disputeService.canDisputeTransaction(newDisputeForm.transactionId)
      if (!eligibility.canDispute) {
        toast.error(eligibility.reason)
        return
      }

      const dispute = await disputeService.createDispute(newDisputeForm)
      
      // Add documents if any
      for (const doc of newDisputeForm.documents) {
        await disputeService.addDisputeDocument(dispute.Id, doc)
      }

      toast.success(`Dispute case ${dispute.caseNumber} created successfully`)
      setShowNewDisputeModal(false)
      setNewDisputeForm({
        transactionId: "",
        type: "unauthorized", 
        title: "",
        description: "",
        documents: []
      })
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleFileUpload = (disputeId = null) => {
    // Mock file upload
    const mockFile = {
      name: `evidence_${Date.now()}.pdf`,
      type: "pdf",
      size: "1.2 MB"
    }

    if (disputeId) {
      // Add to existing dispute
      disputeService.addDisputeDocument(disputeId, mockFile)
        .then(() => {
          toast.success("Document uploaded successfully")
          loadData()
        })
        .catch(err => toast.error(err.message))
    } else {
      // Add to new dispute form
      setNewDisputeForm(prev => ({
        ...prev,
        documents: [...prev.documents, mockFile]
      }))
      toast.success("Document added to dispute")
    }
  }

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = !searchQuery || 
      dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.merchant.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || dispute.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "warning"
      case "investigating": return "info"
      case "resolved": return "success"
      case "closed": return "default"
      default: return "default"
    }
  }

  const getDisputeTypeIcon = (type) => {
    switch (type) {
      case "unauthorized": return "AlertTriangle"
      case "billing_error": return "Receipt"
      case "service_not_received": return "Package"
      case "duplicate_charge": return "Copy"
      case "cancelled_subscription": return "XCircle"
      default: return "FileText"
    }
  }

  const getTimelineIcon = (action) => {
    switch (action) {
      case "Dispute Filed": return "FileText"
      case "Under Review": return "Search"
      case "Investigation in Progress": return "Activity"
      case "Document Uploaded": return "Upload"
      case "Merchant Contacted": return "Phone"
      case "Resolution Approved": return "CheckCircle"
      case "Dispute Resolved": return "Check"
      default: return "Circle"
    }
  }

  const DisputeCenter = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="lg">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-gray-900 mb-1">
                {analytics.total}
              </p>
              <p className="text-gray-600 text-sm">Total Disputes</p>
            </div>
          </Card>
          
          <Card padding="lg">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-info mb-1">
                {analytics.byStatus.investigating || 0}
              </p>
              <p className="text-gray-600 text-sm">Investigating</p>
            </div>
          </Card>
          
          <Card padding="lg">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-success mb-1">
                {analytics.byStatus.resolved || 0}
              </p>
              <p className="text-gray-600 text-sm">Resolved</p>
            </div>
          </Card>
          
          <Card padding="lg">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-primary mb-1">
                {analytics.successRate}%
              </p>
              <p className="text-gray-600 text-sm">Success Rate</p>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <ApperIcon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search disputes by case number, merchant, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <Button
            onClick={() => setShowNewDisputeModal(true)}
            className="whitespace-nowrap"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            File Dispute
          </Button>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.length === 0 ? (
          <Empty
            title="No disputes found"
            message={searchQuery || filterStatus !== "all" ? 
              "No disputes match your search criteria." : 
              "You haven't filed any disputes yet."}
            icon="FileText"
            actionLabel="File Your First Dispute"
            onAction={() => setShowNewDisputeModal(true)}
          />
        ) : (
          filteredDisputes.map((dispute) => (
            <Card key={dispute.Id} padding="lg" className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/more/disputes/${dispute.Id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <ApperIcon 
                      name={getDisputeTypeIcon(dispute.type)} 
                      size={20} 
                      className="text-gray-600" 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {dispute.title}
                      </h3>
                      <Badge variant={getStatusColor(dispute.status)} size="xs">
                        {dispute.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {dispute.merchant} • ${dispute.amount.toFixed(2)} • {dispute.caseNumber}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      Filed {formatDistanceToNow(new Date(dispute.disputeDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  const DisputeDetails = () => {
    if (!selectedDispute) return null

    return (
      <div className="space-y-6">
        {/* Dispute Header */}
        <Card padding="lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-display font-bold text-gray-900">
                  {selectedDispute.title}
                </h2>
                <Badge variant={getStatusColor(selectedDispute.status)} size="md">
                  {selectedDispute.status}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Case Number:</span> {selectedDispute.caseNumber}</p>
                <p><span className="font-medium">Amount:</span> ${selectedDispute.amount.toFixed(2)}</p>
                <p><span className="font-medium">Merchant:</span> {selectedDispute.merchant}</p>
                <p><span className="font-medium">Transaction Date:</span> {format(new Date(selectedDispute.transactionDate), "MMM dd, yyyy")}</p>
                {selectedDispute.expectedResolution && (
                  <p><span className="font-medium">Expected Resolution:</span> {format(new Date(selectedDispute.expectedResolution), "MMM dd, yyyy")}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-700">{selectedDispute.description}</p>
          </div>
          
          {selectedDispute.resolution && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-green-800 mb-2">Resolution</h4>
              <p className="text-sm text-green-700">{selectedDispute.resolution}</p>
              {selectedDispute.refundAmount > 0 && (
                <p className="text-sm text-green-700 mt-2">
                  <span className="font-medium">Refund Amount:</span> ${selectedDispute.refundAmount.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Documents */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-gray-900">
              Supporting Documents
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFileUpload(selectedDispute.Id)}
              disabled={selectedDispute.status === "resolved" || selectedDispute.status === "closed"}
            >
              <ApperIcon name="Upload" size={16} className="mr-2" />
              Upload Document
            </Button>
          </div>
          
          {selectedDispute.documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ApperIcon name="FileText" size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDispute.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="FileText" size={18} className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.size} • Uploaded {formatDistanceToNow(new Date(doc.uploadDate), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="Download" size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="Trash2" size={14} className="text-error" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Timeline */}
        <Card padding="lg">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Case Timeline
          </h3>
          
          <div className="space-y-4">
            {selectedDispute.timeline.map((entry, index) => (
              <div key={entry.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entry.status === "current" ? "bg-primary text-white" :
                  entry.status === "completed" ? "bg-success text-white" :
                  "bg-gray-200 text-gray-600"
                }`}>
                  <ApperIcon name={getTimelineIcon(entry.action)} size={14} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-sm">{entry.action}</h4>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  const NewDisputeModal = () => (
    <AnimatePresence>
      {showNewDisputeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewDisputeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-display font-bold text-gray-900 mb-6">
              File New Dispute
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Transaction ID *"
                placeholder="Enter transaction ID (e.g., 101)"
                value={newDisputeForm.transactionId}
                onChange={(e) => setNewDisputeForm({...newDisputeForm, transactionId: e.target.value})}
              />
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Dispute Type *
                </label>
                <select
                  value={newDisputeForm.type}
                  onChange={(e) => setNewDisputeForm({...newDisputeForm, type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="unauthorized">Unauthorized Transaction</option>
                  <option value="billing_error">Billing Error</option>
                  <option value="service_not_received">Service Not Received</option>
                  <option value="duplicate_charge">Duplicate Charge</option>
                  <option value="cancelled_subscription">Cancelled Subscription</option>
                </select>
              </div>
              
              <Input
                label="Title"
                placeholder="Brief description of the issue"
                value={newDisputeForm.title}
                onChange={(e) => setNewDisputeForm({...newDisputeForm, title: e.target.value})}
              />
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Description *
                </label>
                <textarea
                  value={newDisputeForm.description}
                  onChange={(e) => setNewDisputeForm({...newDisputeForm, description: e.target.value})}
                  placeholder="Provide detailed information about the dispute..."
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              
              {/* Documents */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Supporting Documents
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileUpload()}
                  >
                    <ApperIcon name="Plus" size={14} className="mr-1" />
                    Add
                  </Button>
                </div>
                
                {newDisputeForm.documents.length > 0 && (
                  <div className="space-y-2">
                    {newDisputeForm.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{doc.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewDisputeForm(prev => ({
                            ...prev,
                            documents: prev.documents.filter((_, i) => i !== index)
                          }))}
                        >
                          <ApperIcon name="X" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowNewDisputeModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDispute}
                className="flex-1"
              >
                File Dispute
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const tabs = [
    { id: "center", label: "Dispute Center", icon: "FileText" },
    { id: "details", label: "Case Details", icon: "Info" }
  ]

  if (loading) {
    return <Loading type="disputes" />
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadData}
        title="Failed to load dispute information"
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(id ? '/more/disputes' : '/more')}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                {id ? `Dispute ${selectedDispute?.caseNumber}` : "Dispute Center"}
              </h1>
              <p className="text-gray-600 mt-1">
                {id ? "Manage your dispute case" : "File and track your dispute cases"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      {!id && (
        <div className="px-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex space-x-2 overflow-x-auto pb-2"
          >
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="whitespace-nowrap text-xs flex items-center space-x-2"
              >
                <ApperIcon name={tab.icon} size={14} />
                <span>{tab.label}</span>
              </Button>
            ))}
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {id || activeTab === "details" ? <DisputeDetails /> : <DisputeCenter />}
          </motion.div>
        </AnimatePresence>
      </div>

      <NewDisputeModal />
    </div>
  )
}

export default DisputePage