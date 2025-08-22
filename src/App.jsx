import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React from "react";
import SplitBillPage from "@/components/pages/SplitBillPage";
import "@/index.css";
import transactionsData from "@/services/mockData/transactions.json";
import contactsData from "@/services/mockData/contacts.json";
import fundingSourcesData from "@/services/mockData/fundingSources.json";
import walletsData from "@/services/mockData/wallets.json";
import virtualCardsData from "@/services/mockData/virtualCards.json";
import subscriptionsData from "@/services/mockData/subscriptions.json";
import SupportPage from "@/components/pages/SupportPage";
import DashboardPage from "@/components/pages/DashboardPage";
import HistoryPage from "@/components/pages/HistoryPage";
import SavedMethodsPage from "@/components/pages/SavedMethodsPage";
import ToolsPage from "@/components/pages/ToolsPage";
import SettlementsPage from "@/components/pages/SettlementsPage";
import SubscriptionPage from "@/components/pages/SubscriptionPage";
import PaymentLinksPage from "@/components/pages/PaymentLinksPage";
import BusinessPage from "@/components/pages/BusinessPage";
import CheckoutPage from "@/components/pages/CheckoutPage";
import AlertsPage from "@/components/pages/AlertsPage";
import VirtualCardsPage from "@/components/pages/VirtualCardsPage";
import WalletPage from "@/components/pages/WalletPage";
import P2PTransferPage from "@/components/pages/P2PTransferPage";
import SettingsPage from "@/components/pages/SettingsPage";
import InvoicePage from "@/components/pages/InvoicePage";
import PaymentsPage from "@/components/pages/PaymentsPage";
import CurrencyExchangePage from "@/components/pages/CurrencyExchangePage";
import BillingCalendarPage from "@/components/pages/BillingCalendarPage";
import NotificationsPage from "@/components/pages/NotificationsPage";
import Layout from "@/components/pages/Layout";
import MorePage from "@/components/pages/MorePage";
import SecurityPage from "@/components/pages/SecurityPage";
import QRScannerPage from "@/components/pages/QRScannerPage";
function App() {
  return (
    <>
      <BrowserRouter>
<Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<WalletPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/transfer" element={<P2PTransferPage />} />
            <Route path="/payments/split-bill" element={<SplitBillPage />} />
            <Route path="/payments/split-bill/:id" element={<SplitBillPage />} />
            <Route path="/payments/exchange" element={<CurrencyExchangePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/split-bills" element={<HistoryPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/business/settlements" element={<SettlementsPage />} />
            <Route path="/business/tools" element={<ToolsPage />} />
            <Route path="/business/payment-links" element={<PaymentLinksPage />} />
            <Route path="/business/invoices" element={<InvoicePage />} />
<Route path="/more" element={<MorePage />} />
            <Route path="/more/security" element={<SecurityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/notifications" element={<NotificationsPage />} />
            <Route path="/settings/saved-methods" element={<SavedMethodsPage />} />
            <Route path="/settings/support" element={<SupportPage />} />
            <Route path="/subscriptions" element={<SubscriptionPage />} />
            <Route path="/billing-calendar" element={<BillingCalendarPage />} />
            <Route path="/virtual-cards" element={<VirtualCardsPage />} />
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