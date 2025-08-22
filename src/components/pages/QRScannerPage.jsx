import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import QrScanner from "qr-scanner"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Card from "@/components/atoms/Card"
import QRScannerModal from "@/components/organisms/QRScannerModal"

const QRScannerPage = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const qrScannerRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [error, setError] = useState("")

  const initializeScanner = async () => {
    try {
      setError("")
      
      // Check if camera is supported
      if (!QrScanner.hasCamera()) {
        throw new Error("No camera found on this device")
      }

      // Request camera permission
      const hasCamera = await QrScanner.hasCamera()
      if (!hasCamera) {
        throw new Error("Camera access is required to scan QR codes")
      }

      setHasPermission(true)
      startScanning()
    } catch (err) {
      console.error("Camera initialization failed:", err)
      setError(err.message || "Failed to access camera")
      setHasPermission(false)
      toast.error("Camera access denied. Please enable camera permissions.")
    }
  }

  const startScanning = async () => {
    if (!videoRef.current) return

    try {
      setIsScanning(true)
      
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleQRCodeDetected(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 2,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      )

      await qrScannerRef.current.start()
      toast.success("Scanner ready! Point your camera at a QR code")
    } catch (err) {
      console.error("Scanner start failed:", err)
      setError("Failed to start camera")
      setIsScanning(false)
      toast.error("Failed to start camera scanner")
    }
  }

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleQRCodeDetected = (data) => {
    try {
      // Stop scanning temporarily
      stopScanning()
      
      // Parse QR code data
      let qrData
      try {
        // Try to parse as JSON first
        qrData = JSON.parse(data)
      } catch {
        // If not JSON, treat as simple string
        qrData = { data, type: 'unknown' }
      }

      // Validate QR code format
      if (!qrData.amount && !qrData.merchantId && !qrData.data) {
        throw new Error("Invalid QR code format")
      }

      setScannedData({
        raw: data,
        parsed: qrData,
        timestamp: Date.now()
      })
      
      setShowPaymentModal(true)
      toast.success("QR code detected!")
    } catch (err) {
      console.error("QR parsing failed:", err)
      toast.error("Invalid QR code. Please try a valid payment QR code.")
      // Resume scanning after error
      setTimeout(() => {
        if (hasPermission) {
          startScanning()
        }
      }, 2000)
    }
  }

  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    setScannedData(null)
    toast.success("Payment completed successfully!")
    
    // Navigate back to payments page
    setTimeout(() => {
      navigate("/payments")
    }, 1500)
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setScannedData(null)
    
    // Resume scanning
    if (hasPermission) {
      setTimeout(() => {
        startScanning()
      }, 500)
    }
  }

  const handleRetry = () => {
    setError("")
    setHasPermission(null)
    initializeScanner()
  }

  const handleBack = () => {
    stopScanning()
    navigate("/payments")
  }

  useEffect(() => {
    initializeScanner()

    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="min-h-screen bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/10"
          >
            <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
            Back
          </Button>
          
          <h1 className="text-lg font-display font-semibold text-white">
            Scan QR Code
          </h1>
          
          <div className="w-16" /> {/* Spacer */}
        </motion.div>
      </div>

      {/* Scanner Interface */}
      <div className="relative w-full h-screen">
        {hasPermission === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full bg-black"
          >
            <div className="text-center text-white">
              <motion.div
                className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p>Requesting camera permission...</p>
            </div>
          </motion.div>
        )}

        {hasPermission === false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full bg-black px-4"
          >
            <Card padding="lg" className="text-center max-w-sm">
              <ApperIcon name="Camera" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                Camera Access Required
              </h3>
              <p className="text-gray-600 mb-6">
                {error || "Please enable camera permissions to scan QR codes"}
              </p>
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full">
                  <ApperIcon name="Camera" size={16} className="mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleBack} className="w-full">
                  Go Back
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {hasPermission && (
          <>
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanner Overlay */}
            <div className="absolute inset-0 bg-black/40">
              {/* Scanning Frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  {/* Scanner Frame */}
                  <div className="w-64 h-64 border-2 border-white rounded-2xl relative overflow-hidden">
                    {/* Corner indicators */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    
                    {/* Scanning line animation */}
                    {isScanning && (
                      <motion.div
                        className="absolute inset-x-0 h-0.5 bg-primary shadow-lg shadow-primary/50"
                        animate={{ y: [0, 256, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-32 left-0 right-0 px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 mx-auto max-w-sm">
                    <p className="text-white text-sm font-medium mb-2">
                      Point your camera at a QR code
                    </p>
                    <p className="text-white/70 text-xs">
                      Make sure the QR code is within the frame and well-lit
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-0 right-0 px-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleBack}
                    className="bg-black/60 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                  >
                    <ApperIcon name="X" size={20} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && scannedData && (
          <QRScannerModal
            isOpen={showPaymentModal}
            onClose={handlePaymentCancel}
            scannedData={scannedData}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default QRScannerPage