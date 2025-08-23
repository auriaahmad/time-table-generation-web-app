from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Basic Info Models
class BasicInfo(BaseModel):
    universityName: str
    academicYear: str
    semester: str
    totalWeeks: int = 16
    workingDays: List[str]
    dailyPeriods: int = 8
    periodDuration: int = 60
    breakDuration: int = 15
    lunchBreakStart: str = "12:00"
    lunchBreakEnd: str = "13:00"

# Time Slot Model
class TimeSlot(BaseModel):
    id: int
    startTime: str
    endTime: str

# Department Model
class Department(BaseModel):
    id: int
    name: str
    code: str
    head: str = ""
    programs: List[str] = []

# Teacher Model
class Teacher(BaseModel):
    id: int
    name: str
    employeeId: str = ""
    department: str
    designation: str
    email: str = ""
    phone: str = ""
    qualifications: List[str] = []
    subjectsCanTeach: List[str] = []
    maxHoursPerWeek: int = 18
    minHoursPerWeek: int = 12
    preferredTimeSlots: List[int] = []
    unavailableSlots: List[int] = []
    preferredDays: List[str] = []
    researchDays: List[str] = []
    maxConsecutiveHours: int = 4
    maxGapHours: int = 2

# Subject Model
class Subject(BaseModel):
    id: int
    name: str
    code: str
    department: str
    credits: int = 3
    type: str = "Theory"  # Theory, Lab, Tutorial, Practical
    hoursPerWeek: int = 3
    duration: int = 60
    semester: int
    year: int
    isElective: bool = False
    prerequisites: List[str] = []
    maxStudents: int = 60
    requiredRoomType: str = "Classroom"
    equipmentRequired: List[str] = []
    description: str = ""

# Room Model
class Room(BaseModel):
    id: int
    name: str
    building: str = ""
    floor: int = 1
    type: str = "Classroom"  # Classroom, Laboratory, Auditorium, etc.
    capacity: int = 50
    equipment: List[str] = []
    isAccessible: bool = False
    hasAC: bool = False
    unavailableSlots: List[int] = []
    preferredFor: List[str] = []
    maintenanceSlots: List[int] = []

# Student Group Model
class StudentGroup(BaseModel):
    id: int
    batch: str
    department: str
    year: int
    semester: int
    section: str = "A"
    totalStudents: int
    subjects: List[int] = []  # Subject IDs
    type: str = "Full-time"  # Full-time, Part-time, Evening
    maxHoursPerDay: int = 8
    preferredTimeSlots: List[int] = []
    unavailableSlots: List[int] = []

# Constraints Model
class HardConstraints(BaseModel):
    noClashStudents: bool = True
    noClashTeachers: bool = True
    noClashRooms: bool = True
    respectWorkingHours: bool = True
    roomCapacityCheck: bool = True
    teacherQualificationCheck: bool = True

class SoftConstraints(BaseModel):
    teacherPreferences: float = 0.8
    studentPreferences: float = 0.6
    roomPreferences: float = 0.7
    minimizeGaps: float = 0.9
    evenDistribution: float = 0.8
    lunchBreakRespect: float = 0.9
    maxConsecutiveHours: float = 0.8
    buildingChangeMinimize: float = 0.7

class Constraints(BaseModel):
    hard: HardConstraints
    soft: SoftConstraints

# Metadata Model
class Metadata(BaseModel):
    createdAt: str
    lastModified: str
    version: str = "1.0"
    createdBy: str = ""
    notes: str = ""

# Main University Data Model
class UniversityData(BaseModel):
    basicInfo: BasicInfo
    timeSlots: List[TimeSlot]
    departments: List[Department]
    teachers: List[Teacher]
    subjects: List[Subject]
    rooms: List[Room]
    students: List[StudentGroup]
    constraints: Constraints
    metadata: Metadata

# Timetable Generation Request Model
class TimetableRequest(BaseModel):
    universityData: UniversityData
    algorithmSettings: Optional[Dict[str, Any]] = {
        "populationSize": 100,
        "generations": 500,
        "mutationRate": 0.1,
        "crossoverRate": 0.8,
        "eliteSize": 10
    }

# Activity Model (for internal use)
class Activity(BaseModel):
    activityId: int
    subjectId: int
    subjectName: str
    teacherId: int
    teacherName: str
    studentGroupId: int
    studentGroupName: str
    roomId: Optional[int] = None
    roomName: Optional[str] = None
    timeslotId: Optional[int] = None
    day: Optional[str] = None
    period: Optional[int] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    duration: int = 60
    type: str = "Theory"
    studentCount: int = 0

# Timetable Response Models
class TimetableActivity(BaseModel):
    subject: str
    teacher: str
    studentGroup: str
    room: str
    studentCount: int
    type: str
    duration: int

class TimetablePeriod(BaseModel):
    period: int
    time: str
    activities: List[TimetableActivity]

class DayTimetable(BaseModel):
    day: str
    periods: List[TimetablePeriod]

class ConflictInfo(BaseModel):
    type: str  # "hard_constraint" or "soft_constraint"
    description: str
    severity: str  # "low", "medium", "high"
    affectedEntities: List[str] = []

class AlgorithmStats(BaseModel):
    generationsRun: int
    finalFitness: float
    constraintViolations: int
    populationSize: int
    executionTime: float

class UtilizationStats(BaseModel):
    teacherUtilization: Dict[str, str]
    roomUtilization: Dict[str, str]
    totalActivities: int
    totalTimeSlots: int
    utilizationPercentage: float

# Main Timetable Response Model
class TimetableResponse(BaseModel):
    success: bool
    message: str = ""
    executionTime: str
    algorithmStats: AlgorithmStats
    timetable: List[DayTimetable]
    conflicts: List[ConflictInfo] = []
    statistics: UtilizationStats
    generatedAt: str = Field(default_factory=lambda: datetime.now().isoformat())