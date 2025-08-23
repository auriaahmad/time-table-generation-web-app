// app/components/PDFExportModal.js
'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Users, User, Building, Calendar, X } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

// Dynamic import to avoid SSR issues
let generateTimetablePDF = null;

export default function PDFExportModal({ 
  isOpen, 
  onClose, 
  timetableData, 
  universityData 
}) {
  const [selectedType, setSelectedType] = useState('master');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfGeneratorLoaded, setPdfGeneratorLoaded] = useState(false);

  // Load PDF generator only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../utils/pdfGenerator').then(module => {
        generateTimetablePDF = module.generateTimetablePDF;
        setPdfGeneratorLoaded(true);
      });
    }
  }, []);

  if (!isOpen) return null;

  // Helper function to flatten timetable data for extracting options
  const flattenTimetableForOptions = (timetableData) => {
    if (!timetableData?.timetable) return [];
    const flattened = [];
    timetableData.timetable.forEach(dayData => {
      dayData.periods.forEach(period => {
        period.activities.forEach(activity => {
          flattened.push(activity);
        });
      });
    });
    return flattened;
  };

  // Extract available options from flattened timetable data
  const flattenedData = flattenTimetableForOptions(timetableData);
  const departments = universityData?.departments?.map(d => d.name) || [];
  const teachers = [...new Set(flattenedData.map(item => item.teacher).filter(Boolean))] || [];
  const studentGroups = [...new Set(flattenedData.map(item => item.studentGroup).filter(Boolean))] || [];

  const pdfTypes = [
    {
      id: 'master',
      title: 'Complete Master Timetable',
      description: 'All classes, departments, and teachers in one comprehensive view',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'department',
      title: 'Department-wise Timetables',
      description: 'Individual timetables for each department',
      icon: Building,
      color: 'green',
      hasOptions: true
    },
    {
      id: 'faculty',
      title: 'Individual Faculty Schedules',
      description: 'Personal schedules for each teacher',
      icon: User,
      color: 'purple',
      hasOptions: true
    },
    {
      id: 'student',
      title: 'Student Class Timetables',
      description: 'Class schedules for student groups',
      icon: Users,
      color: 'indigo',
      hasOptions: true
    },
    {
      id: 'room',
      title: 'Room Utilization Schedule',
      description: 'Room usage analysis and occupancy details',
      icon: FileText,
      color: 'orange'
    }
  ];

  const handleGeneratePDF = async () => {
    if (!pdfGeneratorLoaded || !generateTimetablePDF) {
      alert('PDF generator is still loading. Please try again in a moment.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const options = {};
      
      // Add specific selections based on type
      switch (selectedType) {
        case 'department':
          if (selectedDepartment) options.selectedDepartment = selectedDepartment;
          break;
        case 'faculty':
          if (selectedTeacher) options.selectedTeacher = selectedTeacher;
          break;
        case 'student':
          if (selectedGroup) options.selectedGroup = selectedGroup;
          break;
      }
      
      generateTimetablePDF(selectedType, timetableData, universityData, options);
      
      // Close modal after successful generation
      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
      setIsGenerating(false);
    }
  };

  const selectedPdfType = pdfTypes.find(type => type.id === selectedType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Download className="text-blue-600" size={24} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Export Timetable to PDF</h3>
                <p className="text-gray-600">Choose the format and options for your timetable export</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* PDF Type Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Select Timetable Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pdfTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent 
                        className={`${isSelected ? `text-${type.color}-600` : 'text-gray-400'} mt-1`} 
                        size={20} 
                      />
                      <div className="flex-1">
                        <h5 className={`font-medium ${isSelected ? `text-${type.color}-900` : 'text-gray-900'}`}>
                          {type.title}
                        </h5>
                        <p className={`text-sm ${isSelected ? `text-${type.color}-700` : 'text-gray-600'} mt-1`}>
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options Section */}
          {selectedPdfType?.hasOptions && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-3">Export Options</h4>
              
              {selectedType === 'department' && departments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Department
                  </label>
                  <SearchableDropdown
                    options={departments}
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    placeholder="Select Department..."
                    emptyText="No departments available"
                    className="max-w-md"
                  />
                </div>
              )}
              
              {selectedType === 'faculty' && teachers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Teacher
                  </label>
                  <SearchableDropdown
                    options={teachers}
                    value={selectedTeacher}
                    onChange={setSelectedTeacher}
                    placeholder="Select Teacher..."
                    emptyText="No teachers available"
                    className="max-w-md"
                  />
                </div>
              )}
              
              {selectedType === 'student' && studentGroups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student Group
                  </label>
                  <SearchableDropdown
                    options={studentGroups}
                    value={selectedGroup}
                    onChange={setSelectedGroup}
                    placeholder="Select Student Group..."
                    emptyText="No student groups available"
                    className="max-w-md"
                  />
                </div>
              )}
            </div>
          )}

          {/* Preview Information */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Export Preview</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Format:</strong> {selectedPdfType?.title}</p>
              <p><strong>University:</strong> {universityData?.basicInfo?.universityName || 'N/A'}</p>
              <p><strong>Academic Year:</strong> {universityData?.basicInfo?.academicYear || 'N/A'}</p>
              <p><strong>Total Classes:</strong> {timetableData?.algorithmStats?.totalActivities || 0}</p>
              
              {selectedType === 'department' && selectedDepartment && (
                <p><strong>Department:</strong> {selectedDepartment}</p>
              )}
              {selectedType === 'faculty' && selectedTeacher && (
                <p><strong>Teacher:</strong> {selectedTeacher}</p>
              )}
              {selectedType === 'student' && selectedGroup && (
                <p><strong>Student Group:</strong> {selectedGroup}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating || !pdfGeneratorLoaded}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              {!pdfGeneratorLoaded ? 'Loading PDF Generator...' : isGenerating ? 'Generating PDF...' : 'Generate & Download PDF'}
            </button>
          </div>

          {/* Data Validation Warning */}
          {(!timetableData?.timetable || !timetableData.success || (timetableData.algorithmStats?.totalActivities || 0) === 0) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">
                  Warning: No timetable data available. Generate a timetable first.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}