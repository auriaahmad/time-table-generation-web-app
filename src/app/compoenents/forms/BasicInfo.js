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
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Info className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">University Basic Information</h3>
            <p className="text-gray-600 mt-1">Configure fundamental university settings and academic calendar</p>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 bg-white bg-opacity-70 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">Foundation Setup</span>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-70 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">Required First</span>
          </div>
        </div>
      </div>

      {/* University Details */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Info className="text-blue-600" size={18} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Institution Details</h4>
          </div>
        </div>
        <div className="p-6">
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
      </div>

      {/* Schedule Configuration */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Clock className="text-green-600" size={18} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Schedule Configuration</h4>
          </div>
        </div>
        <div className="p-6">
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
      </div>

      {/* Working Days */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="text-purple-600" size={18} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Working Days</h4>
            <div className="ml-auto bg-purple-50 px-3 py-1 rounded-full">
              <span className="text-sm text-purple-700 font-medium">
                {formData.workingDays?.length || 0} days selected
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {allDays.map((day) => (
            <label 
              key={day} 
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                formData.workingDays.includes(day)
                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.workingDays.includes(day)}
                onChange={(e) => handleWorkingDaysChange(day, e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium">{day.substring(0, 3)}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-purple-900">Selected Working Days</span>
          </div>
          <p className="text-sm text-purple-800">
            <strong>{formData.workingDays.join(', ')}</strong> 
            <span className="ml-2 text-purple-600">({formData.workingDays.length} days per week)</span>
          </p>
        </div>
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