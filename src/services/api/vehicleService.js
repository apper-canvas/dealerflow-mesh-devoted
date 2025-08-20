import vehiclesData from "@/services/mockData/vehicles.json";

let vehicles = [...vehiclesData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const vehicleService = {
async getAll() {
    await delay();
    return vehicles.map(vehicle => ({ 
      ...vehicle, 
      branchId: vehicle.branchId || 1 // Default to branch 1 if not set
    }));
  },

  async getByBranch(branchId) {
    await delay();
    return vehicles
      .filter(vehicle => (vehicle.branchId || 1) === branchId)
      .map(vehicle => ({ 
        ...vehicle, 
        branchId: vehicle.branchId || 1
      }));
  },

  async createTransferRequest(transferData) {
    await delay();
    // In a real app, this would create a transfer request record
    // For now, we'll just simulate success
    console.log('Transfer request created:', transferData);
    return { success: true, requestId: Date.now() };
  },

  async getById(id) {
    await delay();
    const vehicle = vehicles.find(v => v.Id === parseInt(id));
    return vehicle ? { ...vehicle } : null;
  },

  async create(vehicleData) {
    await delay();
    const maxId = Math.max(...vehicles.map(v => v.Id), 0);
    const newVehicle = {
      ...vehicleData,
      Id: maxId + 1,
      daysInInventory: 0,
      status: "Available"
    };
    vehicles.push(newVehicle);
    return { ...newVehicle };
  },

  async update(id, vehicleData) {
    await delay();
    const index = vehicles.findIndex(v => v.Id === parseInt(id));
    if (index !== -1) {
      vehicles[index] = { ...vehicles[index], ...vehicleData };
      return { ...vehicles[index] };
    }
    return null;
  },

  async delete(id) {
    await delay();
    const index = vehicles.findIndex(v => v.Id === parseInt(id));
    if (index !== -1) {
      const deletedVehicle = vehicles.splice(index, 1)[0];
      return { ...deletedVehicle };
    }
    return null;
  },

  async searchByVin(vin) {
    await delay();
    // Mock VIN lookup with vehicle data
    return {
      vin: vin,
      year: 2023,
      make: "Honda",
      model: "Accord",
      trim: "EX",
      mileage: 0,
      bodyType: "Sedan",
      transmission: "CVT Automatic",
      fuelType: "Gasoline",
      color: "Unknown",
      marketValue: 32000,
features: ["Backup Camera", "Bluetooth", "Cruise Control", "Power Windows"],
      description: "Vehicle data retrieved from VIN database"
    };
  },

  // Publication management methods
  async updatePublicationStatus(id, platform, status, listingId = null) {
    await delay(300);
    const vehicle = vehicles.find(v => v.Id === parseInt(id));
    if (!vehicle) throw new Error('Vehicle not found');
    
    if (!vehicle.publications) {
      vehicle.publications = {};
    }
    
    vehicle.publications[platform] = {
      status,
      listingId,
      publishedAt: status === 'published' ? new Date().toISOString() : null,
      lastUpdated: new Date().toISOString()
    };
    
    return vehicle;
  },

  async getPublicationStatus(id) {
    await delay(200);
    const vehicle = vehicles.find(v => v.Id === parseInt(id));
    if (!vehicle) throw new Error('Vehicle not found');
    
    return vehicle.publications || {};
  }
};