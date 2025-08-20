import React, { useState, useEffect } from 'react'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import { cn } from '@/utils/cn'
import { technicianService } from '@/services/api/reconditioningService'
import { format, isValid, parseISO } from 'date-fns'

// Helper function to safely format dates
const safeFormatDate = (dateValue, formatStr = 'MMM d, h:mm a') => {
  try {
    if (!dateValue) return 'Not specified';
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
    if (!isValid(date)) return 'Invalid date';
    return format(date, formatStr);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid date';
  }
};
function TechnicianAssignmentModal({ 
  isOpen, 
  onClose, 
  onAssign, 
  serviceType, 
  startDate, 
  endDate,
  currentTechnicianId 
}) {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(currentTechnicianId || null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTechnicians();
    }
  }, [isOpen, startDate, endDate]);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const availableTechnicians = await technicianService.getAvailable(startDate, endDate);
      setTechnicians(availableTechnicians);
    } catch (error) {
      console.error('Failed to load technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (!selectedTechnicianId) return;
    
    const selectedTechnician = technicians.find(t => t.Id === selectedTechnicianId);
    onAssign({
      technicianId: selectedTechnicianId,
      technician: selectedTechnician,
      notes
    });
  };

  const getSpecialtyMatch = (technicianSpecialties, serviceType) => {
    const serviceCategory = getServiceCategory(serviceType);
    return technicianSpecialties.some(specialty => 
      specialty.toLowerCase().includes(serviceCategory.toLowerCase()) ||
      serviceCategory.toLowerCase().includes(specialty.toLowerCase())
    );
  };

  const getServiceCategory = (serviceType) => {
    if (serviceType.toLowerCase().includes('detail')) return 'Detailing';
    if (serviceType.toLowerCase().includes('mechanical') || serviceType.toLowerCase().includes('engine')) return 'Mechanical';
    if (serviceType.toLowerCase().includes('body') || serviceType.toLowerCase().includes('paint')) return 'Body Work';
    return 'General';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Assign Technician</h2>
            <p className="text-sm text-slate-600">
              Service: {serviceType} • {format(new Date(startDate), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            <ApperIcon name="X" size={16} />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-slate-600">Loading technicians...</span>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Available Technicians</h3>
                <div className="space-y-3">
                  {technicians.map(technician => {
                    const isSelected = selectedTechnicianId === technician.Id;
                    const hasMatchingSpecialty = getSpecialtyMatch(technician.specialties, serviceType);

                    return (
                      <div
                        key={technician.Id}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all hover:border-primary-300",
                          isSelected 
                            ? "border-primary-500 bg-primary-50" 
                            : "border-slate-200 hover:bg-slate-50"
                        )}
                        onClick={() => setSelectedTechnicianId(technician.Id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-slate-900">{technician.name}</h4>
                              {hasMatchingSpecialty && (
                                <Badge variant="success" className="text-xs">
                                  Specialty Match
                                </Badge>
                              )}
                              <Badge 
                                variant={technician.status === 'Available' ? 'success' : 'warning'}
                                className="text-xs"
                              >
                                {technician.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-2">{technician.email}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <ApperIcon name="Star" size={14} />
                                <span>{technician.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ApperIcon name="CheckCircle" size={14} />
                                <span>{technician.completedJobs} jobs</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {technician.specialties.map(specialty => (
                                <Badge 
                                  key={specialty} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 transition-colors",
                              isSelected 
                                ? "bg-primary-500 border-primary-500" 
                                : "border-slate-300"
                            )}>
                              {isSelected && (
                                <ApperIcon name="Check" size={12} className="text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assignment Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Add any special instructions or notes for the technician..."
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssign}
            disabled={!selectedTechnicianId || loading}
          >
            <ApperIcon name="UserCheck" size={16} />
            Assign Technician
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TechnicianAssignmentModal;