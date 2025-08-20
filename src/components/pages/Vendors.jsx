import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vendorService from "@/services/api/vendorService";
import ApperIcon from "@/components/ApperIcon";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
state: '',
    zipCode: '',
    category: 'parts',
    website: '',
    rating: 1,
    status: 'active',
    contractStartDate: '',
    paymentTerms: '30',
    notes: ''
  });

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'parts', label: 'Parts Supplier' },
    { value: 'service', label: 'Service Provider' },
    { value: 'reconditioning', label: 'Reconditioning' },
    { value: 'transport', label: 'Transport' },
    { value: 'finance', label: 'Finance' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAll();
      setVendors(data);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await vendorService.update(editingVendor.Id, formData);
        toast.success('Vendor updated successfully');
      } else {
        await vendorService.create(formData);
        toast.success('Vendor created successfully');
      }
      loadVendors();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save vendor');
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({ ...vendor });
    setShowAddModal(true);
  };

  const handleDelete = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorService.delete(vendorId);
        toast.success('Vendor deleted successfully');
        loadVendors();
      } catch (error) {
        toast.error('Failed to delete vendor');
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingVendor(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
zipCode: '',
      category: 'parts',
      website: '',
      rating: 1,
      status: 'active',
      contractStartDate: '',
      contractEndDate: '',
      paymentTerms: '30',
      notes: ''
    });
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'parts': return 'Settings';
      case 'service': return 'Wrench';
      case 'reconditioning': return 'PaintBucket';
      case 'transport': return 'Truck';
      case 'finance': return 'DollarSign';
      case 'insurance': return 'Shield';
      case 'marketing': return 'Megaphone';
      default: return 'Building';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <ApperIcon
        key={i}
        name={i < rating ? "Star" : "Star"}
        size={16}
        className={i < rating ? "text-amber-400 fill-current" : "text-slate-300"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <ApperIcon name="Loader2" className="animate-spin" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
    {/* Header */}
    <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-semibold text-slate-900">Vendor Management</h1>
            <p className="text-slate-600 mt-1">Manage your supplier and service provider relationships</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <ApperIcon name="Plus" size={16} />Add Vendor
                    </Button>
    </div>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <ApperIcon name="Building" className="text-blue-600" size={20} />
                </div>
                <div>
                    <p className="text-sm text-slate-600">Total Vendors</p>
                    <p className="text-xl font-semibold">{vendors.length}</p>
                </div>
            </div>
        </Card>
        <Card className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                    <ApperIcon name="CheckCircle" className="text-green-600" size={20} />
                </div>
                <div>
                    <p className="text-sm text-slate-600">Active</p>
                    <p className="text-xl font-semibold">
                        {vendors.filter(v => v.status === "active").length}
                    </p>
                </div>
            </div>
        </Card>
        <Card className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                    <ApperIcon name="Clock" className="text-amber-600" size={20} />
                </div>
                <div>
                    <p className="text-sm text-slate-600">Pending</p>
                    <p className="text-xl font-semibold">
                        {vendors.filter(v => v.status === "pending").length}
                    </p>
                </div>
            </div>
        </Card>
        <Card className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <ApperIcon name="Star" className="text-purple-600" size={20} />
                </div>
                <div>
                    <p className="text-sm text-slate-600">Avg Rating</p>
                    <p className="text-xl font-semibold">
                        {vendors.length > 0 ? (vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length).toFixed(1) : "0.0"}
                    </p>
                </div>
            </div>
        </Card>
    </div>
    {/* Search and Filters */}
    <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search vendors by name, contact, or email..." />
            </div>
            <div className="flex gap-2">
                <FilterDropdown
                    options={categoryOptions}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    placeholder="Category" />
                <FilterDropdown
                    options={statusOptions}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Status" />
            </div>
        </div>
    </Card>
    {/* Vendors Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map(
            vendor => <Card key={vendor.Id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <ApperIcon name={getCategoryIcon(vendor.category)} size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">{vendor.name}</h3>
                                <p className="text-sm text-slate-600">{vendor.contactPerson}</p>
                            </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(vendor.status)}>
                            {vendor.status}
                        </Badge>
                    </div>
                    {/* Contact Info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <ApperIcon name="Mail" size={14} />
                            <span className="truncate">{vendor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <ApperIcon name="Phone" size={14} />
                            <span>{vendor.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <ApperIcon name="MapPin" size={14} />
                            <span className="truncate">{vendor.city}, {vendor.state}</span>
                        </div>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {renderStars(vendor.rating)}
                        </div>
                        <span className="text-sm text-slate-600">({vendor.rating}/5)</span>
                    </div>
                    {/* Category */}
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">
                            {categoryOptions.find(cat => cat.value === vendor.category)?.label}
                        </Badge>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(vendor)}
                            className="flex-1 flex items-center justify-center gap-1">
                            <ApperIcon name="Edit" size={14} />Edit
                                            </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(vendor.Id)}
                            className="flex items-center justify-center gap-1 text-red-600 border-red-200 hover:bg-red-50">
                            <ApperIcon name="Trash2" size={14} />Delete
                                            </Button>
                    </div>
                </div>
            </Card>
        )}
    </div>
    {/* Empty State */}
    {filteredVendors.length === 0 && <Card className="p-12 text-center">
        <ApperIcon name="Building" size={48} className="mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No vendors found</h3>
        <p className="text-slate-600 mb-4">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all" ? "Try adjusting your search or filters" : "Get started by adding your first vendor"}
        </p>
        {!searchTerm && categoryFilter === "all" && statusFilter === "all" && <Button onClick={() => setShowAddModal(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />Add First Vendor
                        </Button>}
    </Card>}
    {/* Add/Edit Modal */}
    {showAddModal && <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                        {editingVendor ? "Edit Vendor" : "Add New Vendor"}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                        <ApperIcon name="X" size={16} />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Vendor Name *"
                            value={formData.name}
                            onChange={e => setFormData({
                                ...formData,
                                name: e.target.value
                            })}
                            required />
                        <Input
                            label="Contact Person *"
                            value={formData.contactPerson}
                            onChange={e => setFormData({
                                ...formData,
                                contactPerson: e.target.value
                            })}
                            required />
                        <Input
                            label="Email *"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({
                                ...formData,
                                email: e.target.value
                            })}
                            required />
                        <Input
                            label="Phone *"
                            value={formData.phone}
                            onChange={e => setFormData({
                                ...formData,
                                phone: e.target.value
                            })}
                            required />
                        <div className="sm:col-span-2">
                            <Input
                                label="Address"
                                value={formData.address}
                                onChange={e => setFormData({
                                    ...formData,
                                    address: e.target.value
                                })} />
                        </div>
                        <Input
                            label="City"
                            value={formData.city}
                            onChange={e => setFormData({
                                ...formData,
                                city: e.target.value
                            })} />
                        <Input
                            label="State"
                            value={formData.state}
                            onChange={e => setFormData({
                                ...formData,
                                state: e.target.value
                            })} />
                        <Input
                            label="ZIP Code"
                            value={formData.zipCode}
                            onChange={e => setFormData({
                                ...formData,
                                zipCode: e.target.value
                            })} />
                        <Input
                            label="Website"
                            value={formData.website}
                            onChange={e => setFormData({
                                ...formData,
                                website: e.target.value
                            })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category *
                                                    </label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({
                                    ...formData,
                                    category: e.target.value
                                })}
                                className="input-field"
                                required>
                                {categoryOptions.slice(1).map(option => <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status *
                                                    </label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({
                                    ...formData,
                                    status: e.target.value
                                })}
                                className="input-field"
                                required>
                                {statusOptions.slice(1).map(option => <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rating
                                <select
                                    id="rating"
                                    value={formData.rating || 1}
                                    onChange={e => {
                                        const value = parseInt(e.target.value);
                                        const validRating = isNaN(value) || value < 1 || value > 5 ? 1 : value;

                                        setFormData({
                                            ...formData,
                                            rating: validRating
                                        });
                                    }}
                                    className="input-field">
                                    {[1, 2, 3, 4, 5].map(
                                        num => <option key={num} value={num}>{num}Star{num !== 1 ? "s" : ""}</option>
                                    )}
                                </select>
                            </label></div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Contract Start"
                                type="date"
                                value={formData.contractStartDate}
                                onChange={e => setFormData({
                                    ...formData,
                                    contractStartDate: e.target.value
                                })} />
                            <Input
                                label="Contract End"
                                type="date"
                                value={formData.contractEndDate}
                                onChange={e => setFormData({
                                    ...formData,
                                    contractEndDate: e.target.value
                                })} />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms
                                                        </label>
                                <select
                                    value={formData.paymentTerms}
                                    onChange={e => setFormData({
                                        ...formData,
                                        paymentTerms: e.target.value
                                    })}
                                    className="input-field">
                                    <option value="15">Net 15</option>
                                    <option value="30">Net 30</option>
                                    <option value="45">Net 45</option>
                                    <option value="60">Net 60</option>
                                    <option value="90">Net 90</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes
                                                  </label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({
                                    ...formData,
                                    notes: e.target.value
                                })}
                                className="input-field"
                                rows={3}
                                placeholder="Additional notes about this vendor..." />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1">
                                {editingVendor ? "Update Vendor" : "Create Vendor"}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel
                                                  </Button>
                        </div>
                    </div></form>
            </div>
        </Card>
    </div>}
</div>
  );
}

export default Vendors;