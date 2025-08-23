// app/components/DepartmentProgramDropdown.js
'use client';

import { useState, useEffect } from 'react';

export default function DepartmentProgramDropdown({
  departments = [],
  selectedDepartment = '',
  selectedProgram = '',
  onDepartmentChange,
  onProgramChange,
  departmentPlaceholder = 'Select Department',
  programPlaceholder = 'Select Program',
  className = ''
}) {
  const [availablePrograms, setAvailablePrograms] = useState([]);

  // Update available programs when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const department = departments.find(d => d.name === selectedDepartment);
      setAvailablePrograms(department?.programs || []);
      
      // Clear program selection if current program is not available in new department
      if (selectedProgram && department && !department.programs?.includes(selectedProgram)) {
        onProgramChange('');
      }
    } else {
      setAvailablePrograms([]);
      if (selectedProgram) {
        onProgramChange('');
      }
    }
  }, [selectedDepartment, departments, selectedProgram, onProgramChange]);

  const handleDepartmentChange = (e) => {
    const newDepartment = e.target.value;
    onDepartmentChange(newDepartment);
  };

  const handleProgramChange = (e) => {
    const newProgram = e.target.value;
    onProgramChange(newProgram);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Department Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          className="input-field"
        >
          <option value="">{departmentPlaceholder}</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Program Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
        <select
          value={selectedProgram}
          onChange={handleProgramChange}
          className="input-field"
          disabled={!selectedDepartment || availablePrograms.length === 0}
        >
          <option value="">{programPlaceholder}</option>
          {availablePrograms.map((program, index) => (
            <option key={index} value={program}>{program}</option>
          ))}
        </select>
        {selectedDepartment && availablePrograms.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            No programs available for {selectedDepartment}
          </p>
        )}
      </div>
    </div>
  );
}