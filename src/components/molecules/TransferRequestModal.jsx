import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const TransferRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  branches,
  selectedBranch,
  vehicles
}) => {
  const [formData, setFormData] = useState({
    fromBranchId: selectedBranch?.Id || "",
    toBranchId: "",
    vehicleId: "",
    quantity: 1,
    notes: "",
    priority: "normal"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBranches = branches.filter(b => b.Id !== selectedBranch?.Id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.toBranchId || !formData.vehicleId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        fromBranchId: selectedBranch.Id
      });
      setFormData({
        fromBranchId: selectedBranch?.Id || "",
        toBranchId: "",
        vehicleId: "",
        quantity: 1,
        notes: "",
        priority: "normal"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedVehicle = vehicles.find(v => v.Id === Number(formData.vehicleId));
  const toBranch = branches.find(b => b.Id === Number(formData.toBranchId));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Create Transfer Request
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* From/To Branch Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                From Branch
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="font-medium text-slate-900">
                  {selectedBranch?.name}
                </div>
                <div className="text-sm text-slate-500">
                  {selectedBranch?.location}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                To Branch *
              </label>
              <select
                value={formData.toBranchId}
                onChange={(e) => handleChange("toBranchId", Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select destination branch</option>
                {availableBranches.map(branch => (
                  <option key={branch.Id} value={branch.Id}>
                    {branch.name} - {branch.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Vehicle *
            </label>
            <select
              value={formData.vehicleId}
              onChange={(e) => handleChange("vehicleId", Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select vehicle to transfer</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.Id} value={vehicle.Id}>
                  {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
                </option>
              ))}
            </select>
            {selectedVehicle && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </div>
                    <div className="text-sm text-slate-500">
                      VIN: {selectedVehicle.vin} • {selectedVehicle.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-900">
                      ${selectedVehicle.askingPrice?.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">
                      {selectedVehicle.mileage?.toLocaleString()} miles
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Priority
            </label>
            <div className="flex space-x-4">
              {[
                { value: "low", label: "Low", color: "text-green-600" },
                { value: "normal", label: "Normal", color: "text-blue-600" },
                { value: "high", label: "High", color: "text-amber-600" },
                { value: "urgent", label: "Urgent", color: "text-red-600" }
              ].map((priority) => (
                <label key={priority.value} className="flex items-center">
                  <input
                    type="radio"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="mr-2"
                  />
                  <span className={cn("text-sm font-medium", priority.color)}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <Input
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Additional notes or special instructions..."
            containerClassName="space-y-2"
          />

          {/* Transfer Summary */}
          {selectedVehicle && toBranch && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
              <h3 className="font-medium text-slate-900 mb-2">Transfer Summary</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <div>
                  Vehicle: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </div>
                <div>
                  From: {selectedBranch?.name} → To: {toBranch.name}
                </div>
                <div>
                  Priority: <span className="capitalize font-medium">{formData.priority}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!formData.toBranchId || !formData.vehicleId}
            >
              <ApperIcon name="Send" size={16} />
              Create Transfer Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TransferRequestModal;