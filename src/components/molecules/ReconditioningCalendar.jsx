import React, { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/utils/cn';

function ReconditioningCalendar({ appointments, onDateClick, onAppointmentClick, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.startDate), date)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-500';
      case 'In Progress': return 'bg-amber-500';
      case 'Complete': return 'bg-green-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-sm text-slate-600">
            {appointments.length} appointments this month
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToday}
          >
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevMonth}
          >
            <ApperIcon name="ChevronLeft" size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleNextMonth}
          >
            <ApperIcon name="ChevronRight" size={16} />
          </Button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(date => {
          const dayAppointments = getAppointmentsForDate(date);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "min-h-[100px] p-2 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors",
                !isCurrentMonth && "bg-slate-50 text-slate-400",
                isSelected && "bg-primary-50 border-primary-300",
                isToday && "bg-blue-50 border-blue-300"
              )}
              onClick={() => onDateClick(date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isToday && "text-blue-600 font-semibold"
                )}>
                  {format(date, 'd')}
                </span>
                {dayAppointments.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {dayAppointments.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(apt => (
                  <div
                    key={apt.Id}
                    className={cn(
                      "text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80",
                      getStatusColor(apt.status)
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                  >
                    {format(new Date(apt.startDate), 'HH:mm')} - {apt.serviceType}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-slate-600 font-medium">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Complete</span>
        </div>
      </div>
    </Card>
  );
}

export default ReconditioningCalendar;