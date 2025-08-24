// app/components/ResourceManager.js
'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Save, Eye, AlertCircle, CheckCircle, Trash, RotateCcw, Play, Settings, FileText, Info, Clock, Building, Users, BookOpen, MapPin, GraduationCap } from 'lucide-react';
import { defaultUniversityData, exportToJSON, importFromJSON, validateUniversityData, resetIdCounters, initializeIdCounters } from '../utils/dataStructure';

import BasicInfo from './forms/BasicInfo';
import Departments from './forms/Departments';
import Teachers from './forms/Teachers';
import Subjects from './forms/Subjects';
import Rooms from './forms/Rooms';
import Students from './forms/Students';
import TimeSlots from './forms/TimeSlots';
import FileUpload from './FileUpload';
import PDFExportModal from './PDFExportModal';
import PDFTestButton from './PDFTestButton';
import Tooltip from './Tooltip';

export default function ResourceManager() {
  const [universityData, setUniversityData] = useState(defaultUniversityData);
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearType, setClearType] = useState('all'); // 'all' or 'current'
  const [validationErrors, setValidationErrors] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [showAlgorithmSettings, setShowAlgorithmSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [algorithmSettings, setAlgorithmSettings] = useState({
    populationSize: 30,
    generations: 50,
    mutationRate: 0.15,
    crossoverRate: 0.8,
    eliteSize: 3
  });

  const tabs = [
    { 
      id: 'basicInfo', 
      name: 'Basic Info', 
      component: BasicInfo, 
      icon: Info, 
      color: 'blue',
      description: 'University settings',
      priority: 1 
    },
    { 
      id: 'timeSlots', 
      name: 'Time Slots', 
      component: TimeSlots, 
      icon: Clock, 
      color: 'indigo',
      description: 'Class periods',
      priority: 2 
    },
    { 
      id: 'departments', 
      name: 'Departments', 
      component: Departments, 
      icon: Building, 
      color: 'purple',
      description: 'Academic units',
      priority: 3 
    },
    { 
      id: 'teachers', 
      name: 'Teachers', 
      component: Teachers, 
      icon: Users, 
      color: 'green',
      description: 'Faculty members',
      priority: 4 
    },
    { 
      id: 'subjects', 
      name: 'Subjects', 
      component: Subjects, 
      icon: BookOpen, 
      color: 'orange',
      description: 'Courses offered',
      priority: 5 
    },
    { 
      id: 'rooms', 
      name: 'Rooms', 
      component: Rooms, 
      icon: MapPin, 
      color: 'teal',
      description: 'Physical spaces',
      priority: 6 
    },
    { 
      id: 'students', 
      name: 'Students', 
      component: Students, 
      icon: GraduationCap, 
      color: 'pink',
      description: 'Student groups',
      priority: 7 
    },
  ];

  // Function to get completion status for each tab
  const getTabCompletionStatus = (tabId) => {
    const data = universityData[tabId];
    switch (tabId) {
      case 'basicInfo':
        return data?.universityName && data?.academicYear && data?.semester ? 'complete' : 'incomplete';
      case 'timeSlots':
        return data?.length > 0 ? 'complete' : 'incomplete';
      case 'departments':
        return data?.length > 0 ? 'complete' : 'incomplete';
      case 'teachers':
        return data?.length > 0 ? 'complete' : 'incomplete';
      case 'subjects':
        return data?.length > 0 ? 'complete' : 'incomplete';
      case 'rooms':
        return data?.length > 0 ? 'complete' : 'incomplete';
      case 'students':
        return data?.length > 0 ? 'complete' : 'incomplete';
      default:
        return 'incomplete';
    }
  };

  // Color mapping for tabs
  const getTabColors = (color, isActive) => {
    const colorMap = {
      blue: {
        border: isActive ? 'border-blue-500' : 'border-transparent',
        bg: isActive ? 'bg-blue-50' : '',
        iconBg: isActive ? 'bg-blue-100' : 'bg-gray-100',
        iconText: isActive ? 'text-blue-600' : 'text-gray-500',
        badgeBg: isActive ? 'bg-blue-100' : 'bg-gray-100',
        badgeText: isActive ? 'text-blue-700' : 'text-gray-600',
        nameText: isActive ? 'text-blue-700' : 'text-gray-700',
        descText: isActive ? 'text-blue-600' : 'text-gray-500',
        indicator: 'bg-blue-500'
      },
      indigo: {
        border: isActive ? 'border-indigo-500' : 'border-transparent',
        bg: isActive ? 'bg-indigo-50' : '',
        iconBg: isActive ? 'bg-indigo-100' : 'bg-gray-100',
        iconText: isActive ? 'text-indigo-600' : 'text-gray-500',
        badgeBg: isActive ? 'bg-indigo-100' : 'bg-gray-100',
        badgeText: isActive ? 'text-indigo-700' : 'text-gray-600',
        nameText: isActive ? 'text-indigo-700' : 'text-gray-700',
        descText: isActive ? 'text-indigo-600' : 'text-gray-500',
        indicator: 'bg-indigo-500'
      },
      purple: {
        border: isActive ? 'border-purple-500' : 'border-transparent',
        bg: isActive ? 'bg-purple-50' : '',
        iconBg: isActive ? 'bg-purple-100' : 'bg-gray-100',
        iconText: isActive ? 'text-purple-600' : 'text-gray-500',
        badgeBg: isActive ? 'bg-purple-100' : 'bg-gray-100',
        badgeText: isActive ? 'text-purple-700' : 'text-gray-600',
        nameText: isActive ? 'text-purple-700' : 'text-gray-700',
        descText: isActive ? 'text-purple-600' : 'text-gray-500',
        indicator: 'bg-purple-500'
      },
      green: {
        border: isActive ? 'border-green-500' : 'border-transparent',
        bg: isActive ? 'bg-green-50' : '',
        iconBg: isActive ? 'bg-green-100' : 'bg-gray-100',
        iconText: isActive ? 'text-green-600' : 'text-gray-500',
        badgeBg: isActive ? 'bg-green-100' : 'bg-gray-100',
        badgeText: isActive ? 'text-green-700' : 'text-gray-600',
        nameText: isActive ? 'text-green-700' : 'text-gray-700',
        descText: isActive ? 'text-green-600' : 'text-gray-500',
        indicator: 'bg-green-500'
      },
      orange: {
        border: isActive ? 'border-orange-500' : 'border-transparent',
        bg: isActive ? 'bg-orange-50' : '',
        iconBg: isActive ? 'bg-orange-100' : 'bg-gray-100',
        iconText: isActive ? 'text-orange-600' : 'text-gray-500',
        badgeBg: isActive ? 'bg-orange-100' : 'bg-gray-100',
        badgeText: isActive ? 'text-orange-700' : 'text-gray-600',
        nameText: isActive ? 'text-orange-700' : 'text-gray-700',
        descText: isActive ? 'text-orange-600' : 'text-gray-500',
        indicator: 'bg-orange-500'
      },
      teal: {
        border: isActive ? 'border-teal-500' : 'border-transparent',
        bg: isActive ? 'bg-teal-50' : '',
        iconBg: isActive ? 'bg-teal-100' : 'bg-gray-100',
        iconText: isActive ? 'text-teal-600' : 'text-gray-500',
        badgeBg: isActive ? 'bg-teal-100' : 'bg-gray-100',
        badgeText: isActive ? 'text-teal-700' : 'text-gray-600',
        nameText: isActive ? 'text-teal-700' : 'text-gray-700',
        descText: isActive ? 'text-teal-600' : 'text-gray-500',
        indicator: 'bg-teal-500'
      },
      pink: {
        border: isActive ? 'border-pink-500' : 'border-transparent',
        bg: isActive ? 'bg-pink-50' : '',
        iconBg: isActive ? 'bg-pink-100' : 'bg-gray-100',
        iconText: isActive ? 'text-pink-600' : 'text-gray-500',
        badgeBg: isActive ? 'bg-pink-100' : 'bg-gray-100',
        badgeText: isActive ? 'text-pink-700' : 'text-gray-600',
        nameText: isActive ? 'text-pink-700' : 'text-gray-700',
        descText: isActive ? 'text-pink-600' : 'text-gray-500',
        indicator: 'bg-pink-500'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

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
        const data = JSON.parse(saved);
        setUniversityData(data);
        initializeIdCounters(data);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showAlgorithmSettings) {
          setShowAlgorithmSettings(false);
        } else if (showFileUpload) {
          setShowFileUpload(false);
        } else if (showClearConfirm) {
          setShowClearConfirm(false);
        } else if (generationResult) {
          setGenerationResult(null);
        } else if (showPDFExport) {
          setShowPDFExport(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showAlgorithmSettings, showFileUpload, showClearConfirm, generationResult, showPDFExport]);

  const handleDataChange = (section, newData) => {
    setUniversityData(prev => {
      const now = new Date();
      const isoString = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0') + 'T' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0') + '.000Z';
      
      return {
        ...prev,
        [section]: newData,
        metadata: {
          ...prev.metadata,
          lastModified: isoString,
          createdAt: prev.metadata.createdAt || isoString
        }
      };
    });
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

  const handleClear = (type) => {
    setClearType(type);
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    if (clearType === 'all') {
      // Clear everything
      setUniversityData(defaultUniversityData);
      resetIdCounters();
      localStorage.removeItem('universityData');
      setSaveStatus('All data cleared');
    } else {
      // Clear current tab only
      const defaultSection = defaultUniversityData[activeTab];
      handleDataChange(activeTab, defaultSection);
      setSaveStatus(`${tabs.find(t => t.id === activeTab)?.name} cleared`);
    }
    
    setShowClearConfirm(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleGenerateTimetable = async () => {
    setIsGenerating(true);
    setGenerationResult(null);
    
    try {
      // Add algorithm settings to the data
      const dataWithAlgorithmSettings = {
        ...universityData,
        algorithmSettings
      };

      const response = await fetch('http://localhost:8000/api/generate-timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          universityData: universityData,
          algorithmSettings: algorithmSettings
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Backend Response:', result);
      
      if (result.success) {
        console.log('Backend Response Keys:', Object.keys(result));
        if (result.schedule) console.log('Schedule Length:', result.schedule.length);
        if (result.timetable) console.log('Timetable Length:', result.timetable.length);
        
        setGenerationResult(result);
        setSaveStatus('✓ Timetable generated successfully!');
      } else {
        // Handle detailed error response from backend
        console.error('Backend returned error:', result);
        const errorMessage = result.message || result.error || 'Unknown error occurred';
        setSaveStatus(`⚠ ${errorMessage}`);
        setGenerationResult({
          ...result,
          success: false
        });
      }
      
    } catch (error) {
      console.error('Error generating timetable:', error);
      setSaveStatus('⚠ Failed to generate timetable: ' + error.message);
      setGenerationResult({ 
        success: false, 
        error: error.message,
        message: 'Network or server error occurred'
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Main Actions Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Resource Management</h2>
            {saveStatus && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm">
                {saveStatus.includes('✓') ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : saveStatus.includes('⚠') ? (
                  <AlertCircle size={16} className="text-orange-600" />
                ) : (
                  <Save size={16} className="text-gray-600" />
                )}
                <span className={`text-sm font-medium ${
                  saveStatus.includes('✓') ? 'text-green-600' :
                  saveStatus.includes('⚠') ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {saveStatus}
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* File Operations */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">File Operations</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowFileUpload(true)}
                  className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] font-medium shadow-lg"
                >
                  <Upload size={18} />
                  <span>Upload Config</span>
                </button>
                
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] font-medium shadow-lg"
                >
                  <Download size={18} />
                  <span>Download Config</span>
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Data Management</h3>
              <div className="space-y-2">
                <button
                  onClick={handleValidate}
                  className="w-full flex items-center gap-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] font-medium shadow-lg"
                >
                  <Eye size={18} />
                  <span>Validate Data</span>
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleClear('current')}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-3 py-3 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] font-medium shadow-lg"
                  >
                    <RotateCcw size={16} />
                    <span className="text-sm">Clear Tab</span>
                  </button>

                  <button
                    onClick={() => handleClear('all')}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-3 py-3 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] font-medium shadow-lg"
                  >
                    <Trash size={16} />
                    <span className="text-sm">Clear All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generation Controls */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Timetable Generation</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAlgorithmSettings(true)}
                  className="w-full flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] font-medium shadow-lg"
                >
                  <Settings size={18} />
                  <span>Algorithm Settings</span>
                </button>

                <button
                  onClick={handleGenerateTimetable}
                  disabled={isGenerating}
                  className="w-full flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed font-semibold shadow-lg"
                >
                  <Play size={18} />
                  <span>{isGenerating ? 'Generating...' : 'Generate Timetable'}</span>
                  {isGenerating && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-auto"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Export Options</h3>
              <p className="text-xs text-gray-500 mt-1">Export generated timetable in various formats</p>
            </div>
            <button
              onClick={() => setShowPDFExport(true)}
              disabled={!generationResult || !generationResult.success}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed font-medium shadow-lg"
              title={!generationResult ? 'Generate a timetable first' : 'Export timetable to PDF'}
            >
              <FileText size={16} />
              <span>Export PDF</span>
            </button>
          </div>
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

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 border-b border-purple-200">
          <h3 className="text-lg font-semibold text-white">Resource Configuration</h3>
          <p className="text-sm text-purple-100 mt-1">Configure all university resources step by step</p>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const completionStatus = getTabCompletionStatus(tab.id);
              const isComplete = completionStatus === 'complete';
              const colors = getTabColors(tab.color, isActive);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 min-w-0 px-4 py-6 text-center border-b-3 transition-all duration-200 group ${
                    colors.border
                  } ${
                    colors.bg
                  } ${
                    !isActive ? 'hover:bg-gray-50 hover:border-gray-300' : ''
                  }`}
                >
                  {/* Priority Badge */}
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    colors.badgeBg
                  } ${
                    colors.badgeText
                  }`}>
                    {tab.priority}
                  </div>
                  
                  {/* Completion Status */}
                  <div className="absolute top-2 right-2">
                    {isComplete ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Icon */}
                  <div className={`mx-auto mb-2 p-2 rounded-lg transition-colors ${
                    colors.iconBg
                  } ${
                    colors.iconText
                  } ${
                    !isActive ? 'group-hover:bg-gray-200' : ''
                  }`}>
                    <Icon size={20} />
                  </div>
                  
                  {/* Tab Name */}
                  <div className={`font-medium text-sm transition-colors ${
                    colors.nameText
                  } ${
                    !isActive ? 'group-hover:text-gray-900' : ''
                  }`}>
                    {tab.name}
                  </div>
                  
                  {/* Description */}
                  <div className={`text-xs mt-1 transition-colors ${
                    colors.descText
                  } ${
                    !isActive ? 'group-hover:text-gray-700' : ''
                  }`}>
                    {tab.description}
                  </div>
                  
                  {/* Data Count */}
                  {tab.id !== 'basicInfo' && (
                    <div className={`text-xs mt-1 font-semibold transition-colors ${
                      colors.nameText
                    }`}>
                      {universityData[tab.id]?.length || 0} items
                    </div>
                  )}
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 ${colors.indicator} rounded-t-full`}></div>
                  )}
                </button>
              );
            })}
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

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Clear</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to clear {clearType === 'all' ? 'all data' : `${tabs.find(t => t.id === activeTab)?.name} data`}? 
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear {clearType === 'all' ? 'All' : 'Current'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Settings Modal */}
      {showAlgorithmSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Tooltip
                  title="How Algorithm Settings Work"
                  content="These settings control the genetic algorithm that generates your timetable. Hover over the info icons below for detailed explanations. For quick results, use lower values. For better quality solutions, increase population size and generations."
                  placement="bottom"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Algorithm Settings</h3>
                </Tooltip>
                <button
                  onClick={() => setShowAlgorithmSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Tooltip
                    title="Population Size"
                    content="Controls how many different timetable solutions are generated and tested in each iteration. Higher values (50-100) provide more diverse solutions and better quality results, but take longer to compute. Lower values (20-40) run faster but may miss optimal solutions. Recommended: 30-50 for most cases."
                    placement="right"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Population Size ({algorithmSettings.populationSize})
                    </label>
                  </Tooltip>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={algorithmSettings.populationSize}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, populationSize: parseInt(e.target.value)}))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20 (Fast)</span>
                    <span>100 (Thorough)</span>
                  </div>
                </div>

                <div>
                  <Tooltip
                    title="Generations (Iterations)"
                    content="Number of evolution cycles the algorithm runs. More generations (100-200) allow the algorithm to find better solutions by refining them over time, but increase computation time. Fewer generations (25-50) finish faster but may not find the optimal solution. The algorithm may stop early if it finds a perfect solution."
                    placement="right"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Generations ({algorithmSettings.generations})
                    </label>
                  </Tooltip>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    value={algorithmSettings.generations}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, generations: parseInt(e.target.value)}))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>25 (Quick)</span>
                    <span>200 (Exhaustive)</span>
                  </div>
                </div>

                <div>
                  <Tooltip
                    title="Mutation Rate"
                    content="Percentage of random changes applied to solutions to explore new possibilities. Higher rates (20-30%) help escape local optima and find diverse solutions but can disrupt good patterns. Lower rates (5-10%) preserve good solutions but may get stuck. Recommended: 10-20% for balanced exploration."
                    placement="right"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mutation Rate ({(algorithmSettings.mutationRate * 100).toFixed(0)}%)
                    </label>
                  </Tooltip>
                  <input
                    type="range"
                    min="0.05"
                    max="0.30"
                    step="0.01"
                    value={algorithmSettings.mutationRate}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, mutationRate: parseFloat(e.target.value)}))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5% (Conservative)</span>
                    <span>30% (Exploratory)</span>
                  </div>
                </div>

                <div>
                  <Tooltip
                    title="Crossover Rate"
                    content="Probability of combining two good solutions to create new ones. Higher rates (80-95%) favor combining successful patterns, leading to faster convergence but potentially missing novel solutions. Lower rates (60-75%) rely more on individual mutations. Recommended: 70-85% for most scenarios."
                    placement="right"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crossover Rate ({(algorithmSettings.crossoverRate * 100).toFixed(0)}%)
                    </label>
                  </Tooltip>
                  <input
                    type="range"
                    min="0.60"
                    max="0.95"
                    step="0.01"
                    value={algorithmSettings.crossoverRate}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, crossoverRate: parseFloat(e.target.value)}))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>60% (Independent)</span>
                    <span>95% (Collaborative)</span>
                  </div>
                </div>

                <div>
                  <Tooltip
                    title="Elite Size"
                    content="Number of best solutions automatically preserved to the next generation. Higher values (5-10) ensure good solutions are never lost but may slow down evolution. Lower values (1-3) allow faster change but risk losing good patterns. Recommended: 2-5 based on population size."
                    placement="right"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elite Size ({algorithmSettings.eliteSize})
                    </label>
                  </Tooltip>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={algorithmSettings.eliteSize}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, eliteSize: parseInt(e.target.value)}))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (Minimal)</span>
                    <span>10 (Maximum)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAlgorithmSettings(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setAlgorithmSettings({
                      populationSize: 30,
                      generations: 50,
                      mutationRate: 0.15,
                      crossoverRate: 0.8,
                      eliteSize: 3
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Results Modal */}
      {generationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Timetable Generation Results</h3>
                <button
                  onClick={() => setGenerationResult(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {generationResult.success ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="font-medium text-green-800">Timetable Generated Successfully!</span>
                    </div>
                    <p className="text-green-700 mt-1">{generationResult.message}</p>
                    <p className="text-sm text-green-600 mt-1">Execution Time: {generationResult.executionTime}</p>
                  </div>

                  {generationResult.algorithmStats && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Algorithm Statistics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600">Generations Run:</span>
                          <span className="ml-2 font-medium">{generationResult.algorithmStats.generationsRun}</span>
                        </div>
                        <div>
                          <span className="text-blue-600">Final Fitness:</span>
                          <span className="ml-2 font-medium">{generationResult.algorithmStats.finalFitness}</span>
                        </div>
                        <div>
                          <span className="text-blue-600">Population Size:</span>
                          <span className="ml-2 font-medium">{generationResult.algorithmStats.populationSize}</span>
                        </div>
                        <div>
                          <span className="text-blue-600">Total Activities:</span>
                          <span className="ml-2 font-medium">{generationResult.algorithmStats.totalActivities}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(generationResult, null, 2);
                        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                        const now = new Date();
                        const dateString = now.getFullYear() + '-' + 
                          String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(now.getDate()).padStart(2, '0');
                        const exportFileDefaultName = `timetable-complete-${dateString}.json`;
                        const linkElement = document.createElement('a');
                        linkElement.setAttribute('href', dataUri);
                        linkElement.setAttribute('download', exportFileDefaultName);
                        linkElement.click();
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Download size={16} className="inline mr-2" />
                      Download JSON
                    </button>
                    <button
                      onClick={() => setShowPDFExport(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <FileText size={16} className="inline mr-2" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => setGenerationResult(null)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-red-600" size={20} />
                      <span className="font-medium text-red-800">Generation Failed</span>
                    </div>
                    <p className="text-red-700 mt-2 font-medium">
                      {generationResult.message || generationResult.error || 'Unknown error occurred'}
                    </p>
                    
                    {/* Display detailed error information if available */}
                    {generationResult.details && (
                      <div className="mt-4 space-y-3">
                        {/* Error Type */}
                        {generationResult.details.errorType && (
                          <div className="bg-red-100 border border-red-300 rounded p-3">
                            <p className="text-sm font-medium text-red-800">
                              Error Type: <span className="font-mono">{generationResult.details.errorType}</span>
                            </p>
                          </div>
                        )}
                        
                        {/* Critical Issues */}
                        {generationResult.details.criticalIssues && generationResult.details.criticalIssues.length > 0 && (
                          <div className="bg-red-100 border border-red-300 rounded p-3">
                            <h4 className="font-medium text-red-800 mb-2">Critical Issues:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                              {generationResult.details.criticalIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Validation Errors */}
                        {generationResult.details.errors && generationResult.details.errors.length > 0 && (
                          <div className="bg-red-100 border border-red-300 rounded p-3">
                            <h4 className="font-medium text-red-800 mb-2">Validation Errors:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                              {generationResult.details.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Suggestions */}
                        {((generationResult.details.suggestions && generationResult.details.suggestions.length > 0) || 
                          (generationResult.details.recommendations && generationResult.details.recommendations.length > 0)) && (
                          <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                            <h4 className="font-medium text-yellow-800 mb-2">💡 Suggestions to Fix:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                              {(generationResult.details.suggestions || generationResult.details.recommendations || []).map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Statistics if available */}
                        {generationResult.details.stats && (
                          <div className="bg-blue-50 border border-blue-300 rounded p-3">
                            <h4 className="font-medium text-blue-800 mb-2">Current Statistics:</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              {generationResult.details.stats.totalRequiredHours !== undefined && (
                                <p>Required Hours: {generationResult.details.stats.totalRequiredHours}h/week</p>
                              )}
                              {generationResult.details.stats.totalAvailableHours !== undefined && (
                                <p>Available Hours: {generationResult.details.stats.totalAvailableHours}h/week</p>
                              )}
                              {generationResult.details.stats.totalTimeSlots !== undefined && (
                                <p>Time Slots: {generationResult.details.stats.totalTimeSlots} total</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setGenerationResult(null)}
                      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      <PDFExportModal
        isOpen={showPDFExport}
        onClose={() => setShowPDFExport(false)}
        timetableData={generationResult}
        universityData={universityData}
      />

      {/* PDF Test Button - Hidden */}
      {false && <PDFTestButton />}
    </div>
  );
}