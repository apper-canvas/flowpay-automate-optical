import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/pages/Layout"
import WalletPage from "@/components/pages/WalletPage"
import PaymentsPage from "@/components/pages/PaymentsPage"
import P2PTransferPage from "@/components/pages/P2PTransferPage"
import QRScannerPage from "@/components/pages/QRScannerPage"
import HistoryPage from "@/components/pages/HistoryPage"
import BusinessPage from "@/components/pages/BusinessPage"
import MorePage from "@/components/pages/MorePage"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
<Route index element={<WalletPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/transfer" element={<P2PTransferPage />} />
            <Route path="/payments/qr-scanner" element={<QRScannerPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/more" element={<MorePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="shadow-lg"
        style={{ zIndex: 9999 }}
      />
    </>
  )
}

export default App