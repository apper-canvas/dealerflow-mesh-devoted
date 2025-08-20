import React, { useState } from 'react';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';
import { serviceTypes } from '@/services/api/reconditioningService';

function ServiceTypeSelector({ selectedServiceType, onServiceTypeChange, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', ...new Set(serviceTypes.map(service => service.category))];
  
  const filteredServices = selectedCategory === 'All' 
    ? serviceTypes 
    : serviceTypes.filter(service => service.category === selectedCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Detailing': return 'Sparkles';
      case 'Mechanical': return 'Wrench';
      case 'Body': return 'Palette';
      case 'Interior': return 'Car';
      default: return 'Settings';
    }
  };

  const handleServiceSelect = (serviceType) => {
    onServiceTypeChange(serviceType);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 max-w-4xl w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Select Service Type</h3>
        {onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={16} />
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category !== 'All' && <ApperIcon name={getCategoryIcon(category)} size={14} />}
            {category}
          </Button>
        ))}
      </div>

      {/* Service Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => {
          const isSelected = selectedServiceType === service.name;
          
          return (
            <div
              key={service.name}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                isSelected 
                  ? "border-primary-500 bg-primary-50 shadow-sm" 
                  : "border-slate-200 hover:border-primary-300"
              )}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ApperIcon name={getCategoryIcon(service.category)} size={20} />
                  <h4 className="font-medium text-slate-900">{service.name}</h4>
                </div>
                {isSelected && (
                  <ApperIcon name="Check" size={16} className="text-primary-600" />
                )}
              </div>
              
              <p className="text-sm text-slate-600 mb-3">
                {service.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {service.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <ApperIcon name="Clock" size={14} />
                  <span>{service.estimatedHours}h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8">
          <ApperIcon name="Search" size={48} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No services found in this category.</p>
        </div>
      )}
    </div>
  );
}

export default ServiceTypeSelector;