// app/components/forms/Subjects.js
'use client';

import { useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../../utils/dataStructure';

export default function Subjects({ data, onChange, universityData }) {
  const [subjects, setSubjects] = useState(data || []);

  const subjectTypes = ['Theory', 'Lab', 'Tutorial', 'Practical', 'Seminar'];
  const departments = universityData.departments?.map(d => d.name) || [];

  const updateSubjects = (newSubjects) => {
    setSubjects(newSubjects);
    onChange(newSubjects);
  };

  const addSubject = () => {
    const newSubject = {
      id: generateId(),
      name: "",
      code: "",
      department: "",
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
    updateSubjects([...subjects, newSubject]);
  };

  const removeSubject = (id) => {
    updateSubjects(subjects.filter(subject => subject.id !== id));
  };

  const updateSubject = (id, field, value) => {
    updateSubjects(subjects.map(subject => 
      subject.id === id ? { ...subject, [field]: value } : subject
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Subjects/Courses</h3>
            <p className="text-gray-600">Configure subjects and their requirements</p>
          </div>
        </div>
        <button onClick={addSubject} className="flex items-center gap-2 btn-primary">
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div key={subject.id} className="card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={subject.department}
                  onChange={(e) => updateSubject(subject.id, 'department', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
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