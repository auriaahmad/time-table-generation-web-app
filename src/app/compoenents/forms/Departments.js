// app/components/forms/Departments.js
'use client';

import { useState } from 'react';
import { Building, Plus, Trash2, Edit2 } from 'lucide-react';
import { generateId } from '../../utils/dataStructure';

export default function Departments({ data, onChange }) {
  const [departments, setDepartments] = useState(data || []);

  const updateDepartments = (newDepartments) => {
    setDepartments(newDepartments);
    onChange(newDepartments);
  };

  const addDepartment = () => {
    const newDept = {
      id: generateId(),
      name: "",
      code: "",
      head: "",
      programs: []
    };
    updateDepartments([...departments, newDept]);
  };

  const addProgram = (deptId) => {
    updateDepartments(departments.map(dept => 
      dept.id === deptId ? { 
        ...dept, 
        programs: [...dept.programs, ""] 
      } : dept
    ));
  };

  const removeProgram = (deptId, programIndex) => {
    updateDepartments(departments.map(dept => 
      dept.id === deptId ? { 
        ...dept, 
        programs: dept.programs.filter((_, index) => index !== programIndex) 
      } : dept
    ));
  };

  const updateProgram = (deptId, programIndex, value) => {
    updateDepartments(departments.map(dept => 
      dept.id === deptId ? { 
        ...dept, 
        programs: dept.programs.map((program, index) => 
          index === programIndex ? value : program
        ) 
      } : dept
    ));
  };

  const removeDepartment = (id) => {
    updateDepartments(departments.filter(dept => dept.id !== id));
  };

  const updateDepartment = (id, field, value) => {
    updateDepartments(departments.map(dept => 
      dept.id === id ? { ...dept, [field]: value } : dept
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Departments</h3>
            <p className="text-gray-600">Configure academic departments and programs</p>
          </div>
        </div>
        <button onClick={addDepartment} className="flex items-center gap-2 btn-primary">
          <Plus size={16} />
          Add Department
        </button>
      </div>

      <div className="space-y-4">
        {departments.map((dept, index) => (
          <div key={dept.id} className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={dept.name}
                  onChange={(e) => updateDepartment(dept.id, 'name', e.target.value)}
                  className="input-field"
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
                <input
                  type="text"
                  value={dept.code}
                  onChange={(e) => updateDepartment(dept.id, 'code', e.target.value)}
                  className="input-field"
                  placeholder="CS"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
                  <input
                    type="text"
                    value={dept.head}
                    onChange={(e) => updateDepartment(dept.id, 'head', e.target.value)}
                    className="input-field"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <button
                  onClick={() => removeDepartment(dept.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Remove department"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {/* Programs Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Offered Programs ({dept.programs?.length || 0})
                </label>
                <button
                  onClick={() => addProgram(dept.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Program
                </button>
              </div>
              
              {dept.programs && dept.programs.length > 0 ? (
                <div className="space-y-2">
                  {dept.programs.map((program, programIndex) => (
                    <div key={programIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={program}
                        onChange={(e) => updateProgram(dept.id, programIndex, e.target.value)}
                        className="input-field flex-1"
                        placeholder="Bachelor of Computer Science"
                      />
                      <button
                        onClick={() => removeProgram(dept.id, programIndex)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove program"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No programs added. Click &quot;Add Program&quot; to add programs offered by this department.</p>
              )}
            </div>
          </div>
        ))}
        
        {departments.length === 0 && (
          <div className="card text-center py-8">
            <Building size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Departments Added</h4>
            <p className="text-gray-600 mb-4">Add departments to organize your university structure</p>
            <button onClick={addDepartment} className="btn-primary">Add First Department</button>
          </div>
        )}
      </div>
    </div>
  );
}