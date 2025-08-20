import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/organisms/Layout"
import Dashboard from "@/components/pages/Dashboard"
import Inventory from "@/components/pages/Inventory"
import VehicleDetails from "@/components/pages/VehicleDetails"
import AddVehicle from "@/components/pages/AddVehicle"
import Leads from "@/components/pages/Leads"
import LeadDetails from "@/components/pages/LeadDetails"
import DealDesk from "@/components/pages/DealDesk"
import Invoicing from "@/components/pages/Invoicing"
import Reports from "@/components/pages/Reports"
import Settings from "@/components/pages/Settings"
import CustomerPortal from "@/components/pages/CustomerPortal"
import Reconditioning from "@/components/pages/Reconditioning"
import Vendors from "@/components/pages/Vendors"
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
<Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/:id" element={<VehicleDetails />} />
            <Route path="inventory/add" element={<AddVehicle />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetails />} />
            <Route path="deals" element={<DealDesk />} />
            <Route path="invoicing" element={<Invoicing />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
<Route path="customer-portal" element={<CustomerPortal />} />
            <Route path="reconditioning" element={<Reconditioning />} />
            <Route path="vendors" element={<Vendors />} />
          </Route>
        </Routes>
        
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
        />
      </div>
    </Router>
  )
}

export default App