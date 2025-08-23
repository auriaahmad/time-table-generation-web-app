// app/utils/dataStructure.js

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

// Global counters for consistent ID generation
let idCounters = {
  teachers: 0,
  subjects: 0,
  rooms: 0,
  students: 0,
  departments: 0,
  timeSlots: 0
};

// Simple ID generator that uses incrementing numbers
export const generateId = (type = 'general') => {
  if (idCounters[type] !== undefined) {
    idCounters[type]++;
    return idCounters[type];
  }
  // For general use, return a consistent counter-based ID
  if (!idCounters.general) idCounters.general = 0;
  idCounters.general++;
  return idCounters.general;
};

// Reset ID counters
export const resetIdCounters = () => {
  idCounters = {
    teachers: 0,
    subjects: 0,
    rooms: 0,
    students: 0,
    departments: 0,
    timeSlots: 0,
    general: 0
  };
};

// Initialize ID counters based on existing data
export const initializeIdCounters = (data) => {
  if (data.teachers) {
    idCounters.teachers = Math.max(0, ...data.teachers.map(t => typeof t.id === 'number' ? t.id : 0));
  }
  if (data.subjects) {
    idCounters.subjects = Math.max(0, ...data.subjects.map(s => typeof s.id === 'number' ? s.id : 0));
  }
  if (data.rooms) {
    idCounters.rooms = Math.max(0, ...data.rooms.map(r => typeof r.id === 'number' ? r.id : 0));
  }
  if (data.students) {
    idCounters.students = Math.max(0, ...data.students.map(s => typeof s.id === 'number' ? s.id : 0));
  }
  if (data.departments) {
    idCounters.departments = Math.max(0, ...data.departments.map(d => typeof d.id === 'number' ? d.id : 0));
  }
  if (data.timeSlots) {
    idCounters.timeSlots = Math.max(0, ...data.timeSlots.map(t => typeof t.id === 'number' ? t.id : 0));
  }
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