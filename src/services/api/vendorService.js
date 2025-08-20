import vendorsData from '@/services/mockData/vendors.json';

class VendorService {
  constructor() {
    this.vendors = [...vendorsData];
    this.nextId = Math.max(...this.vendors.map(v => v.Id)) + 1;
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.vendors];
  }

  async getById(id) {
    // Validate ID is integer
    const vendorId = parseInt(id);
    if (isNaN(vendorId)) {
      throw new Error('Invalid vendor ID');
    }

    await new Promise(resolve => setTimeout(resolve, 50));
    const vendor = this.vendors.find(v => v.Id === vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    return { ...vendor };
  }

  async create(vendorData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newVendor = {
      ...vendorData,
      Id: this.nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.vendors.push(newVendor);
    return { ...newVendor };
  }

  async update(id, vendorData) {
    const vendorId = parseInt(id);
    if (isNaN(vendorId)) {
      throw new Error('Invalid vendor ID');
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.vendors.findIndex(v => v.Id === vendorId);
    if (index === -1) {
      throw new Error('Vendor not found');
    }
    
    this.vendors[index] = {
      ...this.vendors[index],
      ...vendorData,
      Id: vendorId, // Preserve original ID
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.vendors[index] };
  }

  async delete(id) {
    const vendorId = parseInt(id);
    if (isNaN(vendorId)) {
      throw new Error('Invalid vendor ID');
    }

    await new Promise(resolve => setTimeout(resolve, 150));
    
    const index = this.vendors.findIndex(v => v.Id === vendorId);
    if (index === -1) {
      throw new Error('Vendor not found');
    }
    
    this.vendors.splice(index, 1);
    return true;
  }

  async getByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.vendors.filter(v => v.category === category);
  }

  async getByStatus(status) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.vendors.filter(v => v.status === status);
  }

  async search(searchTerm) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const term = searchTerm.toLowerCase();
    return this.vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(term) ||
      vendor.contactPerson.toLowerCase().includes(term) ||
      vendor.email.toLowerCase().includes(term) ||
      vendor.category.toLowerCase().includes(term)
    );
  }
}

const vendorService = new VendorService();
export default vendorService;