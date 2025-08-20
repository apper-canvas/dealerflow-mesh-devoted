import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VehicleGrid from "@/components/organisms/VehicleGrid";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import BranchSelector from "@/components/molecules/BranchSelector";
import TransferRequestModal from "@/components/molecules/TransferRequestModal";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { vehicleService } from "@/services/api/vehicleService";
import { branchService } from "@/services/api/branchService";
import { toast } from "react-toastify";

const Inventory = () => {
  const navigate = useNavigate();
const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [makeFilter, setMakeFilter] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showTransferModal, setShowTransferModal] = useState(false);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Available", label: "Available" },
    { value: "Pending", label: "Pending" },
    { value: "Sold", label: "Sold" }
  ];

const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [vehicleData, branchData] = await Promise.all([
        vehicleService.getAll(),
        branchService.getAll()
      ]);
      setVehicles(vehicleData);
      setFilteredVehicles(vehicleData);
      setBranches(branchData);
      
      // Set default branch if none selected
      if (!selectedBranch && branchData.length > 0) {
        setSelectedBranch(branchData[0]);
      }
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    if (!selectedBranch) return;
    
    setLoading(true);
    try {
      const data = await vehicleService.getByBranch(selectedBranch.Id);
      setVehicles(data);
      setFilteredVehicles(data);
    } catch (err) {
      setError("Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      loadVehicles();
    }
  }, [selectedBranch]);

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
  };

  const handleTransferRequest = async (transferData) => {
    try {
      await vehicleService.createTransferRequest(transferData);
      toast.success("Transfer request created successfully!");
      setShowTransferModal(false);
      loadVehicles(); // Refresh inventory
    } catch (err) {
      toast.error("Failed to create transfer request. Please try again.");
    }
  };

  // Create make options from vehicles
  const makeOptions = [
    { value: "", label: "All Makes" },
    ...Array.from(new Set(vehicles.map(v => v.make)))
      .map(make => ({ value: make, label: make }))
  ];

  // Filter vehicles based on search and filters
  useEffect(() => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.year.toString().includes(searchTerm) ||
        vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter?.value) {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter.value);
    }

    if (makeFilter?.value) {
      filtered = filtered.filter(vehicle => vehicle.make === makeFilter.value);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilter, makeFilter]);

  const handleAddVehicle = () => {
    navigate("/inventory/add");
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

const availableCount = vehicles.filter(v => v.status === "Available").length;
  const totalValue = filteredVehicles.reduce((sum, v) => sum + (v.askingPrice || 0), 0);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <div className="flex items-center space-x-6 mb-2">
            <div>
              <p className="text-sm text-slate-500">Total Inventory</p>
              <p className="text-2xl font-bold text-slate-900">{vehicles.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Available</p>
              <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <Button onClick={handleAddVehicle} size="lg">
          <ApperIcon name="Plus" />
          Add Vehicle
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Search by make, model, year, or VIN..."
            onSearch={handleSearch}
          />
        </div>
        
<div className="flex items-center space-x-4">
          <BranchSelector
            branches={branches}
            selectedBranch={selectedBranch}
            onChange={handleBranchChange}
          />
          
          <FilterDropdown
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Status"
            label="Status"
          />
          
          <FilterDropdown
            options={makeOptions}
            value={makeFilter}
            onChange={setMakeFilter}
            placeholder="All Makes"
            label="Make"
          />
          
          <Button
            variant="secondary"
            onClick={() => setShowTransferModal(true)}
            disabled={filteredVehicles.length === 0}
          >
            <ApperIcon name="ArrowLeftRight" size={16} />
            Transfer Request
          </Button>
          
          <div className="flex items-center space-x-2 border border-slate-200 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <ApperIcon name="Grid3X3" className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ApperIcon name="List" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <p>
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
          {searchTerm && ` for "${searchTerm}"`}
        </p>
        
        {filteredVehicles.length > 0 && (
          <p>
            Total value: ${filteredVehicles.reduce((sum, v) => sum + (v.askingPrice || 0), 0).toLocaleString()}
          </p>
        )}
      </div>

      {/* Vehicle Grid */}
<VehicleGrid 
        vehicles={filteredVehicles}
        loading={false}
        error=""
      />

      <TransferRequestModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSubmit={handleTransferRequest}
        branches={branches}
        selectedBranch={selectedBranch}
        vehicles={filteredVehicles.filter(v => v.status === "Available")}
      />
</div>
  );
};

export default Inventory;