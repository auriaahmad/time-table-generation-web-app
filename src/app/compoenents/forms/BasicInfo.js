// app/components/forms/BasicInfo.js
'use client';

import { useState } from 'react';
import { Info, Clock, Calendar } from 'lucide-react';

export default function BasicInfo({ data, onChange }) {
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleWorkingDaysChange = (day, checked) => {
    const newDays = checked 
      ? [...formData.workingDays, day]
      : formData.workingDays.filter(d => d !== day);
    handleChange('workingDays', newDays);
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Info className="text-blue-600" size={24} />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">University Basic Information</h3>
          <p className="text-gray-600">Configure fundamental university settings and academic calendar</p>
        </div>
      </div>

      {/* University Details */}
      <div className="card">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Institution Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University Name *
            </label>
            <input
              type="text"
              value={formData.universityName}
              onChange={(e) => handleChange('universityName', e.target.value)}
              className="input-field"
              placeholder="Enter university name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year *
            </label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => handleChange('academicYear', e.target.value)}
              className="input-field"
              placeholder="e.g., 2024-2025"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Semester *
            </label>
            <select
              value={formData.semester}
              onChange={(e) => handleChange('semester', e.target.value)}
              className="input-field"
            >
              <option value="">Select Semester</option>
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Academic Weeks
            </label>
            <input
              type="number"
              value={formData.totalWeeks}
              onChange={(e) => handleChange('totalWeeks', parseInt(e.target.value))}
              className="input-field"
              min="1"
              max="52"
            />
          </div>
        </div>
      </div>

      {/* Schedule Configuration */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-green-600" size={20} />
          <h4 className="text-lg font-medium text-gray-900">Schedule Configuration</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Periods
            </label>
            <input
              type="number"
              value={formData.dailyPeriods}
              onChange={(e) => handleChange('dailyPeriods', parseInt(e.target.value))}
              className="input-field"
              min="1"
              max="12"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.periodDuration}
              onChange={(e) => handleChange('periodDuration', parseInt(e.target.value))}
              className="input-field"
              min="30"
              max="180"
              step="15"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.breakDuration}
              onChange={(e) => handleChange('breakDuration', parseInt(e.target.value))}
              className="input-field"
              min="5"
              max="60"
              step="5"
            />
          </div>
        </div>

        {/* Lunch Break */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lunch Break Start
            </label>
            <input
              type="time"
              value={formData.lunchBreakStart}
              onChange={(e) => handleChange('lunchBreakStart', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lunch Break End
            </label>
            <input
              type="time"
              value={formData.lunchBreakEnd}
              onChange={(e) => handleChange('lunchBreakEnd', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Working Days */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-purple-600" size={20} />
          <h4 className="text-lg font-medium text-gray-900">Working Days</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {allDays.map((day) => (
            <label key={day} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.workingDays.includes(day)}
                onChange={(e) => handleWorkingDaysChange(day, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{day}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {formData.workingDays.join(', ')} 
            ({formData.workingDays.length} days per week)
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="card bg-gray-50">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Configuration Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Total Periods/Week:</span>
            <div className="text-lg font-bold text-blue-600">
              {formData.workingDays.length * formData.dailyPeriods}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Hours/Week:</span>
            <div className="text-lg font-bold text-green-600">
              {((formData.workingDays.length * formData.dailyPeriods * formData.periodDuration) / 60).toFixed(1)}h
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Daily Hours:</span>
            <div className="text-lg font-bold text-purple-600">
              {((formData.dailyPeriods * formData.periodDuration) / 60).toFixed(1)}h
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Working Days:</span>
            <div className="text-lg font-bold text-orange-600">
              {formData.workingDays.length}/week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}