import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import ReconditioningCalendar from '@/components/molecules/ReconditioningCalendar';
import TechnicianAssignmentModal from '@/components/molecules/TechnicianAssignmentModal';
import ServiceTypeSelector from '@/components/molecules/ServiceTypeSelector';
import { reconditioningService, technicianService } from '@/services/api/reconditioningService';
import { vehicleService } from '@/services/api/vehicleService';
import { format, addHours } from 'date-fns';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';

function Reconditioning() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View state
  const [view, setView] = useState('calendar'); // calendar, list, create
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Modal states
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  
  // Form state
  const [newAppointment, setNewAppointment] = useState({
    vehicleId: searchParams.get('vehicleId') || '',
    serviceType: '',
    startDate: '',
    estimatedHours: 4,
    priority: 'Medium',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, vehiclesData, techniciansData] = await Promise.all([
        reconditioningService.getAll(),
        vehicleService.getAll(),
        technicianService.getAll()
      ]);
      
      setAppointments(appointmentsData);
      setVehicles(vehiclesData);
      setTechnicians(techniciansData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateString = format(date, "yyyy-MM-dd'T'09:00:00.000'Z'");
    setNewAppointment(prev => ({
      ...prev,
      startDate: dateString
    }));
    setView('create');
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setView('details');
  };

  const handleServiceTypeSelect = (serviceType) => {
    const service = require('@/services/api/reconditioningService').serviceTypes.find(s => s.name === serviceType);
    setNewAppointment(prev => ({
      ...prev,
      serviceType: serviceType,
      estimatedHours: service?.estimatedHours || 4
    }));
    setShowServiceSelector(false);
    setShowTechnicianModal(true);
  };

  const handleTechnicianAssign = async (assignmentData) => {
    try {
      const startDate = new Date(newAppointment.startDate);
      const endDate = addHours(startDate, newAppointment.estimatedHours);
      
      const appointmentData = {
        ...newAppointment,
        technicianId: assignmentData.technicianId,
        endDate: endDate.toISOString(),
        status: 'Scheduled',
        checklist: generateChecklist(newAppointment.serviceType),
        notes: assignmentData.notes || newAppointment.notes
      };

      const created = await reconditioningService.create(appointmentData);
      setAppointments(prev => [...prev, created]);
      
      toast.success('Reconditioning appointment scheduled successfully!');
      setShowTechnicianModal(false);
      resetForm();
      setView('calendar');
    } catch (err) {
      toast.error('Failed to schedule appointment: ' + err.message);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const updated = await reconditioningService.update(appointmentId, { status: newStatus });
      setAppointments(prev => prev.map(apt => apt.Id === appointmentId ? updated : apt));
      setSelectedAppointment(updated);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const handleChecklistUpdate = async (appointmentId, itemIndex, completed) => {
    try {
      const updated = await reconditioningService.updateChecklistItem(appointmentId, itemIndex, completed);
      setAppointments(prev => prev.map(apt => apt.Id === appointmentId ? updated : apt));
      setSelectedAppointment(updated);
      toast.success(`Checklist item ${completed ? 'completed' : 'unchecked'}`);
    } catch (err) {
      toast.error('Failed to update checklist: ' + err.message);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      await reconditioningService.delete(appointmentId);
      setAppointments(prev => prev.filter(apt => apt.Id !== appointmentId));
      toast.success('Appointment deleted successfully');
      setView('calendar');
      setSelectedAppointment(null);
    } catch (err) {
      toast.error('Failed to delete appointment: ' + err.message);
    }
  };

  const generateChecklist = (serviceType) => {
    const checklists = {
      'Full Detail': [
        { item: 'Exterior wash', completed: false },
        { item: 'Interior vacuum', completed: false },
        { item: 'Dashboard cleaning', completed: false },
        { item: 'Window cleaning', completed: false },
        { item: 'Tire shine', completed: false },
        { item: 'Final inspection', completed: false }
      ],
      'Mechanical Inspection': [
        { item: 'Engine diagnostic', completed: false },
        { item: 'Brake inspection', completed: false },
        { item: 'Fluid levels check', completed: false },
        { item: 'Tire condition', completed: false },
        { item: 'Battery test', completed: false },
        { item: 'Final report', completed: false }
      ],
      'Body Work': [
        { item: 'Damage assessment', completed: false },
        { item: 'Sand affected area', completed: false },
        { item: 'Apply primer', completed: false },
        { item: 'Paint application', completed: false },
        { item: 'Clear coat finish', completed: false },
        { item: 'Quality inspection', completed: false }
      ]
    };
    
    return checklists[serviceType] || [
      { item: 'Initial assessment', completed: false },
      { item: 'Service completion', completed: false },
      { item: 'Quality check', completed: false },
      { item: 'Final inspection', completed: false }
    ];
  };

  const resetForm = () => {
    setNewAppointment({
      vehicleId: '',
      serviceType: '',
      startDate: '',
      estimatedHours: 4,
      priority: 'Medium',
      notes: ''
    });
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Scheduled': return 'primary';
      case 'In Progress': return 'warning';
      case 'Complete': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reconditioning</h1>
          <p className="text-slate-600">Schedule and manage vehicle reconditioning services</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
            <Button
              variant={view === 'calendar' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setView('calendar')}
              className="rounded-none border-0"
            >
              <ApperIcon name="Calendar" size={16} />
              Calendar
            </Button>
            <Button
              variant={view === 'list' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setView('list')}
              className="rounded-none border-0 border-l border-slate-300"
            >
              <ApperIcon name="List" size={16} />
              List
            </Button>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setShowServiceSelector(true)}
          >
            <ApperIcon name="Plus" size={16} />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <ReconditioningCalendar
          appointments={appointments}
          onDateClick={handleDateClick}
          onAppointmentClick={handleAppointmentClick}
          selectedDate={selectedDate}
        />
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">All Appointments</h2>
            <Input
              placeholder="Search appointments..."
              className="max-w-sm"
            />
          </div>
          
          {appointments.length === 0 ? (
            <Empty
              icon="Calendar"
              title="No appointments scheduled"
              description="Create your first reconditioning appointment to get started."
              action={
                <Button variant="primary" onClick={() => setShowServiceSelector(true)}>
                  <ApperIcon name="Plus" size={16} />
                  Schedule Appointment
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {appointments.map(appointment => {
                const vehicle = vehicles.find(v => v.Id === appointment.vehicleId);
                const technician = technicians.find(t => t.Id === appointment.technicianId);
                
                return (
                  <div
                    key={appointment.Id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-slate-900">
                            {appointment.serviceType}
                          </h3>
                          <Badge variant={getStatusVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <Badge variant={getPriorityVariant(appointment.priority)}>
                            {appointment.priority} Priority
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                          <div>
                            <span className="font-medium">Vehicle:</span>
                            <p>{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Technician:</span>
                            <p>{technician?.name || 'Unassigned'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Scheduled:</span>
                            <p>{format(new Date(appointment.startDate), 'MMM d, yyyy HH:mm')}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p>{appointment.estimatedHours}h estimated</p>
                          </div>
                        </div>
                      </div>
                      
                      <ApperIcon name="ChevronRight" size={16} className="text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Appointment Details View */}
      {view === 'details' && selectedAppointment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Info */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedAppointment.serviceType}
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setView('calendar')}
                >
                  <ApperIcon name="ArrowLeft" size={16} />
                  Back
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Vehicle Information</h3>
                  {(() => {
                    const vehicle = vehicles.find(v => v.Id === selectedAppointment.vehicleId);
                    return vehicle ? (
                      <div className="text-sm text-slate-600">
                        <p>{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        <p>VIN: {vehicle.vin}</p>
                        <p>Stock: {vehicle.stockNumber}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Vehicle information unavailable</p>
                    );
                  })()}
                </div>
                
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Schedule</h3>
                  <div className="text-sm text-slate-600">
                    <p>Start: {format(new Date(selectedAppointment.startDate), 'MMM d, yyyy HH:mm')}</p>
                    <p>End: {format(new Date(selectedAppointment.endDate), 'MMM d, yyyy HH:mm')}</p>
                    <p>Duration: {selectedAppointment.estimatedHours}h estimated</p>
                  </div>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Notes</h3>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </Card>

            {/* Checklist */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Checklist</h3>
              <div className="space-y-3">
                {selectedAppointment.checklist?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => handleChecklistUpdate(selectedAppointment.Id, index, e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                    />
                    <span className={cn(
                      "flex-1 text-sm",
                      item.completed ? "text-slate-500 line-through" : "text-slate-900"
                    )}>
                      {item.item}
                    </span>
                    {item.completed && (
                      <ApperIcon name="Check" size={16} className="text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Status & Actions</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Current Status</span>
                  <Badge variant={getStatusVariant(selectedAppointment.status)}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Priority</span>
                  <Badge variant={getPriorityVariant(selectedAppointment.priority)}>
                    {selectedAppointment.priority}
                  </Badge>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="space-y-2">
                    {selectedAppointment.status === 'Scheduled' && (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => handleStatusUpdate(selectedAppointment.Id, 'In Progress')}
                      >
                        <ApperIcon name="Play" size={16} />
                        Start Service
                      </Button>
                    )}
                    
                    {selectedAppointment.status === 'In Progress' && (
                      <Button
                        variant="success"
                        className="w-full"
                        onClick={() => handleStatusUpdate(selectedAppointment.Id, 'Complete')}
                      >
                        <ApperIcon name="CheckCircle" size={16} />
                        Mark Complete
                      </Button>
                    )}
                    
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleDeleteAppointment(selectedAppointment.Id)}
                    >
                      <ApperIcon name="Trash2" size={16} />
                      Delete Appointment
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Technician Info */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Assigned Technician</h3>
              {(() => {
                const technician = technicians.find(t => t.Id === selectedAppointment.technicianId);
                return technician ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <ApperIcon name="User" size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{technician.name}</p>
                        <p className="text-sm text-slate-600">{technician.email}</p>
                      </div>
                    </div>
                    
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
                    
                    <div className="flex flex-wrap gap-1">
                      {technician.specialties.map(specialty => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No technician assigned</p>
                );
              })()}
            </Card>
          </div>
        </div>
      )}

      {/* Service Type Selector Modal */}
      {showServiceSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ServiceTypeSelector
            selectedServiceType={newAppointment.serviceType}
            onServiceTypeChange={handleServiceTypeSelect}
            onClose={() => setShowServiceSelector(false)}
          />
        </div>
      )}

      {/* Technician Assignment Modal */}
      <TechnicianAssignmentModal
        isOpen={showTechnicianModal}
        onClose={() => setShowTechnicianModal(false)}
        onAssign={handleTechnicianAssign}
        serviceType={newAppointment.serviceType}
        startDate={newAppointment.startDate}
        endDate={addHours(new Date(newAppointment.startDate), newAppointment.estimatedHours).toISOString()}
      />
    </div>
  );
}

export default Reconditioning;