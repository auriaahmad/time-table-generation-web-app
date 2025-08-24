// app/utils/dataStructure.js
import { v4 as uuidv4 } from 'uuid';

// Clean slate - no default values
export const defaultUniversityData = {
  basicInfo: {
    universityName: "",
    academicYear: "",
    semester: "",
    totalWeeks: 16,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    dailyPeriods: 8,
    periodDuration: 60, // minutes
    breakDuration: 15, // minutes
    lunchBreakStart: "12:00",
    lunchBreakEnd: "13:00"
  },
  
  timeSlots: [], // Empty - no default time slots
  
  departments: [], // Empty - no default departments
  
  teachers: [], // Empty - no default teachers
  
  subjects: [], // Empty - no default subjects
  
  rooms: [], // Empty - no default rooms
  
  students: [], // Empty - no default students
  
  constraints: {
    hard: {
      noClashStudents: true,
      noClashTeachers: true,
      noClashRooms: true,
      respectWorkingHours: true,
      roomCapacityCheck: true,
      teacherQualificationCheck: true
    },
    soft: {
      teacherPreferences: 0.8,
      studentPreferences: 0.6,
      roomPreferences: 0.7,
      minimizeGaps: 0.9,
      evenDistribution: 0.8,
      lunchBreakRespect: 0.9,
      maxConsecutiveHours: 0.8,
      buildingChangeMinimize: 0.7
    }
  },
  
  metadata: {
    createdAt: "",  // Will be set when data is actually created
    lastModified: "", // Will be set when data is actually modified
    version: "1.0",
    createdBy: "",
    notes: ""
  }
};

// UUID-based ID generator - much better than incremental IDs
export const generateId = (type = 'general') => {
  // Generate a UUID v4 (random UUID)
  const uuid = uuidv4();
  
  // Optional: Add type prefix for better debugging/identification
  if (type && type !== 'general') {
    return `${type}_${uuid}`;
  }
  
  return uuid;
};

// Legacy support - these functions are no longer needed with UUIDs
// but kept for backward compatibility
export const resetIdCounters = () => {
  // No-op with UUIDs - each ID is already globally unique
  console.log('resetIdCounters called - no action needed with UUIDs');
};

export const initializeIdCounters = (data) => {
  // No-op with UUIDs - no counters to initialize
  console.log('initializeIdCounters called - no action needed with UUIDs');
};

export const exportToJSON = (data) => {
  const now = new Date();
  const isoString = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0') + 'T' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0') + '.000Z';
  
  const dateString = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
    
  const validatedData = {
    ...data,
    metadata: {
      ...data.metadata,
      lastModified: isoString,
      exportedAt: isoString
    }
  };
  
  const blob = new Blob([JSON.stringify(validatedData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `university-resources-${dateString}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Validate imported data structure
        if (data.basicInfo !== undefined && data.teachers !== undefined && data.subjects !== undefined && data.rooms !== undefined) {
          // Initialize ID counters based on imported data
          initializeIdCounters(data);
          resolve(data);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

export const validateUniversityData = (data) => {
  const errors = [];
  
  // Basic Info validation
  if (!data.basicInfo?.universityName) {
    errors.push("University name is required");
  }
  
  if (!data.basicInfo?.academicYear) {
    errors.push("Academic year is required");
  }
  
  // Teachers validation
  data.teachers?.forEach((teacher, index) => {
    if (!teacher.name) {
      errors.push(`Teacher ${index + 1}: Name is required`);
    }
    if (!teacher.department) {
      errors.push(`Teacher ${index + 1}: Department is required`);
    }
    if (teacher.maxHoursPerWeek < teacher.minHoursPerWeek) {
      errors.push(`Teacher ${index + 1}: Max hours cannot be less than min hours`);
    }
  });
  
  // Subjects validation
  data.subjects?.forEach((subject, index) => {
    if (!subject.name) {
      errors.push(`Subject ${index + 1}: Name is required`);
    }
    if (!subject.code) {
      errors.push(`Subject ${index + 1}: Code is required`);
    }
    if (subject.credits <= 0) {
      errors.push(`Subject ${index + 1}: Credits must be greater than 0`);
    }
  });
  
  // Rooms validation
  data.rooms?.forEach((room, index) => {
    if (!room.name) {
      errors.push(`Room ${index + 1}: Name is required`);
    }
    if (room.capacity <= 0) {
      errors.push(`Room ${index + 1}: Capacity must be greater than 0`);
    }
  });
  
  return errors;
};