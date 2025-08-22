import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"
import { businessService } from "@/services/api/businessService"

const QRCodeGeneratorCard = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    merchantName: "FlowPay Business"
  })
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef(null)

  const generateQRCode = async () => {
    try {
      setLoading(true)
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        toast.error("Please enter a valid amount")
        return
      }

      const qrData = await businessService.generateBusinessQR({
        amount: parseFloat(formData.amount),
        description: formData.description || "Business Payment",
        merchantName: formData.merchantName
      })

      setQrCode(qrData)
      toast.success("QR code generated successfully!")
    } catch (error) {
      toast.error(error.message || "Failed to generate QR code")
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = async () => {
    if (!qrCode) return

    try {
      // Create a canvas to draw the QR code
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Set canvas size
      canvas.width = 300
      canvas.height = 350
      
      // Clear canvas
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw QR code placeholder (in real app, use a QR library)
      ctx.fillStyle = '#000000'
      ctx.fillRect(50, 50, 200, 200)
      
      // Add white squares to simulate QR pattern
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if ((i + j) % 3 === 0) {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(60 + i * 18, 60 + j * 18, 16, 16)
          }
        }
      }
      
      // Add text below QR code
      ctx.fillStyle = '#000000'
      ctx.font = '16px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(formData.merchantName, canvas.width / 2, 280)
      ctx.font = '14px Inter'
      ctx.fillText(`$${formData.amount}`, canvas.width / 2, 300)
      ctx.fillText(formData.description, canvas.width / 2, 320)
      
      // Download the image
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qr-code-${formData.amount}.png`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("QR code downloaded!")
      })
    } catch (error) {
      toast.error("Failed to download QR code")
    }
  }

  const shareQRCode = async () => {
    if (!qrCode) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Payment QR Code',
          text: `Pay ${formData.merchantName} - $${formData.amount}`,
          url: qrCode.url
        })
      } else {
        await navigator.clipboard.writeText(qrCode.url)
        toast.success("QR code URL copied to clipboard!")
      }
    } catch (error) {
      toast.error("Failed to share QR code")
    }
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <ApperIcon name="QrCode" size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-display font-semibold text-gray-900">
            QR Code Generator
          </h3>
          <p className="text-gray-600 text-sm">
            Generate QR codes for business payments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-4">
          <Input
            label="Business Name"
            value={formData.merchantName}
            onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
            placeholder="Your Business Name"
          />

          <Input
            label="Payment Amount ($)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            placeholder="0.00"
            step="0.01"
          />

          <Input
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Payment description"
          />

          <Button
            onClick={generateQRCode}
            disabled={loading || !formData.amount}
            className="w-full"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Generating...
              </>
            ) : (
              <>
                <ApperIcon name="QrCode" size={16} className="mr-2" />
                Generate QR Code
              </>
            )}
          </Button>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center justify-center">
          {qrCode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* QR Code Placeholder */}
              <div className="w-64 h-64 bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center mb-4">
                <div className="w-48 h-48 bg-black relative">
                  {/* Simple QR pattern simulation */}
                  <div className="absolute inset-2 bg-white"></div>
                  <div className="absolute top-4 left-4 w-8 h-8 bg-black"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-black"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 bg-black"></div>
                  
                  {/* Pattern squares */}
                  {Array.from({ length: 100 }, (_, i) => {
                    const row = Math.floor(i / 10)
                    const col = i % 10
                    const shouldShow = (row + col) % 3 === 0
                    return shouldShow ? (
                      <div
                        key={i}
                        className="absolute w-4 h-4 bg-black"
                        style={{
                          left: `${20 + col * 18}px`,
                          top: `${20 + row * 18}px`
                        }}
                      />
                    ) : null
                  })}
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="font-semibold text-gray-900">{formData.merchantName}</p>
                <p className="text-2xl font-display font-bold text-primary">
                  ${formData.amount}
                </p>
                {formData.description && (
                  <p className="text-sm text-gray-600">{formData.description}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQRCode}
                >
                  <ApperIcon name="Download" size={16} className="mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareQRCode}
                >
                  <ApperIcon name="Share2" size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <ApperIcon name="QrCode" size={48} className="mx-auto mb-4 opacity-30" />
              <p>QR code will appear here</p>
              <p className="text-sm">Fill in the form and click generate</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for downloading */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  )
}

export default QRCodeGeneratorCard