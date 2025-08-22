import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import DashboardPage from "@/components/pages/DashboardPage";
import React from "react";
import P2PTransferPage from "@/components/pages/P2PTransferPage";
import PaymentLinksPage from "@/components/pages/PaymentLinksPage";
import HistoryPage from "@/components/pages/HistoryPage";
import SettingsPage from "@/components/pages/SettingsPage";
import NotificationsPage from "@/components/pages/NotificationsPage";
import MorePage from "@/components/pages/MorePage";
import QRScannerPage from "@/components/pages/QRScannerPage";
import CurrencyExchangePage from "@/components/pages/CurrencyExchangePage";
import WalletPage from "@/components/pages/WalletPage";
import Layout from "@/components/pages/Layout";
import PaymentsPage from "@/components/pages/PaymentsPage";
import ToolsPage from "@/components/pages/ToolsPage";
import SettlementsPage from "@/components/pages/SettlementsPage";
import BusinessPage from "@/components/pages/BusinessPage";
import InvoicePage from "@/components/pages/InvoicePage";
import SupportPage from "@/components/pages/SupportPage";
function App() {
  return (
    <>
      <BrowserRouter>
<Routes>
<Route path="/" element={<Layout />}>
            <Route index element={<WalletPage />} />
<Route index element={<WalletPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/transfer" element={<P2PTransferPage />} />
            <Route path="/payments/exchange" element={<CurrencyExchangePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/business" element={<BusinessPage />} />
<Route path="/business/settlements" element={<SettlementsPage />} />
            <Route path="/business/tools" element={<ToolsPage />} />
            <Route path="/business/payment-links" element={<PaymentLinksPage />} />
            <Route path="/business/invoices" element={<InvoicePage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/notifications" element={<NotificationsPage />} />
            <Route path="/settings/support" element={<SupportPage />} />
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