// app/components/ResourceManager.js
'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Save, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { defaultUniversityData, exportToJSON, importFromJSON, validateUniversityData } from '../utils/dataStructure';

import BasicInfo from './forms/BasicInfo';
import Departments from './forms/Departments';
import Teachers from './forms/Teachers';
import Subjects from './forms/Subjects';
import Rooms from './forms/Rooms';
import Students from './forms/Students';
import TimeSlots from './forms/TimeSlots';
import FileUpload from './FileUpload';

export default function ResourceManager() {
  const [universityData, setUniversityData] = useState(defaultUniversityData);
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  const tabs = [
    { id: 'basicInfo', name: 'Basic Info', component: BasicInfo },
    { id: 'timeSlots', name: 'Time Slots', component: TimeSlots },
    { id: 'departments', name: 'Departments', component: Departments },
    { id: 'teachers', name: 'Teachers', component: Teachers },
    { id: 'subjects', name: 'Subjects', component: Subjects },
    { id: 'rooms', name: 'Rooms', component: Rooms },
    { id: 'students', name: 'Students', component: Students },
  ];

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('universityData', JSON.stringify(universityData));
      setSaveStatus('Auto-saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [universityData]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('universityData');
    if (saved) {
      try {
        setUniversityData(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const handleDataChange = (section, newData) => {
    setUniversityData(prev => ({
      ...prev,
      [section]: newData,
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
  };

  const handleFileUpload = async (file) => {
    try {
      const data = await importFromJSON(file);
      setUniversityData(data);
      setShowFileUpload(false);
      setSaveStatus('File uploaded successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      alert('Error importing file: ' + error.message);
    }
  };

  const handleExport = () => {
    exportToJSON(universityData);
  };

  const handleValidate = () => {
    const errors = validateUniversityData(universityData);
    setValidationErrors(errors);
    if (errors.length === 0) {
      setSaveStatus('✓ All data validated successfully!');
    } else {
      setSaveStatus('⚠ Validation errors found');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFileUpload(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Upload size={16} />
              Upload Config
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              Download Config
            </button>
            
            <button
              onClick={handleValidate}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Eye size={16} />
              Validate Data
            </button>
          </div>
          
          {saveStatus && (
            <div className="flex items-center gap-2 text-sm">
              {saveStatus.includes('✓') ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : saveStatus.includes('⚠') ? (
                <AlertCircle size={16} className="text-orange-600" />
              ) : (
                <Save size={16} className="text-gray-600" />
              )}
              <span className={
                saveStatus.includes('✓') ? 'text-green-600' :
                saveStatus.includes('⚠') ? 'text-orange-600' : 'text-gray-600'
              }>
                {saveStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} className="text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Validation Errors</h3>
          </div>
          <ul className="list-disc list-inside space-y-1 text-red-700">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configuration Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{universityData.teachers?.length || 0}</div>
            <div className="text-sm text-gray-600">Teachers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{universityData.subjects?.length || 0}</div>
            <div className="text-sm text-gray-600">Subjects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{universityData.rooms?.length || 0}</div>
            <div className="text-sm text-gray-600">Rooms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{universityData.students?.length || 0}</div>
            <div className="text-sm text-gray-600">Student Groups</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {ActiveComponent && (
            <ActiveComponent
              data={universityData[activeTab]}
              onChange={(newData) => handleDataChange(activeTab, newData)}
              universityData={universityData}
            />
          )}
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onFileUpload={handleFileUpload}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
}