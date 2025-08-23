// app/components/ResourceManager.js
'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Save, Eye, AlertCircle, CheckCircle, Trash, RotateCcw, Play, Settings, FileText } from 'lucide-react';
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
        const data = JSON.parse(saved);
        setUniversityData(data);
        initializeIdCounters(data);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

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
      console.log('Backend Response Keys:', Object.keys(result));
      if (result.schedule) console.log('Schedule Length:', result.schedule.length);
      if (result.timetable) console.log('Timetable Length:', result.timetable.length);
      
      setGenerationResult(result);
      setSaveStatus('✓ Timetable generated successfully!');
      
    } catch (error) {
      console.error('Error generating timetable:', error);
      setSaveStatus('⚠ Failed to generate timetable: ' + error.message);
      setGenerationResult({ 
        success: false, 
        error: error.message 
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
                  className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  <Upload size={18} />
                  <span className="font-medium">Upload Config</span>
                </button>
                
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  <Download size={18} />
                  <span className="font-medium">Download Config</span>
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Data Management</h3>
              <div className="space-y-2">
                <button
                  onClick={handleValidate}
                  className="w-full flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  <Eye size={18} />
                  <span className="font-medium">Validate Data</span>
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleClear('current')}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <RotateCcw size={16} />
                    <span className="text-sm font-medium">Clear Tab</span>
                  </button>

                  <button
                    onClick={() => handleClear('all')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <Trash size={16} />
                    <span className="text-sm font-medium">Clear All</span>
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
                  className="w-full flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  <Settings size={18} />
                  <span className="font-medium">Algorithm Settings</span>
                </button>

                <button
                  onClick={handleGenerateTimetable}
                  disabled={isGenerating}
                  className="w-full flex items-center gap-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed font-semibold"
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
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed"
              title={!generationResult ? 'Generate a timetable first' : 'Export timetable to PDF'}
            >
              <FileText size={16} />
              <span className="font-medium">Export PDF</span>
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

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Algorithm Settings</h3>
                <button
                  onClick={() => setShowAlgorithmSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Population Size ({algorithmSettings.populationSize})
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={algorithmSettings.populationSize}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, populationSize: parseInt(e.target.value)}))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">Number of solutions in each generation (20-100)</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generations ({algorithmSettings.generations})
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    value={algorithmSettings.generations}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, generations: parseInt(e.target.value)}))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">Maximum number of iterations (25-200)</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mutation Rate ({(algorithmSettings.mutationRate * 100).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.30"
                    step="0.01"
                    value={algorithmSettings.mutationRate}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, mutationRate: parseFloat(e.target.value)}))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">Probability of random changes (5-30%)</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crossover Rate ({(algorithmSettings.crossoverRate * 100).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0.60"
                    max="0.95"
                    step="0.01"
                    value={algorithmSettings.crossoverRate}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, crossoverRate: parseFloat(e.target.value)}))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">Probability of combining solutions (60-95%)</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Elite Size ({algorithmSettings.eliteSize})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={algorithmSettings.eliteSize}
                    onChange={(e) => setAlgorithmSettings(prev => ({...prev, eliteSize: parseInt(e.target.value)}))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">Number of best solutions to keep (1-10)</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="font-medium text-red-800">Generation Failed</span>
                  </div>
                  <p className="text-red-700 mt-1">{generationResult.error}</p>
                  <button
                    onClick={() => setGenerationResult(null)}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
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