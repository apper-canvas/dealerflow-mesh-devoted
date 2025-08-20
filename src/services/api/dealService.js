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
  },

  async calculateCustomerLoyalty(customerId, customerDeals) {
    await delay();
    const completedDeals = customerDeals.filter(d => d.status === "Completed");
    const totalSpent = completedDeals.reduce((sum, d) => sum + d.salePrice, 0);
    const dealCount = completedDeals.length;
    const avgDealValue = dealCount > 0 ? totalSpent / dealCount : 0;
    
    // Calculate loyalty points (1 point per $100 spent + bonus points)
    let loyaltyPoints = Math.floor(totalSpent / 100);
    
    // Bonus points for multiple purchases
    if (dealCount >= 2) loyaltyPoints += 500;
    if (dealCount >= 3) loyaltyPoints += 1000;
    
    // Determine loyalty tier
    let tier = "Bronze";
    let tierBenefits = ["5% service discount"];
    
    if (loyaltyPoints >= 5000) {
      tier = "Gold";
      tierBenefits = ["15% service discount", "Priority scheduling", "Loaner vehicle"];
    } else if (loyaltyPoints >= 2500) {
      tier = "Silver";
      tierBenefits = ["10% service discount", "Priority scheduling"];
    }
    
    // Calculate next purchase recommendation date
    const lastPurchase = completedDeals.length > 0 
      ? new Date(Math.max(...completedDeals.map(d => new Date(d.dealDate))))
      : null;
    
    const avgOwnershipMonths = 48; // Average 4 years
    const nextRecommendedPurchase = lastPurchase 
      ? new Date(lastPurchase.getTime() + (avgOwnershipMonths * 30 * 24 * 60 * 60 * 1000))
      : null;

    return {
      customerId,
      loyaltyPoints: Math.round(loyaltyPoints),
      tier,
      tierBenefits,
      totalSpent: Math.round(totalSpent * 100) / 100,
      dealCount,
      avgDealValue: Math.round(avgDealValue * 100) / 100,
      lastPurchaseDate: lastPurchase?.toISOString(),
      nextRecommendedPurchase: nextRecommendedPurchase?.toISOString(),
      isActive: lastPurchase ? (Date.now() - lastPurchase.getTime()) < (24 * 30 * 24 * 60 * 60 * 1000) : false
    };
  },

  async getRecommendations(customerId, customerData, vehicles, deals) {
    await delay();
    const customerDeals = deals.filter(d => d.customerId === customerId);
    const loyalty = await this.calculateCustomerLoyalty(customerId, customerDeals);
    
    // Analyze customer preferences from purchase history
    const preferences = {
      preferredMakes: [],
      preferredBodyTypes: [],
      avgSpent: loyalty.avgDealValue,
      maxBudget: customerData.budget || loyalty.avgDealValue * 1.2
    };
    
    // Extract preferences from completed deals
    customerDeals.filter(d => d.status === "Completed").forEach(deal => {
      const vehicle = vehicles.find(v => v.Id === deal.vehicleId);
      if (vehicle) {
        if (!preferences.preferredMakes.includes(vehicle.make)) {
          preferences.preferredMakes.push(vehicle.make);
        }
        if (!preferences.preferredBodyTypes.includes(vehicle.bodyType)) {
          preferences.preferredBodyTypes.push(vehicle.bodyType);
        }
      }
    });
    
    // Score available vehicles
    const availableVehicles = vehicles.filter(v => v.status === "Available");
    const scoredRecommendations = availableVehicles.map(vehicle => {
      let score = 0;
      let reasons = [];
      
      // Budget compatibility (30 points max)
      if (vehicle.askingPrice <= preferences.maxBudget) {
        const budgetFit = 1 - (vehicle.askingPrice / preferences.maxBudget);
        score += budgetFit * 30;
        reasons.push(`Within budget ($${preferences.maxBudget.toLocaleString()})`);
      }
      
      // Brand loyalty (25 points max)
      if (preferences.preferredMakes.includes(vehicle.make)) {
        score += 25;
        reasons.push(`Previous ${vehicle.make} owner`);
      }
      
      // Body type preference (20 points max)
      if (preferences.preferredBodyTypes.includes(vehicle.bodyType)) {
        score += 20;
        reasons.push(`Preferred ${vehicle.bodyType.toLowerCase()}`);
      }
      
      // Vehicle age and condition (15 points max)
      const currentYear = new Date().getFullYear();
      const ageScore = Math.max(0, 15 - (currentYear - vehicle.year));
      score += ageScore;
      if (vehicle.condition === "Excellent") {
        score += 5;
        reasons.push("Excellent condition");
      }
      
      // Inventory turnover urgency (10 points max)
      if (vehicle.daysInInventory > 60) {
        score += 10;
        reasons.push("Special pricing available");
      }
      
      // Loyalty tier bonuses
      if (loyalty.tier === "Gold" && vehicle.askingPrice > 30000) {
        score += 5;
        reasons.push("Premium vehicle for Gold member");
      }
      
      return {
        ...vehicle,
        recommendationScore: Math.round(score),
        recommendationReasons: reasons,
        estimatedMonthlyPayment: this.calculateEstimatedPayment(vehicle.askingPrice, customerData.tradeInValue || 0),
        loyaltyDiscount: loyalty.tier === "Gold" ? 500 : loyalty.tier === "Silver" ? 250 : 0
      };
    });
    
    // Sort by score and return top 5
    const topRecommendations = scoredRecommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);
    
    return {
      customerId,
      customerLoyalty: loyalty,
      recommendations: topRecommendations,
      totalAvailableVehicles: availableVehicles.length,
      generatedAt: new Date().toISOString()
    };
  },

  calculateEstimatedPayment(price, tradeValue = 0) {
    const loanAmount = price - tradeValue - 2000; // Assume $2k down
    if (loanAmount <= 0) return 0;
    
    const monthlyRate = 0.05 / 12; // 5% APR
    const months = 60;
    const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(payment);
  }
};