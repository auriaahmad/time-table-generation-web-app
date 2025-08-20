// app/components/forms/Teachers.js
'use client';

import { useState } from 'react';
import { Users, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { generateId } from '../../utils/dataStructure';

export default function Teachers({ data, onChange, universityData }) {
  const [teachers, setTeachers] = useState(data || []);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const designations = [
    { value: 'Lecturer', minHours: 12, maxHours: 18 },
    { value: 'Assistant Professor', minHours: 9, maxHours: 15 },
    { value: 'Associate Professor', minHours: 6, maxHours: 12 },
    { value: 'Professor', minHours: 3, maxHours: 9 }
  ];

  const workingDays = universityData.basicInfo?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const updateTeachers = (newTeachers) => {
    setTeachers(newTeachers);
    onChange(newTeachers);
  };

  const addTeacher = () => {
    const newTeacher = {
      id: generateId(),
      name: "",
      employeeId: "",
      department: "",
      designation: "Lecturer",
      email: "",
      phone: "",
      qualifications: [],
      subjectsCanTeach: [],
      maxHoursPerWeek: 18,
      minHoursPerWeek: 12,
      preferredTimeSlots: [],
      unavailableSlots: [],
      preferredDays: [...workingDays],
      researchDays: [],
      maxConsecutiveHours: 4,
      maxGapHours: 2
    };
    
    updateTeachers([...teachers, newTeacher]);
    setEditingId(newTeacher.id);
    setShowAddForm(false);
  };

  const removeTeacher = (id) => {
    updateTeachers(teachers.filter(teacher => teacher.id !== id));
  };

  const updateTeacher = (id, field, value) => {
    updateTeachers(teachers.map(teacher => 
      teacher.id === id ? { ...teacher, [field]: value } : teacher
    ));
  };

  const handleDesignationChange = (id, designation) => {
    const designationInfo = designations.find(d => d.value === designation);
    updateTeacher(id, 'designation', designation);
    updateTeacher(id, 'minHoursPerWeek', designationInfo.minHours);
    updateTeacher(id, 'maxHoursPerWeek', designationInfo.maxHours);
  };

  const toggleArrayItem = (id, field, item) => {
    const teacher = teachers.find(t => t.id === id);
    const currentArray = teacher[field] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateTeacher(id, field, newArray);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Faculty Management</h3>
            <p className="text-gray-600">Add and configure teaching staff with their preferences and constraints</p>
          </div>
        </div>
        
        <button
          onClick={addTeacher}
          className="flex items-center gap-2 btn-primary"
        >
          <Plus size={16} />
          Add Teacher
        </button>
      </div>

      {/* Teachers List */}
      <div className="space-y-4">
        {teachers.length === 0 ? (
          <div className="card text-center py-8">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Teachers Added</h4>
            <p className="text-gray-600 mb-4">Start by adding faculty members to your university</p>
            <button onClick={addTeacher} className="btn-primary">
              Add First Teacher
            </button>
          </div>
        ) : (
          teachers.map((teacher, index) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              index={index}
              isEditing={editingId === teacher.id}
              onEdit={() => setEditingId(teacher.id)}
              onSave={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
              onRemove={() => removeTeacher(teacher.id)}
              onUpdate={(field, value) => updateTeacher(teacher.id, field, value)}
              onDesignationChange={(designation) => handleDesignationChange(teacher.id, designation)}
              onToggleArrayItem={(field, item) => toggleArrayItem(teacher.id, field, item)}
              designations={designations}
              workingDays={workingDays}
              universityData={universityData}
            />
          ))
        )}
      </div>

      {/* Summary */}
      {teachers.length > 0 && (
        <div className="card bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Faculty Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {designations.map(designation => {
              const count = teachers.filter(t => t.designation === designation.value).length;
              return (
                <div key={designation.value}>
                  <span className="font-medium text-gray-700">{designation.value}s:</span>
                  <div className="text-lg font-bold text-blue-600">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherCard({ 
  teacher, 
  index, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onRemove, 
  onUpdate, 
  onDesignationChange,
  onToggleArrayItem,
  designations,
  workingDays,
  universityData 
}) {
  const departments = universityData.departments?.map(d => d.name) || [];
  const subjects = universityData.subjects?.map(s => s.name) || [];

  if (isEditing) {
    return (
      <div className="card border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Edit Teacher #{index + 1}</h4>
          <div className="flex gap-2">
            <button onClick={onSave} className="text-green-600 hover:text-green-800">
              <Save size={16} />
            </button>
            <button onClick={onCancel} className="text-gray-600 hover:text-gray-800">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={teacher.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="input-field"
              placeholder="Teacher name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              value={teacher.employeeId}
              onChange={(e) => onUpdate('employeeId', e.target.value)}
              className="input-field"
              placeholder="Employee ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={teacher.department}
              onChange={(e) => onUpdate('department', e.target.value)}
              className="input-field"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <select
              value={teacher.designation}
              onChange={(e) => onDesignationChange(e.target.value)}
              className="input-field"
            >
              {designations.map(designation => (
                <option key={designation.value} value={designation.value}>
                  {designation.value}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={teacher.email}
              onChange={(e) => onUpdate('email', e.target.value)}
              className="input-field"
              placeholder="email@university.edu"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={teacher.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              className="input-field"
              placeholder="Phone number"
            />
          </div>
        </div>

        {/* Teaching Load */}
        <div className="mb-6">
          <h5 className="text-md font-medium text-gray-900 mb-3">Teaching Load</h5>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Hours/Week</label>
              <input
                type="number"
                value={teacher.minHoursPerWeek}
                onChange={(e) => onUpdate('minHoursPerWeek', parseInt(e.target.value))}
                className="input-field"
                min="0"
                max="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours/Week</label>
              <input
                type="number"
                value={teacher.maxHoursPerWeek}
                onChange={(e) => onUpdate('maxHoursPerWeek', parseInt(e.target.value))}
                className="input-field"
                min="0"
                max="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Consecutive Hours</label>
              <input
                type="number"
                value={teacher.maxConsecutiveHours}
                onChange={(e) => onUpdate('maxConsecutiveHours', parseInt(e.target.value))}
                className="input-field"
                min="1"
                max="8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Gap Hours</label>
              <input
                type="number"
                value={teacher.maxGapHours}
                onChange={(e) => onUpdate('maxGapHours', parseInt(e.target.value))}
                className="input-field"
                min="0"
                max="4"
              />
            </div>
          </div>
        </div>

        {/* Preferred Days */}
        <div className="mb-6">
          <h5 className="text-md font-medium text-gray-900 mb-3">Preferred Working Days</h5>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {workingDays.map(day => (
              <label key={day} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teacher.preferredDays.includes(day)}
                  onChange={() => onToggleArrayItem('preferredDays', day)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{day}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Research Days */}
        <div className="mb-6">
          <h5 className="text-md font-medium text-gray-900 mb-3">Research/Admin Days (No Teaching)</h5>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {workingDays.map(day => (
              <label key={day} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teacher.researchDays.includes(day)}
                  onChange={() => onToggleArrayItem('researchDays', day)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{day}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subjects Can Teach */}
        {subjects.length > 0 && (
          <div className="mb-4">
            <h5 className="text-md font-medium text-gray-900 mb-3">Subjects Can Teach</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {subjects.map(subject => (
                <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teacher.subjectsCanTeach.includes(subject)}
                    onChange={() => onToggleArrayItem('subjectsCanTeach', subject)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">{teacher.name?.charAt(0) || 'T'}</span>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {teacher.name || `Teacher #${index + 1}`}
            </h4>
            <p className="text-sm text-gray-600">
              {teacher.designation} • {teacher.department || 'No Department'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Edit teacher"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 p-1"
            title="Remove teacher"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Teaching Load:</span>
          <div className="text-gray-600">
            {teacher.minHoursPerWeek}-{teacher.maxHoursPerWeek} hours/week
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Preferred Days:</span>
          <div className="text-gray-600">
            {teacher.preferredDays?.length || 0} days selected
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Can Teach:</span>
          <div className="text-gray-600">
            {teacher.subjectsCanTeach?.length || 0} subjects
          </div>
        </div>
      </div>

      {teacher.researchDays?.length > 0 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <span className="text-sm font-medium text-red-800">Research Days: </span>
          <span className="text-sm text-red-600">{teacher.researchDays.join(', ')}</span>
        </div>
      )}
    </div>
  );
}