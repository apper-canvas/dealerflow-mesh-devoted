import invoicesData from "@/services/mockData/invoices.json";
import { dealService } from "@/services/api/dealService";

let invoices = [...invoicesData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const invoiceService = {
  async getAll() {
    await delay();
    return invoices.map(invoice => ({ ...invoice }));
  },

  async getById(id) {
    await delay();
    const invoice = invoices.find(inv => inv.Id === parseInt(id));
    return invoice ? { ...invoice } : null;
  },

  async create(invoiceData) {
    await delay();
    const maxId = Math.max(...invoices.map(inv => inv.Id), 0);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(maxId + 1).toString().padStart(3, '0')}`;
    
    const newInvoice = {
      ...invoiceData,
      Id: maxId + 1,
      invoiceNumber,
      status: "Draft",
      paymentStatus: "Not Sent",
      paymentDate: null,
      paymentMethod: null,
      amountPaid: 0.00,
      balanceDue: invoiceData.totalAmount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    invoices.push(newInvoice);
    return { ...newInvoice };
  },

  async update(id, invoiceData) {
    await delay();
    const index = invoices.findIndex(inv => inv.Id === parseInt(id));
    if (index !== -1) {
      invoices[index] = { 
        ...invoices[index], 
        ...invoiceData,
        updatedAt: new Date().toISOString()
      };
      return { ...invoices[index] };
    }
    return null;
  },

  async delete(id) {
    await delay();
    const index = invoices.findIndex(inv => inv.Id === parseInt(id));
    if (index !== -1) {
      const deletedInvoice = invoices.splice(index, 1)[0];
      return { ...deletedInvoice };
    }
    return null;
  },

  async generateFromDeal(dealId) {
    await delay();
    const deal = await dealService.getById(dealId);
    
    if (!deal) {
      throw new Error("Deal not found");
    }

    if (deal.status !== "Completed") {
      throw new Error("Can only generate invoices for completed deals");
    }

    // Check if invoice already exists for this deal
    const existingInvoice = invoices.find(inv => inv.dealId === parseInt(dealId));
    if (existingInvoice) {
      throw new Error("Invoice already exists for this deal");
    }

    const maxId = Math.max(...invoices.map(inv => inv.Id), 0);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(maxId + 1).toString().padStart(3, '0')}`;

    // Calculate line items
    const lineItems = [];
    let itemId = 1;

    // Vehicle sale line item
    if (deal.vehicle) {
      lineItems.push({
        id: itemId++,
        description: `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model} - Vehicle Sale`,
        quantity: 1,
        unitPrice: deal.salePrice,
        total: deal.salePrice
      });
    }

    // Trade-in deduction (if applicable)
    if (deal.tradeInValue && deal.tradeInValue > 0) {
      lineItems.push({
        id: itemId++,
        description: "Trade-in Vehicle Credit",
        quantity: 1,
        unitPrice: -deal.tradeInValue,
        total: -deal.tradeInValue
      });
    }

    // Documentation fee
    lineItems.push({
      id: itemId++,
      description: "Documentation Fee",
      quantity: 1,
      unitPrice: 299.00,
      total: 299.00
    });

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 8.25; // Default tax rate
    const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    const newInvoice = {
      Id: maxId + 1,
      invoiceNumber,
      dealId: deal.Id,
      customerId: deal.customerId,
      customerName: deal.customerName,
      customerEmail: deal.customerEmail || `${deal.customerName.toLowerCase().replace(' ', '.')}@email.com`,
      customerAddress: deal.customerAddress || {
        street: "Address not provided",
        city: "City",
        state: "State",
        zipCode: "00000"
      },
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: "Draft",
      paymentStatus: "Not Sent",
      paymentDate: null,
      paymentMethod: null,
      vehicle: deal.vehicle ? {
        year: deal.vehicle.year,
        make: deal.vehicle.make,
        model: deal.vehicle.model,
        vin: deal.vehicle.vin,
        mileage: deal.vehicle.mileage
      } : null,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      amountPaid: 0.00,
      balanceDue: totalAmount,
      notes: "Invoice generated from completed deal. Thank you for your business!",
      terms: "Payment due within 30 days. Late payments subject to 1.5% monthly service charge.",
      createdBy: "System",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    invoices.push(newInvoice);
    return { ...newInvoice };
  },

  async recordPayment(id, paymentData) {
    await delay();
    const invoice = await this.getById(id);
    
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const paymentAmount = parseFloat(paymentData.amount);
    const newAmountPaid = invoice.amountPaid + paymentAmount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newAmountPaid);
    
    let newPaymentStatus = "Partial";
    let newStatus = "Partially Paid";
    
    if (newBalanceDue === 0) {
      newPaymentStatus = "Completed";
      newStatus = "Paid";
    } else if (newAmountPaid === 0) {
      newPaymentStatus = "Pending";
      newStatus = "Sent";
    }

    const updatedInvoice = await this.update(id, {
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      paymentStatus: newPaymentStatus,
      status: newStatus,
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentData.paymentMethod,
      notes: `${invoice.notes} Payment of $${paymentAmount} received on ${new Date().toLocaleDateString()}.`
    });

    return updatedInvoice;
  },

  async sendInvoice(id, emailData) {
    await delay();
    const invoice = await this.getById(id);
    
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "Draft") {
      await this.update(id, {
        status: "Sent",
        paymentStatus: "Pending"
      });
    }

    // Simulate email sending
    return {
      success: true,
      sentTo: emailData.email || invoice.customerEmail,
      sentAt: new Date().toISOString(),
      message: "Invoice sent successfully"
    };
  },

  async generatePDF(id) {
    await delay();
    const invoice = await this.getById(id);
    
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Simulate PDF generation
    return {
      success: true,
      fileName: `${invoice.invoiceNumber}.pdf`,
      url: `#pdf-download-${invoice.invoiceNumber}`,
      generatedAt: new Date().toISOString()
    };
  },

  async getInvoiceStats() {
    await delay();
    const stats = {
      totalInvoices: invoices.length,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      statusBreakdown: {
        "Draft": 0,
        "Sent": 0,
        "Paid": 0,
        "Partially Paid": 0,
        "Overdue": 0
      },
      paymentStatusBreakdown: {
        "Not Sent": 0,
        "Pending": 0,
        "Partial": 0,
        "Completed": 0,
        "Overdue": 0
      }
    };

    invoices.forEach(invoice => {
      stats.totalAmount += invoice.totalAmount;
      stats.paidAmount += invoice.amountPaid;
      
      if (invoice.status === "Overdue") {
        stats.overdueAmount += invoice.balanceDue;
      } else if (invoice.paymentStatus === "Pending" || invoice.paymentStatus === "Partial") {
        stats.pendingAmount += invoice.balanceDue;
      }

      stats.statusBreakdown[invoice.status] = (stats.statusBreakdown[invoice.status] || 0) + 1;
      stats.paymentStatusBreakdown[invoice.paymentStatus] = (stats.paymentStatusBreakdown[invoice.paymentStatus] || 0) + 1;
    });

    // Round amounts
    stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
    stats.paidAmount = Math.round(stats.paidAmount * 100) / 100;
    stats.pendingAmount = Math.round(stats.pendingAmount * 100) / 100;
    stats.overdueAmount = Math.round(stats.overdueAmount * 100) / 100;

    return stats;
  },

  async markAsOverdue(id) {
    await delay();
    const updatedInvoice = await this.update(id, {
      status: "Overdue",
      paymentStatus: "Overdue"
    });
    return updatedInvoice;
  },

  async getOverdueInvoices() {
    await delay();
    const currentDate = new Date();
    const overdueInvoices = invoices.filter(invoice => {
      const dueDate = new Date(invoice.dueDate);
      return dueDate < currentDate && invoice.balanceDue > 0 && invoice.status !== "Overdue";
    });

    // Automatically mark as overdue
    for (const invoice of overdueInvoices) {
      await this.markAsOverdue(invoice.Id);
    }

    return invoices.filter(inv => inv.status === "Overdue");
  }
};