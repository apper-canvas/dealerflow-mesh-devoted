import React, { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("dealership");
const [settings, setSettings] = useState({
    // Dealership Settings
    dealershipName: "Premier Auto Sales",
    address: "123 Main Street, Downtown",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    phone: "(555) 123-4567",
    email: "info@premierautosales.com",
    website: "www.premierautosales.com",
    
    // Business Settings
    defaultFinanceRate: "4.9",
    defaultTerm: "60",
    markupPercentage: "15",
    salesTaxRate: "8.25",
    docFee: "299",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    leadAlerts: true,
    inventoryAlerts: true,
    dealAlerts: true,
    
    // Vendor Settings
    vendorAutoApproval: false,
    vendorPaymentTerms: "30",
    requireVendorInsurance: true,
    vendorRatingThreshold: "3",
    
    // User Preferences
    dateFormat: "MM/dd/yyyy",
    timeFormat: "12",
    currency: "USD",
    language: "English"
  });

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast.success("Settings saved successfully!");
  };

  const tabs = [
{ id: "dealership", name: "Dealership Info", icon: "Building" },
    { id: "business", name: "Business Rules", icon: "Settings" },
    { id: "notifications", name: "Notifications", icon: "Bell" },
    { id: "vendors", name: "Vendor Settings", icon: "Truck" },
    { id: "preferences", name: "Preferences", icon: "User" }
  ];

  const renderDealershipSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Dealership Name"
            value={settings.dealershipName}
            onChange={(e) => handleSettingChange("dealershipName", e.target.value)}
          />
          <Input
            label="Phone Number"
            value={settings.phone}
            onChange={(e) => handleSettingChange("phone", e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            value={settings.email}
            onChange={(e) => handleSettingChange("email", e.target.value)}
          />
          <Input
            label="Website"
            value={settings.website}
            onChange={(e) => handleSettingChange("website", e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Address Information</h3>
        <div className="space-y-4">
          <Input
            label="Street Address"
            value={settings.address}
            onChange={(e) => handleSettingChange("address", e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              value={settings.city}
              onChange={(e) => handleSettingChange("city", e.target.value)}
            />
            <Input
              label="State"
              value={settings.state}
              onChange={(e) => handleSettingChange("state", e.target.value)}
            />
            <Input
              label="ZIP Code"
              value={settings.zipCode}
              onChange={(e) => handleSettingChange("zipCode", e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Financing Defaults</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Default Interest Rate (%)"
            type="number"
            step="0.1"
            value={settings.defaultFinanceRate}
            onChange={(e) => handleSettingChange("defaultFinanceRate", e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Term (Months)
            </label>
            <select
              value={settings.defaultTerm}
              onChange={(e) => handleSettingChange("defaultTerm", e.target.value)}
              className="input-field"
            >
              <option value="36">36 months</option>
              <option value="48">48 months</option>
              <option value="60">60 months</option>
              <option value="72">72 months</option>
              <option value="84">84 months</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Pricing & Fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Default Markup (%)"
            type="number"
            step="0.1"
            value={settings.markupPercentage}
            onChange={(e) => handleSettingChange("markupPercentage", e.target.value)}
          />
          <Input
            label="Sales Tax Rate (%)"
            type="number"
            step="0.01"
            value={settings.salesTaxRate}
            onChange={(e) => handleSettingChange("salesTaxRate", e.target.value)}
          />
          <Input
            label="Documentation Fee ($)"
            type="number"
            value={settings.docFee}
            onChange={(e) => handleSettingChange("docFee", e.target.value)}
          />
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Mail" className="h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-500">Receive updates via email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <ApperIcon name="MessageSquare" className="h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">SMS Notifications</p>
              <p className="text-sm text-slate-500">Receive updates via text message</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange("smsNotifications", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Users" className="h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">Lead Alerts</p>
              <p className="text-sm text-slate-500">Get notified of new leads</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.leadAlerts}
              onChange={(e) => handleSettingChange("leadAlerts", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Car" className="h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">Inventory Alerts</p>
              <p className="text-sm text-slate-500">Aging inventory notifications</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.inventoryAlerts}
              onChange={(e) => handleSettingChange("inventoryAlerts", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <ApperIcon name="FileText" className="h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">Deal Alerts</p>
              <p className="text-sm text-slate-500">Deal status updates</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dealAlerts}
              onChange={(e) => handleSettingChange("dealAlerts", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </Card>
  );

  const renderPreferences = () => (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">User Preferences</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date Format
          </label>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
            className="input-field"
          >
            <option value="MM/dd/yyyy">MM/dd/yyyy</option>
            <option value="dd/MM/yyyy">dd/MM/yyyy</option>
            <option value="yyyy-MM-dd">yyyy-MM-dd</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Time Format
          </label>
          <select
            value={settings.timeFormat}
            onChange={(e) => handleSettingChange("timeFormat", e.target.value)}
            className="input-field"
          >
            <option value="12">12 Hour</option>
            <option value="24">24 Hour</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleSettingChange("currency", e.target.value)}
            className="input-field"
          >
            <option value="USD">USD ($)</option>
            <option value="CAD">CAD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange("language", e.target.value)}
            className="input-field"
          >
            <option value="English">English</option>
<option value="Spanish">Español</option>
            <option value="French">Français</option>
          </select>
        </div>
      </div>
    </Card>
  );

  const renderVendorSettings = () => (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">Vendor Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.vendorAutoApproval}
                  onChange={(e) => handleSettingChange('vendorAutoApproval', e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-slate-700">Auto-approve new vendors</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.requireVendorInsurance}
                  onChange={(e) => handleSettingChange('requireVendorInsurance', e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-slate-700">Require vendor insurance documentation</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Default Payment Terms</label>
            <select
              value={settings.vendorPaymentTerms}
              onChange={(e) => handleSettingChange('vendorPaymentTerms', e.target.value)}
              className="input-field"
            >
              <option value="15">Net 15</option>
              <option value="30">Net 30</option>
              <option value="45">Net 45</option>
              <option value="60">Net 60</option>
              <option value="90">Net 90</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Vendor Rating</label>
            <select
              value={settings.vendorRatingThreshold}
              onChange={(e) => handleSettingChange('vendorRatingThreshold', e.target.value)}
              className="input-field"
            >
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your dealership settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <ApperIcon name={tab.icon} className="h-4 w-4" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
<div className="py-4">
        {activeTab === "dealership" && renderDealershipSettings()}
        {activeTab === "business" && renderBusinessSettings()}
        {activeTab === "notifications" && renderNotificationSettings()}
        {activeTab === "vendors" && renderVendorSettings()}
        {activeTab === "preferences" && renderPreferences()}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button onClick={handleSave} size="lg">
          <ApperIcon name="Save" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;