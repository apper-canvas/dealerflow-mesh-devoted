import leadsData from "@/services/mockData/leads.json";

let leads = [...leadsData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const leadService = {
  async getAll() {
    await delay();
    return leads.map(lead => ({ ...lead }));
  },

  async getById(id) {
    await delay();
    const lead = leads.find(l => l.Id === parseInt(id));
    return lead ? { ...lead } : null;
  },

  async create(leadData) {
    await delay();
    const maxId = Math.max(...leads.map(l => l.Id), 0);
    const newLead = {
      ...leadData,
      Id: maxId + 1,
      status: "New",
      leadScore: 50,
      contactHistory: [],
      appointments: []
    };
    leads.push(newLead);
    return { ...newLead };
  },

  async update(id, leadData) {
    await delay();
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index !== -1) {
      leads[index] = { ...leads[index], ...leadData };
      return { ...leads[index] };
    }
    return null;
  },

  async delete(id) {
    await delay();
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index !== -1) {
      const deletedLead = leads.splice(index, 1)[0];
      return { ...deletedLead };
    }
    return null;
  },

  async addContactHistory(id, contact) {
    await delay();
    const lead = leads.find(l => l.Id === parseInt(id));
    if (lead) {
      if (!lead.contactHistory) lead.contactHistory = [];
      lead.contactHistory.unshift({
        ...contact,
        date: new Date().toISOString()
      });
      lead.lastContact = new Date().toISOString();
      return { ...lead };
    }
    return null;
  },

  async scheduleAppointment(id, appointment) {
    await delay();
    const lead = leads.find(l => l.Id === parseInt(id));
    if (lead) {
      if (!lead.appointments) lead.appointments = [];
      lead.appointments.push({
        ...appointment,
        status: "Scheduled"
      });
return { ...lead };
    }
    return null;
  },

  async getVehicleRecommendations(leadId, vehicles, deals) {
    await delay();
    const lead = leads.find(l => l.Id === parseInt(leadId));
    if (!lead) return null;

    // Calculate lead engagement score
    const engagementFactors = {
      contactCount: lead.contactHistory?.length || 0,
      appointmentCount: lead.appointments?.length || 0,
      leadScore: lead.leadScore || 50,
      hasTradeIn: lead.tradeIn ? 1 : 0,
      budgetDefined: lead.budget ? 1 : 0
    };

    // Score available vehicles based on lead preferences
    const availableVehicles = vehicles.filter(v => v.status === "Available");
    const recommendations = availableVehicles.map(vehicle => {
      let score = 0;
      let reasons = [];

      // Budget compatibility (35 points max)
      if (lead.budget && vehicle.askingPrice <= lead.budget) {
        const budgetEfficiency = 1 - (vehicle.askingPrice / lead.budget);
        score += budgetEfficiency * 35;
        reasons.push(`Within $${lead.budget.toLocaleString()} budget`);
      } else if (!lead.budget) {
        score += 15; // Neutral score if no budget specified
      }

      // Interest alignment (30 points max)
      if (lead.interestedVehicles && lead.interestedVehicles.includes(vehicle.Id)) {
        score += 30;
        reasons.push("Previously expressed interest");
      }

      // Vehicle popularity and market position (20 points max)
      const marketValueRatio = vehicle.marketValue > 0 ? vehicle.askingPrice / vehicle.marketValue : 1;
      if (marketValueRatio < 1.1) {
        score += 20;
        reasons.push("Great market value");
      } else if (marketValueRatio > 1.2) {
        score -= 5; // Penalty for overpriced vehicles
      }

      // Inventory age factor (15 points max)
      if (vehicle.daysInInventory > 90) {
        score += 15;
        reasons.push("Potential for negotiation");
      } else if (vehicle.daysInInventory < 30) {
        score += 10;
        reasons.push("Recently acquired");
      }

      // Lead score influence
      const leadScoreMultiplier = lead.leadScore / 100;
      score *= leadScoreMultiplier;

      // Vehicle condition bonus
      if (vehicle.condition === "Excellent") {
        score += 5;
        reasons.push("Excellent condition");
      }

      // Fuel efficiency for cost-conscious buyers
      if (vehicle.fuelType === "Hybrid" && lead.budget && lead.budget < 30000) {
        score += 10;
        reasons.push("Fuel-efficient hybrid");
      }

      return {
        vehicleId: vehicle.Id,
        vehicle,
        aiScore: Math.round(score),
        matchReasons: reasons,
        estimatedMonthlyPayment: this.calculatePayment(vehicle.askingPrice, lead.budget, lead.tradeIn),
        recommendationRank: 0, // Will be set after sorting
        generatedAt: new Date().toISOString()
      };
    });

    // Sort by AI score and assign ranks
    const sortedRecommendations = recommendations
      .sort((a, b) => b.aiScore - a.aiScore)
      .map((rec, index) => ({ ...rec, recommendationRank: index + 1 }))
      .slice(0, 6); // Top 6 recommendations

    return {
      leadId: parseInt(leadId),
      leadData: { ...lead },
      engagementScore: Math.round(
        (engagementFactors.contactCount * 10) +
        (engagementFactors.appointmentCount * 15) +
        (engagementFactors.leadScore * 0.3) +
        (engagementFactors.hasTradeIn * 10) +
        (engagementFactors.budgetDefined * 10)
      ),
      recommendations: sortedRecommendations,
      totalVehiclesAnalyzed: availableVehicles.length,
      generatedAt: new Date().toISOString()
    };
  },

  calculatePayment(price, budget, hasTradeIn) {
    const tradeValue = hasTradeIn ? Math.min(budget * 0.3, 8000) : 0; // Estimate trade value
    const downPayment = Math.min(budget * 0.1, 3000); // 10% down or $3k max
    const loanAmount = price - tradeValue - downPayment;
    
    if (loanAmount <= 0) return 0;
    
    const monthlyRate = 0.049 / 12; // 4.9% APR
    const months = 60;
    const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(payment);
  }
};