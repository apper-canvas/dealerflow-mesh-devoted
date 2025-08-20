import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const dealService = {
  async getAll() {
    await delay();
    return deals.map(deal => ({ ...deal }));
  },

  async getById(id) {
    await delay();
    const deal = deals.find(d => d.Id === parseInt(id));
    return deal ? { ...deal } : null;
  },

  async create(dealData) {
    await delay();
    const maxId = Math.max(...deals.map(d => d.Id), 0);
    const newDeal = {
      ...dealData,
      Id: maxId + 1,
      status: "Draft",
      dealDate: new Date().toISOString(),
      documents: []
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, dealData) {
    await delay();
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index !== -1) {
      deals[index] = { ...deals[index], ...dealData };
      return { ...deals[index] };
    }
    return null;
  },

  async delete(id) {
    await delay();
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index !== -1) {
      const deletedDeal = deals.splice(index, 1)[0];
      return { ...deletedDeal };
    }
    return null;
  },

  async addDocument(dealId, document) {
    await delay();
    const deal = deals.find(d => d.Id === parseInt(dealId));
    if (deal) {
      if (!deal.documents) {
        deal.documents = [];
      }
      const newDocument = {
        ...document,
        id: Date.now(),
        uploadDate: new Date().toISOString()
      };
      deal.documents.push(newDocument);
      return { ...newDocument };
    }
    return null;
  },

  async removeDocument(dealId, documentId) {
    await delay();
    const deal = deals.find(d => d.Id === parseInt(dealId));
    if (deal && deal.documents) {
      const index = deal.documents.findIndex(doc => doc.id === documentId);
      if (index !== -1) {
        const removedDocument = deal.documents.splice(index, 1)[0];
        return { ...removedDocument };
      }
    }
    return null;
  },

async calculateFinancing(principal, downPayment, interestRate, termMonths) {
    await delay();
    const loanAmount = principal - downPayment;
    if (loanAmount <= 0) {
      return {
        loanAmount: 0,
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: downPayment
      };
    }

    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    const totalPayment = monthlyPayment * termMonths + downPayment;
    const totalInterest = totalPayment - principal;

    return {
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100
    };
  },

  async calculateFloorplanInterest(vehicleData, floorplanRate = 0.08) {
    await delay();
    const dailyRate = floorplanRate / 365;
    const vehicleCost = vehicleData.cost || vehicleData.askingPrice * 0.8;
    const totalInterest = vehicleCost * dailyRate * vehicleData.daysInInventory;
    
    return {
      vehicleId: vehicleData.Id,
      dailyRate: Math.round(dailyRate * 10000) / 10000,
      daysInInventory: vehicleData.daysInInventory,
      vehicleCost,
      totalInterest: Math.round(totalInterest * 100) / 100,
      monthlyInterest: Math.round((totalInterest / vehicleData.daysInInventory * 30) * 100) / 100
    };
  },

  async calculateMarginWaterfall(dealData) {
    await delay();
    const grossMargin = dealData.margin || 0;
    const floorplanCost = dealData.floorplanCost || 0;
    const reconditioningCost = dealData.reconditioningCost || 0;
    const otherCosts = dealData.otherCosts || 0;
    const netMargin = grossMargin - floorplanCost - reconditioningCost - otherCosts;
    
    return {
      dealId: dealData.Id,
      grossMargin,
      floorplanCost,
      reconditioningCost,
      otherCosts,
      netMargin: Math.round(netMargin * 100) / 100,
      marginPercentage: dealData.salePrice > 0 ? Math.round((netMargin / dealData.salePrice) * 10000) / 100 : 0
    };
  },

  async getFloorplanAnalysis(vehicles, deals) {
    await delay();
    const floorplanRate = 0.08;
    const analysis = {
      totalFloorplanCost: 0,
      averageDailyRate: floorplanRate / 365,
      costByAging: {},
      marginImpact: 0
    };

    // Calculate floorplan costs by aging buckets
    const agingBuckets = ["0-30", "31-60", "61-90", "90+"];
    agingBuckets.forEach(bucket => {
      analysis.costByAging[bucket] = { count: 0, totalCost: 0 };
    });

    vehicles.forEach(vehicle => {
      const cost = vehicle.cost || vehicle.askingPrice * 0.8;
      const interestCost = cost * (floorplanRate / 365) * vehicle.daysInInventory;
      analysis.totalFloorplanCost += interestCost;

      // Categorize by aging
      const days = vehicle.daysInInventory;
      let bucket;
      if (days <= 30) bucket = "0-30";
      else if (days <= 60) bucket = "31-60";
      else if (days <= 90) bucket = "61-90";
      else bucket = "90+";

      analysis.costByAging[bucket].count++;
      analysis.costByAging[bucket].totalCost += interestCost;
    });

    // Calculate margin impact
    const totalSales = deals.filter(d => d.status === "Completed").reduce((sum, d) => sum + d.salePrice, 0);
    analysis.marginImpact = totalSales > 0 ? (analysis.totalFloorplanCost / totalSales) * 100 : 0;

    return {
      ...analysis,
      totalFloorplanCost: Math.round(analysis.totalFloorplanCost * 100) / 100,
      marginImpact: Math.round(analysis.marginImpact * 100) / 100
    };
  }
};