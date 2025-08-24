// app/components/forms/TimeSlots.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock, Plus, Trash2, RotateCcw } from 'lucide-react';
import { generateId } from '../../utils/dataStructure';

export default function TimeSlots({ data, onChange, universityData }) {
  const [timeSlots, setTimeSlots] = useState(data || []);
  const [scrollToId, setScrollToId] = useState(null);
  const slotRefs = useRef({});

  useEffect(() => {
    if (scrollToId && slotRefs.current[scrollToId]) {
      setTimeout(() => {
        slotRefs.current[scrollToId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        setScrollToId(null);
      }, 100);
    }
  }, [scrollToId, timeSlots]);

  const updateTimeSlots = (newSlots) => {
    setTimeSlots(newSlots);
    onChange(newSlots);
  };

  const addTimeSlot = () => {
    const lastSlot = timeSlots[timeSlots.length - 1];
    const newStartTime = lastSlot ? lastSlot.endTime : "08:00";
    
    const newSlot = {
      id: generateId('timeSlots'),
      startTime: newStartTime,
      endTime: addMinutes(newStartTime, universityData.basicInfo?.periodDuration || 60)
    };
    
    updateTimeSlots([newSlot, ...timeSlots]);
    setScrollToId(newSlot.id);
  };

  const removeTimeSlot = (id) => {
    updateTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const updateTimeSlot = (id, field, value) => {
    updateTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const generateDefaultSlots = () => {
    const { dailyPeriods = 8, periodDuration = 60, lunchBreakStart = "12:00", lunchBreakEnd = "13:00" } = universityData.basicInfo || {};
    const slots = [];
    let currentTime = "08:00";
    
    for (let i = 1; i <= dailyPeriods; i++) {
      // Skip lunch break period
      if (currentTime >= lunchBreakStart && currentTime < lunchBreakEnd) {
        currentTime = lunchBreakEnd;
      }
      
      const endTime = addMinutes(currentTime, periodDuration);
      slots.push({
        id: generateId('timeSlots'),
        startTime: currentTime,
        endTime: endTime
      });
      
      currentTime = endTime;
    }
    
    updateTimeSlots(slots);
  };

  // Helper function to add minutes to time string
  function addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  // Calculate duration between two times
  function calculateDuration(startTime, endTime) {
    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);
    
    const startTotal = startHours * 60 + startMins;
    const endTotal = endHours * 60 + endMins;
    
    return endTotal - startTotal;
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Time Slots Configuration</h3>
            <p className="text-gray-600">Define the daily time periods for classes</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={generateDefaultSlots}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] font-medium"
          >
            <RotateCcw size={16} />
            Auto Generate
          </button>
          <button
            onClick={addTimeSlot}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] font-medium"
          >
            <Plus size={18} />
            Add Slot
          </button>
        </div>
      </div>

      {/* Sticky Add Button */}
      {timeSlots.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={addTimeSlot}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 font-medium"
            title="Add New Time Slot"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Slot</span>
          </button>
        </div>
      )}

      {/* Time Slots List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Clock className="text-indigo-600" size={18} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Time Slots Configuration</h4>
            </div>
            <div className="bg-indigo-50 px-3 py-1 rounded-full">
              <span className="text-sm text-indigo-700 font-medium">
                {timeSlots.length} slots configured
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {timeSlots.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Clock size={48} className="text-blue-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">No Time Slots Configured</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Add time slots manually or use auto-generate to create default slots based on your schedule configuration</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={generateDefaultSlots} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  Generate Default Slots
                </button>
                <button 
                  onClick={addTimeSlot} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  Add Manual Slot
                </button>
              </div>
            </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced Header Row */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-10 gap-4 text-sm font-semibold text-gray-800">
                <div className="col-span-1 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">Slot #</span>
                </div>
                <div className="col-span-3 flex items-center">
                  <Clock size={14} className="text-green-600 mr-1" />
                  <span>Start Time</span>
                </div>
                <div className="col-span-3 flex items-center">
                  <Clock size={14} className="text-red-600 mr-1" />
                  <span>End Time</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Duration</span>
                </div>
                <div className="col-span-1">
                  <span>Actions</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Time Slot Rows */}
            <div className="space-y-3">
              {timeSlots.map((slot, index) => {
                const duration = calculateDuration(slot.startTime, slot.endTime);
                return (
                  <div 
                    key={slot.id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-indigo-300" 
                    ref={(el) => slotRefs.current[slot.id] = el}
                  >
                    <div className="grid grid-cols-10 gap-4 items-center">
                      <div className="col-span-1">
                        <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                  
                      <div className="col-span-3">
                        <div className="relative">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                            className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                          />
                          <div className="absolute -top-2 left-3 bg-white px-1 text-xs text-green-600 font-medium">
                            Start
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-3">
                        <div className="relative">
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50"
                          />
                          <div className="absolute -top-2 left-3 bg-white px-1 text-xs text-red-600 font-medium">
                            End
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className={`px-3 py-2 rounded-full text-center font-medium text-sm ${
                          duration > 0 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {duration > 0 ? `${duration} min` : 'Invalid'}
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <button
                          onClick={() => removeTimeSlot(slot.id)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                          title="Remove time slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Summary */}
      {timeSlots.length > 0 && (
        <div className="card bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Schedule Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total Periods:</span>
              <div className="text-lg font-bold text-blue-600">{timeSlots.length}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">First Period:</span>
              <div className="text-lg font-bold text-green-600">
                {timeSlots[0]?.startTime || 'N/A'}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Period:</span>
              <div className="text-lg font-bold text-purple-600">
                {timeSlots[timeSlots.length - 1]?.endTime || 'N/A'}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Duration:</span>
              <div className="text-lg font-bold text-orange-600">
                {timeSlots.length > 0 && timeSlots[0]?.startTime && timeSlots[timeSlots.length - 1]?.endTime
                  ? `${calculateDuration(timeSlots[0].startTime, timeSlots[timeSlots.length - 1].endTime)} min`
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card border-l-4 border-l-blue-500 bg-blue-50">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Time Slot Configuration</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure time slots dont overlap with lunch break periods</li>
          <li>• Consider 15-minute breaks between periods for student movement</li>
          <li>• Standard periods are usually 50-60 minutes long</li>
          <li>• Lab sessions typically require 2-3 consecutive periods</li>
          <li>• Morning periods usually have better attendance</li>
          <li>• Subjects will be automatically assigned to these time slots during timetable generation</li>
        </ul>
      </div>
    </div>
  );
}