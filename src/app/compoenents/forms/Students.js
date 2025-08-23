// app/components/forms/Students.js
'use client';

import { useState } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../../utils/dataStructure';
import DepartmentProgramDropdown from '../DepartmentProgramDropdown';

export default function Students({ data, onChange, universityData }) {
  const [students, setStudents] = useState(data || []);

  const departments = universityData.departments || [];
  const subjects = universityData.subjects || [];
  const studentTypes = ['Full-time', 'Part-time', 'Evening', 'Weekend'];

  const updateStudents = (newStudents) => {
    setStudents(newStudents);
    onChange(newStudents);
  };

  const addStudentGroup = () => {
    const newGroup = {
      id: generateId(),
      batch: "",
      department: "",
      program: "",
      year: 1,
      semester: 1,
      section: "A",
      totalStudents: 60,
      subjects: [],
      programs: [],
      type: "Full-time",
      maxHoursPerDay: 8,
      preferredTimeSlots: [],
      unavailableSlots: []
    };
    updateStudents([...students, newGroup]);
  };

  const removeStudentGroup = (id) => {
    updateStudents(students.filter(group => group.id !== id));
  };

  const updateStudentGroup = (id, field, value) => {
    updateStudents(students.map(group => 
      group.id === id ? { ...group, [field]: value } : group
    ));
  };

  const toggleSubject = (id, subjectId) => {
    const group = students.find(g => g.id === id);
    const currentSubjects = group.subjects || [];
    const newSubjects = currentSubjects.includes(subjectId)
      ? currentSubjects.filter(s => s !== subjectId)
      : [...currentSubjects, subjectId];
    updateStudentGroup(id, 'subjects', newSubjects);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Student Groups</h3>
            <p className="text-gray-600">Configure student batches and their enrolled subjects</p>
          </div>
        </div>
        <button onClick={addStudentGroup} className="flex items-center gap-2 btn-primary">
          <Plus size={16} />
          Add Student Group
        </button>
      </div>

      <div className="space-y-4">
        {students.map((group, index) => (
          <div key={group.id} className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch/Class</label>
                <input
                  type="text"
                  value={group.batch}
                  onChange={(e) => updateStudentGroup(group.id, 'batch', e.target.value)}
                  className="input-field"
                  placeholder="CS-2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  value={group.section}
                  onChange={(e) => updateStudentGroup(group.id, 'section', e.target.value)}
                  className="input-field"
                  placeholder="A"
                />
              </div>
            </div>

            <div className="mb-4">
              <DepartmentProgramDropdown
                departments={departments}
                selectedDepartment={group.department}
                selectedProgram={group.program || ''}
                onDepartmentChange={(dept) => updateStudentGroup(group.id, 'department', dept)}
                onProgramChange={(prog) => updateStudentGroup(group.id, 'program', prog)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
                <select
                  value={group.type}
                  onChange={(e) => updateStudentGroup(group.id, 'type', e.target.value)}
                  className="input-field"
                >
                  {studentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={group.year}
                  onChange={(e) => updateStudentGroup(group.id, 'year', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input
                  type="number"
                  value={group.semester}
                  onChange={(e) => updateStudentGroup(group.id, 'semester', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Students</label>
                <input
                  type="number"
                  value={group.totalStudents}
                  onChange={(e) => updateStudentGroup(group.id, 'totalStudents', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours/Day</label>
                <input
                  type="number"
                  value={group.maxHoursPerDay}
                  onChange={(e) => updateStudentGroup(group.id, 'maxHoursPerDay', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="12"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => removeStudentGroup(group.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Remove student group"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {subjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrolled Subjects ({group.subjects?.length || 0} selected)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
                  {subjects
                    .filter(subject => subject.year === group.year && subject.semester === group.semester)
                    .map(subject => (
                    <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={group.subjects?.includes(subject.id) || false}
                        onChange={() => toggleSubject(group.id, subject.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {subject.code} - {subject.name}
                      </span>
                    </label>
                  ))}
                </div>
                {subjects.filter(s => s.year === group.year && s.semester === group.semester).length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No subjects found for Year {group.year}, Semester {group.semester}. Add subjects first.
                  </p>
                )}
              </div>
            )}
            
          </div>
        ))}
        
        {students.length === 0 && (
          <div className="card text-center py-8">
            <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Student Groups Added</h4>
            <p className="text-gray-600 mb-4">Add student groups/classes to organize your students</p>
            <button onClick={addStudentGroup} className="btn-primary">Add First Student Group</button>
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="card bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Student Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total Groups:</span>
              <div className="text-lg font-bold text-blue-600">{students.length}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Students:</span>
              <div className="text-lg font-bold text-green-600">
                {students.reduce((sum, group) => sum + (group.totalStudents || 0), 0)}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Departments:</span>
              <div className="text-lg font-bold text-purple-600">
                {new Set(students.map(g => g.department).filter(Boolean)).size}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Years Covered:</span>
              <div className="text-lg font-bold text-orange-600">
                {new Set(students.map(g => g.year)).size}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Programs:</span>
              <div className="text-lg font-bold text-indigo-600">
                {new Set(students.map(g => g.program).filter(Boolean)).size}
              </div>
            </div>
          </div>
          
          {/* Program breakdown */}
          {students.some(g => g.program) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="text-md font-medium text-gray-800 mb-2">Programs Distribution:</h5>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(students.map(g => g.program).filter(Boolean))).map(program => {
                  const count = students.filter(g => g.program === program).length;
                  return (
                    <span key={program} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {program} ({count} group{count !== 1 ? 's' : ''})
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}