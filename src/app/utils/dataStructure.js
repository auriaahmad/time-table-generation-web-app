// app/utils/dataStructure.js

// Default data structure for university resources
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
  
  timeSlots: [
    { id: 1, startTime: "08:00", endTime: "09:00", name: "Period 1" },
    { id: 2, startTime: "09:00", endTime: "10:00", name: "Period 2" },
    { id: 3, startTime: "10:00", endTime: "11:00", name: "Period 3" },
    { id: 4, startTime: "11:00", endTime: "12:00", name: "Period 4" },
    { id: 5, startTime: "13:00", endTime: "14:00", name: "Period 5" },
    { id: 6, startTime: "14:00", endTime: "15:00", name: "Period 6" },
    { id: 7, startTime: "15:00", endTime: "16:00", name: "Period 7" },
    { id: 8, startTime: "16:00", endTime: "17:00", name: "Period 8" }
  ],
  
  departments: [
    {
      id: 1,
      name: "",
      code: "",
      head: "",
      programs: []
    }
  ],
  
  teachers: [
    {
      id: 1,
      name: "",
      employeeId: "",
      department: "",
      designation: "Lecturer", // Lecturer, Assistant Professor, Associate Professor, Professor
      email: "",
      phone: "",
      qualifications: [],
      subjectsCanTeach: [],
      maxHoursPerWeek: 18,
      minHoursPerWeek: 12,
      preferredTimeSlots: [],
      unavailableSlots: [],
      preferredDays: [],
      researchDays: [],
      maxConsecutiveHours: 4,
      maxGapHours: 2
    }
  ],
  
  subjects: [
    {
      id: 1,
      name: "",
      code: "",
      department: "",
      credits: 3,
      type: "Theory", // Theory, Lab, Tutorial, Practical
      hoursPerWeek: 3,
      duration: 60, // minutes per session
      semester: 1,
      year: 1,
      isElective: false,
      prerequisites: [],
      maxStudents: 60,
      requiredRoomType: "Classroom",
      equipmentRequired: [],
      description: ""
    }
  ],
  
  rooms: [
    {
      id: 1,
      name: "",
      building: "",
      floor: 1,
      type: "Classroom", // Classroom, Laboratory, Auditorium, Seminar Room, Studio
      capacity: 50,
      equipment: [], // Projector, Computer, Whiteboard, etc.
      isAccessible: false,
      hasAC: false,
      unavailableSlots: [],
      preferredFor: [], // Subject types or departments
      maintenanceSlots: []
    }
  ],
  
  students: [
    {
      id: 1,
      batch: "",
      department: "",
      year: 1,
      semester: 1,
      section: "A",
      totalStudents: 60,
      subjects: [], // Subject IDs they are enrolled in
      type: "Full-time", // Full-time, Part-time, Evening
      maxHoursPerDay: 8,
      preferredTimeSlots: [],
      unavailableSlots: []
    }
  ],
  
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
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    version: "1.0",
    createdBy: "",
    notes: ""
  }
};

// Validation functions
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

// Helper functions
export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

export const exportToJSON = (data) => {
  const validatedData = {
    ...data,
    metadata: {
      ...data.metadata,
      lastModified: new Date().toISOString(),
      exportedAt: new Date().toISOString()
    }
  };
  
  const blob = new Blob([JSON.stringify(validatedData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `university-resources-${new Date().toISOString().split('T')[0]}.json`;
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
        if (data.basicInfo && data.teachers && data.subjects && data.rooms) {
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