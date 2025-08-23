// app/components/forms/Subjects.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../../utils/dataStructure';
import DepartmentProgramDropdown from '../DepartmentProgramDropdown';

export default function Subjects({ data, onChange, universityData }) {
  const [subjects, setSubjects] = useState(() => {
    return (data || []).map((subject, index) => ({
      ...subject,
      id: subject.id || (Date.now() + index + Math.random()),
      program: subject.program || ""
    }));
  });
  const [scrollToId, setScrollToId] = useState(null);
  const subjectRefs = useRef({});

  const subjectTypes = ['Theory', 'Lab', 'Tutorial', 'Practical', 'Seminar'];
  const departments = universityData.departments || [];

  const updateSubjects = (newSubjects) => {
    setSubjects(newSubjects);
    onChange(newSubjects);
  };

  // Auto-scroll to newly created item
  useEffect(() => {
    if (scrollToId && subjectRefs.current[scrollToId]) {
      setTimeout(() => {
        subjectRefs.current[scrollToId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        setScrollToId(null);
      }, 100);
    }
  }, [scrollToId, subjects]);

  const addSubject = () => {
    const newSubject = {
      id: Date.now() + Math.random(),
      name: "",
      code: "",
      department: "",
      program: "",
      credits: 3,
      type: "Theory",
      hoursPerWeek: 3,
      duration: 60,
      semester: 1,
      year: 1,
      isElective: false,
      prerequisites: [],
      maxStudents: 60,
      requiredRoomType: "Classroom",
      equipmentRequired: [],
      description: ""
    };
    updateSubjects([newSubject, ...subjects]);
    setScrollToId(newSubject.id);
  };

  const removeSubject = (id) => {
    updateSubjects(subjects.filter(subject => subject.id !== id));
  };

  const updateSubject = (id, field, value) => {
    const newSubjects = subjects.map(subject => 
      subject.id === id ? { ...subject, [field]: value } : subject
    );
    updateSubjects(newSubjects);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Subjects/Courses</h3>
            <p className="text-gray-600">Configure subjects and their requirements</p>
          </div>
        </div>
        <button 
          onClick={addSubject} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] font-medium"
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {/* Sticky Add Button */}
      {subjects.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={addSubject}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 font-medium"
            title="Add New Subject"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Subject</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div 
            key={`subject-${subject.id}-${index}`} 
            className="card"
            ref={(el) => subjectRefs.current[subject.id] = el}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                  className="input-field"
                  placeholder="Data Structures"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subject.code}
                  onChange={(e) => updateSubject(subject.id, 'code', e.target.value)}
                  className="input-field"
                  placeholder="CS301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={subject.type}
                  onChange={(e) => updateSubject(subject.id, 'type', e.target.value)}
                  className="input-field"
                >
                  {subjectTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <DepartmentProgramDropdown
                departments={departments}
                selectedDepartment={subject.department}
                selectedProgram={subject.program || ''}
                onDepartmentChange={(dept) => updateSubject(subject.id, 'department', dept)}
                onProgramChange={(prog) => updateSubject(subject.id, 'program', prog)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input
                  type="number"
                  value={subject.credits}
                  onChange={(e) => updateSubject(subject.id, 'credits', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Week</label>
                <input
                  type="number"
                  value={subject.hoursPerWeek}
                  onChange={(e) => updateSubject(subject.id, 'hoursPerWeek', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={subject.year}
                  onChange={(e) => updateSubject(subject.id, 'year', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input
                  type="number"
                  value={subject.semester}
                  onChange={(e) => updateSubject(subject.id, 'semester', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="8"
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subject.isElective}
                    onChange={(e) => updateSubject(subject.id, 'isElective', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Elective</span>
                </label>
                <button
                  onClick={() => removeSubject(subject.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Remove subject"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {subjects.length === 0 && (
          <div className="card text-center py-8">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Subjects Added</h4>
            <p className="text-gray-600 mb-4">Add subjects/courses to your curriculum</p>
            <button onClick={addSubject} className="btn-primary">Add First Subject</button>
          </div>
        )}
      </div>
    </div>
  );
}