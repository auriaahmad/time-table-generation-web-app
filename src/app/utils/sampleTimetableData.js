// Sample timetable data for testing PDF generation
export const sampleTimetableData = {
  success: true,
  message: "Timetable generated successfully",
  executionTime: "2.34 seconds",
  algorithmStats: {
    generationsRun: 45,
    finalFitness: 92.5,
    populationSize: 30,
    totalActivities: 150
  },
  schedule: [
    // Monday - Computer Science Department
    {
      id: 1,
      day: "Monday",
      startTime: "08:00",
      endTime: "09:00",
      subject: "Data Structures",
      teacher: "Dr. Smith",
      department: "Computer Science",
      studentGroup: "CS-2024-A",
      room: "CS-101",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 2,
      day: "Monday",
      startTime: "09:00",
      endTime: "10:00",
      subject: "Database Systems",
      teacher: "Prof. Johnson",
      department: "Computer Science",
      studentGroup: "CS-2023-B",
      room: "CS-102",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 3,
      day: "Monday",
      startTime: "10:30",
      endTime: "11:30",
      subject: "Linear Algebra",
      teacher: "Dr. Brown",
      department: "Mathematics",
      studentGroup: "MATH-2024-A",
      room: "MATH-201",
      programs: ["Bachelor of Mathematics"]
    },
    {
      id: 4,
      day: "Monday",
      startTime: "11:30",
      endTime: "12:30",
      subject: "Software Engineering",
      teacher: "Dr. Smith",
      department: "Computer Science",
      studentGroup: "CS-2022-A",
      room: "CS-103",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 5,
      day: "Monday",
      startTime: "14:00",
      endTime: "15:00",
      subject: "Quantum Physics",
      teacher: "Prof. Wilson",
      department: "Physics",
      studentGroup: "PHY-2023-A",
      room: "PHY-301",
      programs: ["Bachelor of Physics"]
    },
    
    // Tuesday - Mixed Departments
    {
      id: 6,
      day: "Tuesday",
      startTime: "08:00",
      endTime: "09:00",
      subject: "Algorithms",
      teacher: "Prof. Johnson",
      department: "Computer Science",
      studentGroup: "CS-2024-A",
      room: "CS-101",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 7,
      day: "Tuesday",
      startTime: "09:00",
      endTime: "10:00",
      subject: "Calculus II",
      teacher: "Dr. Brown",
      department: "Mathematics",
      studentGroup: "MATH-2024-A",
      room: "MATH-201",
      programs: ["Bachelor of Mathematics"]
    },
    {
      id: 8,
      day: "Tuesday",
      startTime: "10:30",
      endTime: "11:30",
      subject: "Operating Systems",
      teacher: "Dr. Davis",
      department: "Computer Science",
      studentGroup: "CS-2023-B",
      room: "CS-102",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 9,
      day: "Tuesday",
      startTime: "11:30",
      endTime: "12:30",
      subject: "Thermodynamics",
      teacher: "Prof. Wilson",
      department: "Physics",
      studentGroup: "PHY-2023-A",
      room: "PHY-301",
      programs: ["Bachelor of Physics"]
    },
    {
      id: 10,
      day: "Tuesday",
      startTime: "14:00",
      endTime: "15:00",
      subject: "Machine Learning",
      teacher: "Dr. Smith",
      department: "Computer Science",
      studentGroup: "CS-2022-A",
      room: "CS-103",
      programs: ["Bachelor of Computer Science", "Master of Computer Science"]
    },
    
    // Wednesday
    {
      id: 11,
      day: "Wednesday",
      startTime: "08:00",
      endTime: "09:00",
      subject: "Statistics",
      teacher: "Dr. Brown",
      department: "Mathematics",
      studentGroup: "MATH-2024-B",
      room: "MATH-202",
      programs: ["Bachelor of Mathematics"]
    },
    {
      id: 12,
      day: "Wednesday",
      startTime: "09:00",
      endTime: "10:00",
      subject: "Computer Networks",
      teacher: "Prof. Johnson",
      department: "Computer Science",
      studentGroup: "CS-2023-A",
      room: "CS-104",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 13,
      day: "Wednesday",
      startTime: "10:30",
      endTime: "11:30",
      subject: "Organic Chemistry",
      teacher: "Dr. Taylor",
      department: "Chemistry",
      studentGroup: "CHEM-2024-A",
      room: "CHEM-401",
      programs: ["Bachelor of Chemistry"]
    },
    {
      id: 14,
      day: "Wednesday",
      startTime: "11:30",
      endTime: "12:30",
      subject: "Web Development",
      teacher: "Dr. Davis",
      department: "Computer Science",
      studentGroup: "CS-2024-B",
      room: "CS-105",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 15,
      day: "Wednesday",
      startTime: "14:00",
      endTime: "15:00",
      subject: "Electromagnetism",
      teacher: "Prof. Wilson",
      department: "Physics",
      studentGroup: "PHY-2022-A",
      room: "PHY-302",
      programs: ["Bachelor of Physics"]
    },
    
    // Thursday
    {
      id: 16,
      day: "Thursday",
      startTime: "08:00",
      endTime: "09:00",
      subject: "Data Mining",
      teacher: "Dr. Smith",
      department: "Computer Science",
      studentGroup: "CS-2022-A",
      room: "CS-101",
      programs: ["Bachelor of Computer Science", "Master of Computer Science"]
    },
    {
      id: 17,
      day: "Thursday",
      startTime: "09:00",
      endTime: "10:00",
      subject: "Real Analysis",
      teacher: "Dr. Brown",
      department: "Mathematics",
      studentGroup: "MATH-2023-A",
      room: "MATH-203",
      programs: ["Bachelor of Mathematics"]
    },
    {
      id: 18,
      day: "Thursday",
      startTime: "10:30",
      endTime: "11:30",
      subject: "Artificial Intelligence",
      teacher: "Prof. Johnson",
      department: "Computer Science",
      studentGroup: "CS-2023-B",
      room: "CS-102",
      programs: ["Bachelor of Computer Science", "Master of Computer Science"]
    },
    {
      id: 19,
      day: "Thursday",
      startTime: "11:30",
      endTime: "12:30",
      subject: "Physical Chemistry",
      teacher: "Dr. Taylor",
      department: "Chemistry",
      studentGroup: "CHEM-2023-A",
      room: "CHEM-402",
      programs: ["Bachelor of Chemistry"]
    },
    {
      id: 20,
      day: "Thursday",
      startTime: "14:00",
      endTime: "15:00",
      subject: "Nuclear Physics",
      teacher: "Prof. Wilson",
      department: "Physics",
      studentGroup: "PHY-2022-B",
      room: "PHY-303",
      programs: ["Bachelor of Physics"]
    },
    
    // Friday
    {
      id: 21,
      day: "Friday",
      startTime: "08:00",
      endTime: "09:00",
      subject: "Cybersecurity",
      teacher: "Dr. Davis",
      department: "Computer Science",
      studentGroup: "CS-2024-A",
      room: "CS-106",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 22,
      day: "Friday",
      startTime: "09:00",
      endTime: "10:00",
      subject: "Discrete Mathematics",
      teacher: "Dr. Brown",
      department: "Mathematics",
      studentGroup: "CS-2024-B",
      room: "MATH-201",
      programs: ["Bachelor of Computer Science", "Bachelor of Mathematics"]
    },
    {
      id: 23,
      day: "Friday",
      startTime: "10:30",
      endTime: "11:30",
      subject: "Mobile App Development",
      teacher: "Prof. Johnson",
      department: "Computer Science",
      studentGroup: "CS-2023-A",
      room: "CS-104",
      programs: ["Bachelor of Computer Science"]
    },
    {
      id: 24,
      day: "Friday",
      startTime: "11:30",
      endTime: "12:30",
      subject: "Analytical Chemistry",
      teacher: "Dr. Taylor",
      department: "Chemistry",
      studentGroup: "CHEM-2024-B",
      room: "CHEM-403",
      programs: ["Bachelor of Chemistry"]
    },
    {
      id: 25,
      day: "Friday",
      startTime: "14:00",
      endTime: "15:00",
      subject: "Computational Physics",
      teacher: "Prof. Wilson",
      department: "Physics",
      studentGroup: "PHY-2023-B",
      room: "PHY-304",
      programs: ["Bachelor of Physics"]
    }
  ]
};

export const sampleUniversityData = {
  basicInfo: {
    universityName: "Sample University",
    academicYear: "2024-2025",
    semester: "Fall 2024",
    totalWeeks: 16,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    dailyPeriods: 8,
    periodDuration: 60,
    breakDuration: 15,
    lunchBreakStart: "12:00",
    lunchBreakEnd: "13:00"
  },
  departments: [
    {
      id: 1,
      name: "Computer Science",
      code: "CS",
      head: "Dr. Smith",
      programs: ["Bachelor of Computer Science", "Master of Computer Science"]
    },
    {
      id: 2,
      name: "Mathematics",
      code: "MATH",
      head: "Dr. Brown",
      programs: ["Bachelor of Mathematics", "Master of Mathematics"]
    },
    {
      id: 3,
      name: "Physics",
      code: "PHY",
      head: "Prof. Wilson",
      programs: ["Bachelor of Physics", "Master of Physics"]
    },
    {
      id: 4,
      name: "Chemistry",
      code: "CHEM",
      head: "Dr. Taylor",
      programs: ["Bachelor of Chemistry", "Master of Chemistry"]
    }
  ],
  teachers: [
    {
      id: 1,
      name: "Dr. Smith",
      department: "Computer Science",
      subjects: ["Data Structures", "Software Engineering", "Machine Learning", "Data Mining"]
    },
    {
      id: 2,
      name: "Prof. Johnson",
      department: "Computer Science", 
      subjects: ["Database Systems", "Algorithms", "Computer Networks", "Artificial Intelligence", "Mobile App Development"]
    },
    {
      id: 3,
      name: "Dr. Brown",
      department: "Mathematics",
      subjects: ["Linear Algebra", "Calculus II", "Statistics", "Real Analysis", "Discrete Mathematics"]
    },
    {
      id: 4,
      name: "Prof. Wilson",
      department: "Physics",
      subjects: ["Quantum Physics", "Thermodynamics", "Electromagnetism", "Nuclear Physics", "Computational Physics"]
    },
    {
      id: 5,
      name: "Dr. Davis",
      department: "Computer Science",
      subjects: ["Operating Systems", "Web Development", "Cybersecurity"]
    },
    {
      id: 6,
      name: "Dr. Taylor",
      department: "Chemistry",
      subjects: ["Organic Chemistry", "Physical Chemistry", "Analytical Chemistry"]
    }
  ],
  rooms: [
    { id: 1, name: "CS-101", capacity: 50, type: "Lecture Hall", building: "Computer Science" },
    { id: 2, name: "CS-102", capacity: 40, type: "Classroom", building: "Computer Science" },
    { id: 3, name: "CS-103", capacity: 60, type: "Lecture Hall", building: "Computer Science" },
    { id: 4, name: "CS-104", capacity: 30, type: "Lab", building: "Computer Science" },
    { id: 5, name: "CS-105", capacity: 35, type: "Classroom", building: "Computer Science" },
    { id: 6, name: "CS-106", capacity: 45, type: "Classroom", building: "Computer Science" },
    { id: 7, name: "MATH-201", capacity: 55, type: "Lecture Hall", building: "Mathematics" },
    { id: 8, name: "MATH-202", capacity: 40, type: "Classroom", building: "Mathematics" },
    { id: 9, name: "MATH-203", capacity: 35, type: "Classroom", building: "Mathematics" },
    { id: 10, name: "PHY-301", capacity: 60, type: "Lecture Hall", building: "Physics" },
    { id: 11, name: "PHY-302", capacity: 45, type: "Classroom", building: "Physics" },
    { id: 12, name: "PHY-303", capacity: 50, type: "Lab", building: "Physics" },
    { id: 13, name: "PHY-304", capacity: 40, type: "Classroom", building: "Physics" },
    { id: 14, name: "CHEM-401", capacity: 35, type: "Lab", building: "Chemistry" },
    { id: 15, name: "CHEM-402", capacity: 40, type: "Classroom", building: "Chemistry" },
    { id: 16, name: "CHEM-403", capacity: 50, type: "Lab", building: "Chemistry" }
  ]
};