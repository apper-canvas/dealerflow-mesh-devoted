import branchesData from "@/services/mockData/branches.json";

const delay = () => new Promise(resolve => setTimeout(resolve, 300));

let branches = [...branchesData];

export const branchService = {
  async getAll() {
    await delay();
    return branches.map(branch => ({ ...branch }));
  },

  async getById(id) {
    await delay();
    const branch = branches.find(b => b.Id === parseInt(id));
    if (!branch) {
      throw new Error('Branch not found');
    }
    return { ...branch };
  },

  async create(branchData) {
    await delay();
    const newId = Math.max(...branches.map(b => b.Id)) + 1;
    const newBranch = {
      ...branchData,
      Id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    branches.push(newBranch);
    return { ...newBranch };
  },

  async update(id, branchData) {
    await delay();
    const index = branches.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Branch not found');
    }
    branches[index] = {
      ...branches[index],
      ...branchData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    return { ...branches[index] };
  },

  async delete(id) {
    await delay();
    const index = branches.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Branch not found');
    }
    branches.splice(index, 1);
    return { success: true };
  }
};