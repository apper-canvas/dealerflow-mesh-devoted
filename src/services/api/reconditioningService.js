import reconditioningData from '@/services/mockData/reconditioning.json';
import techniciansData from '@/services/mockData/technicians.json';

// Simulate API delay
function delay() {
  return new Promise(resolve => setTimeout(resolve, 300));
}

// Mock data state
let reconditioning = [...reconditioningData];
let technicians = [...techniciansData];
let nextId = Math.max(...reconditioning.map(r => r.Id)) + 1;

// Reconditioning API methods
export const reconditioningService = {
  // Get all reconditioning records
  async getAll() {
    await delay();
    return [...reconditioning];
  },

  // Get reconditioning by ID
  async getById(id) {
    await delay();
    const numId = parseInt(id);
    const record = reconditioning.find(r => r.Id === numId);
    if (!record) {
      throw new Error('Reconditioning record not found');
    }
    return { ...record };
  },

  // Get reconditioning by vehicle ID
  async getByVehicleId(vehicleId) {
    await delay();
    const numVehicleId = parseInt(vehicleId);
    return reconditioning.filter(r => r.vehicleId === numVehicleId).map(r => ({ ...r }));
  },

  // Create new reconditioning record
  async create(data) {
    await delay();
    const newRecord = {
      ...data,
      Id: nextId++,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };
    reconditioning.push(newRecord);
    return { ...newRecord };
  },

  // Update reconditioning record
  async update(id, data) {
    await delay();
    const numId = parseInt(id);
    const index = reconditioning.findIndex(r => r.Id === numId);
    if (index === -1) {
      throw new Error('Reconditioning record not found');
    }
    reconditioning[index] = {
      ...reconditioning[index],
      ...data,
      Id: numId,
      updatedDate: new Date().toISOString()
    };
    return { ...reconditioning[index] };
  },

  // Delete reconditioning record
  async delete(id) {
    await delay();
    const numId = parseInt(id);
    const index = reconditioning.findIndex(r => r.Id === numId);
    if (index === -1) {
      throw new Error('Reconditioning record not found');
    }
    reconditioning.splice(index, 1);
    return true;
  },

  // Update checklist item
  async updateChecklistItem(id, itemIndex, completed) {
    await delay();
    const numId = parseInt(id);
    const record = reconditioning.find(r => r.Id === numId);
    if (!record) {
      throw new Error('Reconditioning record not found');
    }
    if (record.checklist && record.checklist[itemIndex]) {
      record.checklist[itemIndex].completed = completed;
      record.updatedDate = new Date().toISOString();
    }
    return { ...record };
  }
};

// Technician API methods
export const technicianService = {
  // Get all technicians
  async getAll() {
    await delay();
    return [...technicians];
  },

  // Get technician by ID
  async getById(id) {
    await delay();
    const numId = parseInt(id);
    const technician = technicians.find(t => t.Id === numId);
    if (!technician) {
      throw new Error('Technician not found');
    }
    return { ...technician };
  },

  // Get available technicians for date range
  async getAvailable(startDate, endDate) {
    await delay();
    // In a real app, this would check actual schedules and bookings
    return technicians.filter(t => t.status === 'Available').map(t => ({ ...t }));
  },

  // Update technician status
  async updateStatus(id, status) {
    await delay();
    const numId = parseInt(id);
    const index = technicians.findIndex(t => t.Id === numId);
    if (index === -1) {
      throw new Error('Technician not found');
    }
    technicians[index].status = status;
    return { ...technicians[index] };
  }
};

// Service types configuration
export const serviceTypes = [
  {
    name: 'Full Detail',
    estimatedHours: 6,
    description: 'Complete interior and exterior cleaning and detailing',
    category: 'Detailing'
  },
  {
    name: 'Express Detail',
    estimatedHours: 3,
    description: 'Quick exterior wash and interior vacuum',
    category: 'Detailing'
  },
  {
    name: 'Mechanical Inspection',
    estimatedHours: 4,
    description: 'Comprehensive mechanical systems check',
    category: 'Mechanical'
  },
  {
    name: 'Engine Diagnostic',
    estimatedHours: 2,
    description: 'Computer diagnostic and engine analysis',
    category: 'Mechanical'
  },
  {
    name: 'Body Work',
    estimatedHours: 8,
    description: 'Bodywork repairs and paint touch-ups',
    category: 'Body'
  },
  {
    name: 'Paint Correction',
    estimatedHours: 5,
    description: 'Paint defect removal and correction',
    category: 'Body'
  },
  {
    name: 'Interior Repair',
    estimatedHours: 4,
    description: 'Interior component repair and restoration',
    category: 'Interior'
  },
  {
    name: 'Tire Service',
    estimatedHours: 2,
    description: 'Tire inspection, rotation, and replacement',
    category: 'Mechanical'
  }
];

export default reconditioningService;