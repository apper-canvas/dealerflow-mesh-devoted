import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
const navigation = [
    { name: "Dashboard", path: "/", icon: "LayoutDashboard" },
    { name: "Inventory", path: "/inventory", icon: "Car" },
    { name: "Leads", path: "/leads", icon: "Users" },
    { name: "Deal Desk", path: "/deals", icon: "FileText" },
    { name: "Invoicing", path: "/invoicing", icon: "Receipt" },
    { name: "Customer Portal", path: "/customer-portal", icon: "Upload" },
    { name: "Reports", path: "/reports", icon: "BarChart3" },
{ name: "Settings", path: "/settings", icon: "Settings" },
    { name: "Reconditioning", path: "/reconditioning", icon: "Wrench" }
  ];
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-lg">
            <ApperIcon name="Car" className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              DealerFlow
            </h1>
            <p className="text-sm text-slate-500">Pro Edition</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => {
              if (onMobileClose) onMobileClose();
            }}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-[1.02]"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <ApperIcon name={item.icon} className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">John Manager</p>
              <p className="text-xs text-slate-500">Sales Director</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;