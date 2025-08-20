import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vehicleService } from "@/services/api/vehicleService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Inventory from "@/components/pages/Inventory";
import Leads from "@/components/pages/Leads";
import Reconditioning from "@/components/pages/Reconditioning";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import ListingManager from "@/components/molecules/ListingManager";
const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showListingManager, setShowListingManager] = useState(false);
  const loadVehicle = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await vehicleService.getById(id);
      if (data) {
        setVehicle(data);
      } else {
        setError("Vehicle not found");
      }
    } catch (err) {
      setError("Failed to load vehicle details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await vehicleService.update(id, { status: newStatus });
      setVehicle({ ...vehicle, status: newStatus });
      toast.success(`Vehicle status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update vehicle status");
    }
  };
const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleService.delete(id);
        toast.success("Vehicle deleted successfully");
        navigate("/inventory");
      } catch (err) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const handleListingUpdate = () => {
    loadVehicle(); // Refresh vehicle data to show updated publication status
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadVehicle} />;
  if (!vehicle) return <Error message="Vehicle not found" />;

  const getStatusVariant = (status) => {
    switch (status) {
      case "Available": return "success";
      case "Pending": return "warning";
      case "Sold": return "default";
      default: return "default";
    }
  };

  const margin = vehicle.askingPrice - vehicle.purchasePrice;
  const marginPercent = vehicle.purchasePrice > 0 ? ((margin / vehicle.purchasePrice) * 100).toFixed(1) : 0;

  const specs = [
    { label: "VIN", value: vehicle.vin, icon: "Hash" },
    { label: "Body Type", value: vehicle.bodyType, icon: "Car" },
    { label: "Transmission", value: vehicle.transmission, icon: "Settings" },
    { label: "Fuel Type", value: vehicle.fuelType, icon: "Fuel" },
    { label: "Color", value: vehicle.color, icon: "Palette" },
    { label: "Location", value: vehicle.location, icon: "MapPin" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/inventory")}>
            <ApperIcon name="ArrowLeft" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-slate-600">{vehicle.trim}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={getStatusVariant(vehicle.status)}>
            {vehicle.status}
          </Badge>
          <Button variant="secondary">
            <ApperIcon name="Edit" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <ApperIcon name="Trash2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images and Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              <img
                src={vehicle.photos?.[currentImageIndex] || "https://images.unsplash.com/photo-1494697536454-6f39e2cc972d?w=800&h=400&fit=crop"}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-96 object-cover"
              />
              
              {vehicle.photos?.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
                  >
                    <ApperIcon name="ChevronLeft" className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(Math.min(vehicle.photos.length - 1, currentImageIndex + 1))}
                    disabled={currentImageIndex === vehicle.photos.length - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
                  >
                    <ApperIcon name="ChevronRight" className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            
            {vehicle.photos?.length > 1 && (
              <div className="flex space-x-2 p-4 overflow-x-auto">
                {vehicle.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? "border-primary-500" : "border-slate-200"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Specifications */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Vehicle Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center space-x-3">
                  <ApperIcon name={spec.icon} className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">{spec.label}</p>
                    <p className="font-medium text-slate-900">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Features & Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {vehicle.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <ApperIcon name="Check" className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Description */}
          {vehicle.description && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Description</h3>
              <p className="text-slate-700">{vehicle.description}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pricing Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Asking Price</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  ${vehicle.askingPrice?.toLocaleString()}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Market Value</span>
                <span className="font-semibold text-slate-700">
                  ${vehicle.marketValue?.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Purchase Price</span>
                <span className="font-semibold text-slate-700">
                  ${vehicle.purchasePrice?.toLocaleString()}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Gross Margin</span>
                  <div className="text-right">
                    <span className="font-bold text-green-600">
                      ${margin?.toLocaleString()}
                    </span>
                    <span className="text-sm text-green-600 ml-2">
                      ({marginPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Inventory Status */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Inventory Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Days in Inventory</p>
                <p className={`text-2xl font-bold ${
                  vehicle.daysInInventory > 90 ? "text-red-600" : 
                  vehicle.daysInInventory > 60 ? "text-amber-600" : "text-green-600"
                }`}>
                  {vehicle.daysInInventory} days
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Mileage</span>
                <span className="font-semibold text-slate-700">
                  {vehicle.mileage?.toLocaleString()} mi
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Condition</span>
<Badge variant="success">{vehicle.condition}</Badge>
              </div>
            </div>
          </Card>

          {/* Listing Management */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Online Listings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Globe" className="text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Cars.com</p>
                    <p className="text-sm text-slate-500">
                      {vehicle.publications?.carscom?.status === 'published' ? 'Published' : 
                       vehicle.publications?.carscom?.status === 'pending' ? 'Publishing...' : 'Not Published'}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  vehicle.publications?.carscom?.status === 'published' ? 'success' :
                  vehicle.publications?.carscom?.status === 'pending' ? 'warning' : 'secondary'
                }>
                  {vehicle.publications?.carscom?.status === 'published' ? 'Live' :
                   vehicle.publications?.carscom?.status === 'pending' ? 'Processing' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Car" className="text-orange-600" />
                  <div>
                    <p className="font-medium text-slate-900">AutoTrader</p>
                    <p className="text-sm text-slate-500">
                      {vehicle.publications?.autotrader?.status === 'published' ? 'Published' : 
                       vehicle.publications?.autotrader?.status === 'pending' ? 'Publishing...' : 'Not Published'}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  vehicle.publications?.autotrader?.status === 'published' ? 'success' :
                  vehicle.publications?.autotrader?.status === 'pending' ? 'warning' : 'secondary'
                }>
                  {vehicle.publications?.autotrader?.status === 'published' ? 'Live' :
                   vehicle.publications?.autotrader?.status === 'pending' ? 'Processing' : 'Inactive'}
                </Badge>
              </div>

              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => setShowListingManager(true)}
              >
                <ApperIcon name="Upload" />
                Manage Listings
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {vehicle.status === "Available" && (
                <>
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => handleStatusChange("Pending")}
                  >
                    Mark as Pending
                  </Button>
                  <Button 
                    variant="success" 
                    className="w-full"
                    onClick={() => handleStatusChange("Sold")}
                  >
                    Mark as Sold
                  </Button>
                </>
              )}
              
              {vehicle.status === "Pending" && (
                <>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => handleStatusChange("Available")}
                  >
                    Mark as Available
                  </Button>
                  <Button 
                    variant="success" 
                    className="w-full"
                    onClick={() => handleStatusChange("Sold")}
                  >
                    Mark as Sold
                  </Button>
                </>
              )}
              
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => navigate(`/reconditioning?vehicleId=${vehicle.Id}`)}
              >
                <ApperIcon name="Wrench" />
                Schedule Reconditioning
              </Button>
              
              <Button variant="secondary" className="w-full">
                <ApperIcon name="Users" />
                View Interested Leads
              </Button>
              
              <Button variant="secondary" className="w-full">
                <ApperIcon name="FileText" />
                Generate Report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Listing Manager Modal */}
      {showListingManager && (
        <ListingManager
          vehicle={vehicle}
          onClose={() => setShowListingManager(false)}
          onUpdate={handleListingUpdate}
        />
      )}
    </div>
  );
};

export default VehicleDetails;