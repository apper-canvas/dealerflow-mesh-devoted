import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import { invoiceService } from "@/services/api/invoiceService";
import { dealService } from "@/services/api/dealService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Invoicing = () => {
  const [invoices, setInvoices] = useState([]);
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newInvoice, setNewInvoice] = useState({
    customerName: "",
    customerEmail: "",
    customerAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    },
    lineItems: [
      { description: "", quantity: 1, unitPrice: 0, total: 0 }
    ],
    notes: "",
    dueDate: ""
  });
  const [payment, setPayment] = useState({
    amount: "",
    paymentMethod: "Cash",
    notes: ""
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [invoicesData, statsData, dealsData] = await Promise.all([
        invoiceService.getAll(),
        invoiceService.getInvoiceStats(),
        dealService.getAll()
      ]);
      setInvoices(invoicesData);
      setStats(statsData);
      setDeals(dealsData.filter(deal => deal.status === "Completed"));
    } catch (err) {
      setError("Failed to load invoicing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleInvoiceChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewInvoice(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewInvoice(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...newInvoice.lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value
    };
    
    // Calculate total for this line item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedLineItems[index].total = updatedLineItems[index].quantity * updatedLineItems[index].unitPrice;
    }

    setNewInvoice(prev => ({
      ...prev,
      lineItems: updatedLineItems
    }));
  };

  const addLineItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    if (newInvoice.lineItems.length > 1) {
      setNewInvoice(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = newInvoice.lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxRate = 8.25; // Default tax rate
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  };

  const handleCreateInvoice = async () => {
    try {
      if (!newInvoice.customerName || newInvoice.lineItems.some(item => !item.description)) {
        toast.error("Please fill in all required fields");
        return;
      }

      const totals = calculateTotals();
      const invoiceData = {
        ...newInvoice,
        customerId: null,
        dealId: null,
        dueDate: newInvoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        issueDate: new Date().toISOString(),
        lineItems: newInvoice.lineItems.map((item, index) => ({ ...item, id: index + 1 })),
        ...totals,
        createdBy: "Current User"
      };

      await invoiceService.create(invoiceData);
      toast.success("Invoice created successfully!");
      setShowNewInvoice(false);
      resetNewInvoice();
      loadData();
    } catch (err) {
      toast.error("Failed to create invoice");
    }
  };

  const resetNewInvoice = () => {
    setNewInvoice({
      customerName: "",
      customerEmail: "",
      customerAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: ""
      },
      lineItems: [
        { description: "", quantity: 1, unitPrice: 0, total: 0 }
      ],
      notes: "",
      dueDate: ""
    });
  };

  const handleGenerateFromDeal = async (dealId) => {
    try {
      await invoiceService.generateFromDeal(dealId);
      toast.success("Invoice generated from deal successfully!");
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to generate invoice from deal");
    }
  };

  const handleRecordPayment = async () => {
    try {
      if (!payment.amount || parseFloat(payment.amount) <= 0) {
        toast.error("Please enter a valid payment amount");
        return;
      }

      await invoiceService.recordPayment(selectedInvoice.Id, {
        amount: parseFloat(payment.amount),
        paymentMethod: payment.paymentMethod,
        notes: payment.notes
      });

      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);
      setPayment({ amount: "", paymentMethod: "Cash", notes: "" });
      setSelectedInvoice(null);
      loadData();
    } catch (err) {
      toast.error("Failed to record payment");
    }
  };

  const handleSendInvoice = async (invoice) => {
    try {
      await invoiceService.sendInvoice(invoice.Id, {
        email: invoice.customerEmail
      });
      toast.success(`Invoice sent to ${invoice.customerEmail}`);
      loadData();
    } catch (err) {
      toast.error("Failed to send invoice");
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const result = await invoiceService.generatePDF(invoice.Id);
      toast.success(`PDF generated: ${result.fileName}`);
      // In a real app, this would trigger a download
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Paid": return "success";
      case "Partially Paid": return "warning";
      case "Sent": return "primary";
      case "Overdue": return "danger";
      case "Draft": return "default";
      default: return "default";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Completed": return "text-green-600";
      case "Partial": return "text-amber-600";
      case "Pending": return "text-blue-600";
      case "Overdue": return "text-red-600";
      default: return "text-slate-600";
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Paid", label: "Paid" },
    { value: "Partially Paid", label: "Partially Paid" },
    { value: "Overdue", label: "Overdue" }
  ];

  const availableDeals = deals.filter(deal => 
    !invoices.some(invoice => invoice.dealId === deal.Id)
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoicing</h1>
          <p className="text-slate-600">Manage customer invoices and payments</p>
        </div>
        
        <div className="flex space-x-3">
          {availableDeals.length > 0 && (
            <div className="relative">
              <select 
                className="input-field pr-10"
                onChange={(e) => e.target.value && handleGenerateFromDeal(e.target.value)}
                defaultValue=""
              >
                <option value="">Generate from Deal...</option>
                {availableDeals.map(deal => (
                  <option key={deal.Id} value={deal.Id}>
                    Deal #{deal.Id.toString().padStart(3, "0")} - {deal.customerName}
                  </option>
                ))}
              </select>
              <ApperIcon name="ChevronDown" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          )}
          <Button onClick={() => setShowNewInvoice(true)}>
            <ApperIcon name="Plus" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices?.toLocaleString() || "0"}
          icon="Receipt"
          color="primary"
        />
        <StatCard
          title="Total Amount"
          value={`$${stats.totalAmount?.toLocaleString() || "0"}`}
          icon="DollarSign"
          color="success"
        />
        <StatCard
          title="Amount Paid"
          value={`$${stats.paidAmount?.toLocaleString() || "0"}`}
          icon="CheckCircle"
          color="success"
        />
        <StatCard
          title="Outstanding"
          value={`$${(stats.pendingAmount + stats.overdueAmount)?.toLocaleString() || "0"}`}
          icon="Clock"
          color="warning"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search invoices by customer name or invoice number..."
            onSearch={handleSearch}
          />
        </div>
        <FilterDropdown
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
      </div>

      {/* New Invoice Form */}
      {showNewInvoice && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Create New Invoice</h3>
            <Button variant="ghost" onClick={() => setShowNewInvoice(false)}>
              <ApperIcon name="X" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Customer Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  value={newInvoice.customerName}
                  onChange={(e) => handleInvoiceChange("customerName", e.target.value)}
                  placeholder="John Smith"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={newInvoice.customerEmail}
                  onChange={(e) => handleInvoiceChange("customerEmail", e.target.value)}
                  placeholder="john.smith@email.com"
                />
                <Input
                  label="Street Address"
                  value={newInvoice.customerAddress.street}
                  onChange={(e) => handleInvoiceChange("customerAddress.street", e.target.value)}
                  placeholder="123 Main St"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={newInvoice.customerAddress.city}
                    onChange={(e) => handleInvoiceChange("customerAddress.city", e.target.value)}
                    placeholder="City"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="State"
                      value={newInvoice.customerAddress.state}
                      onChange={(e) => handleInvoiceChange("customerAddress.state", e.target.value)}
                      placeholder="TX"
                    />
                    <Input
                      label="ZIP Code"
                      value={newInvoice.customerAddress.zipCode}
                      onChange={(e) => handleInvoiceChange("customerAddress.zipCode", e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900">Line Items</h4>
                <Button size="sm" onClick={addLineItem}>
                  <ApperIcon name="Plus" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {newInvoice.lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Input
                        label={index === 0 ? "Description" : ""}
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label={index === 0 ? "Quantity" : ""}
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label={index === 0 ? "Unit Price" : ""}
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label={index === 0 ? "Total" : ""}
                        value={item.total.toFixed(2)}
                        readOnly
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="col-span-1">
                      {newInvoice.lineItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax ({totals.taxRate}%):</span>
                      <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                      <span>Total:</span>
                      <span>${totals.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) => handleInvoiceChange("dueDate", e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) => handleInvoiceChange("notes", e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Additional notes or terms..."
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button variant="secondary" onClick={() => setShowNewInvoice(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvoice}>
                Create Invoice
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Record Payment</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    setPayment({ amount: "", paymentMethod: "Cash", notes: "" });
                  }}
                >
                  <ApperIcon name="X" />
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-1">Invoice: {selectedInvoice.invoiceNumber}</p>
                <p className="text-sm text-slate-600 mb-1">Customer: {selectedInvoice.customerName}</p>
                <p className="text-sm text-slate-600">Balance Due: <span className="font-semibold text-slate-900">${selectedInvoice.balanceDue.toFixed(2)}</span></p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Payment Amount"
                  type="number"
                  step="0.01"
                  max={selectedInvoice.balanceDue}
                  value={payment.amount}
                  onChange={(e) => setPayment(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={payment.paymentMethod}
                    onChange={(e) => setPayment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="input-field"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="ACH">ACH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={payment.notes}
                    onChange={(e) => setPayment(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field"
                    rows={2}
                    placeholder="Payment notes..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    setPayment({ amount: "", paymentMethod: "Cash", notes: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleRecordPayment} className="flex-1">
                  Record Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Empty
          icon="Receipt"
          title="No invoices found"
          description="Create your first invoice or generate one from a completed deal."
          actionText="Create Invoice"
          onAction={() => setShowNewInvoice(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.Id} hover className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                    <ApperIcon name="Receipt" className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">
                      {invoice.invoiceNumber}
                    </h4>
                    <p className="text-slate-600">{invoice.customerName}</p>
                    <p className="text-sm text-slate-500">
                      Issued: {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                      {" • "}
                      Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-xl font-bold text-slate-900">
                      ${invoice.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  
                  {invoice.balanceDue > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Balance Due</p>
                      <p className={`text-lg font-semibold ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                        ${invoice.balanceDue.toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Status</p>
                    <Badge variant={getStatusVariant(invoice.status)} className="mt-1">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {invoice.paymentDate && (
                      <div className="text-sm text-slate-600">
                        <p className="flex items-center space-x-1">
                          <ApperIcon name="Calendar" className="h-4 w-4" />
                          <span>Paid: {format(new Date(invoice.paymentDate), "MMM dd, yyyy")}</span>
                        </p>
                      </div>
                    )}
                    {invoice.vehicle && (
                      <div className="text-sm text-slate-600">
                        <p>{invoice.vehicle.year} {invoice.vehicle.make} {invoice.vehicle.model}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {invoice.status === "Draft" && (
                      <Button size="sm" onClick={() => handleSendInvoice(invoice)}>
                        <ApperIcon name="Send" />
                        Send
                      </Button>
                    )}
                    
                    {invoice.balanceDue > 0 && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowPaymentModal(true);
                        }}
                      >
                        <ApperIcon name="DollarSign" />
                        Record Payment
                      </Button>
                    )}
                    
                    <Button size="sm" variant="secondary" onClick={() => handleDownloadPDF(invoice)}>
                      <ApperIcon name="Download" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoicing;