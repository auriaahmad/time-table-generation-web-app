from typing import Dict, Any, List
from collections import defaultdict

def format_enhanced_timetable(solution: List[Dict[str, Any]], university_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Enhanced timetable formatting with better structure"""
    working_days = university_data.get("basicInfo", {}).get("workingDays", [])
    time_slots = university_data.get("timeSlots", [])
    
    timetable = []
    
    for day in working_days:
        day_schedule = {
            "day": day,
            "periods": []
        }
        
        for time_slot in time_slots:
            period = {
                "period": time_slot["id"],
                "time": f"{time_slot['startTime']}-{time_slot['endTime']}",
                "activities": []
            }
            
            # Find activities for this day and time slot
            day_activities = [
                activity for activity in solution 
                if activity["day"] == day and activity["timeSlotId"] == time_slot["id"]
            ]
            
            for activity in day_activities:
                formatted_activity = {
                    "subject": activity["subjectName"],
                    "subjectCode": activity.get("subjectCode", ""),
                    "teacher": activity.get("teacherName", "Unknown"),
                    "studentGroup": activity["studentGroupName"],
                    "room": activity.get("roomName", "Unknown"),
                    "studentCount": activity["studentCount"],
                    "type": activity["subjectType"],
                    "duration": activity["duration"],
                    "department": activity.get("department", ""),
                    "sessionInfo": f"Session {activity.get('sessionNumber', 1)} of {activity.get('totalSessions', 1)}"
                }
                period["activities"].append(formatted_activity)
            
            day_schedule["periods"].append(period)
        
        timetable.append(day_schedule)
    
    return timetable

def calculate_enhanced_teacher_utilization(solution: List[Dict[str, Any]], university_data: Dict[str, Any]) -> Dict[str, str]:
    """Enhanced teacher utilization calculation"""
    teacher_hours = defaultdict(int)
    teacher_subjects = defaultdict(set)
    teachers = {t["id"]: t for t in university_data.get("teachers", [])}
    
    for activity in solution:
        teacher_id = activity["teacherId"]
        teacher_hours[teacher_id] += activity["duration"] // 60
        teacher_subjects[teacher_id].add(activity["subjectName"])
    
    utilization = {}
    for teacher_id, hours in teacher_hours.items():
        teacher = teachers.get(teacher_id, {})
        teacher_name = teacher.get("name", f"Teacher {teacher_id}")
        min_hours = teacher.get("minHoursPerWeek", 0)
        max_hours = teacher.get("maxHoursPerWeek", 20)
        
        percentage = round((hours / max_hours) * 100, 1) if max_hours > 0 else 0
        status = "optimal" if min_hours <= hours <= max_hours else ("underutilized" if hours < min_hours else "overloaded")
        subject_count = len(teacher_subjects[teacher_id])
        
        utilization[teacher_name] = f"{hours}h/week ({percentage}%) - {subject_count} subjects - {status}"
    
    # Add teachers with zero hours
    for teacher in teachers.values():
        if teacher["id"] not in teacher_hours:
            utilization[teacher["name"]] = "0h/week (0%) - 0 subjects - unassigned"
    
    return utilization

def calculate_enhanced_room_utilization(solution: List[Dict[str, Any]], university_data: Dict[str, Any]) -> Dict[str, str]:
    """Enhanced room utilization calculation"""
    room_hours = defaultdict(int)
    room_usage = defaultdict(list)
    rooms = {r["id"]: r for r in university_data.get("rooms", [])}
    
    for activity in solution:
        room_id = activity["roomId"]
        room_hours[room_id] += activity["duration"] // 60
        room_usage[room_id].append(activity["subjectType"])
    
    total_possible_hours = len(university_data.get("timeSlots", [])) * len(university_data.get("basicInfo", {}).get("workingDays", []))
    
    utilization = {}
    for room_id, hours in room_hours.items():
        room = rooms.get(room_id, {})
        room_name = room.get("name", f"Room {room_id}")
        room_type = room.get("type", "Unknown")
        capacity = room.get("capacity", 0)
        
        percentage = round((hours / max(1, total_possible_hours)) * 100, 1)
        usage_types = list(set(room_usage[room_id]))
        
        utilization[room_name] = f"{hours}h/week ({percentage}%) - {room_type} (cap: {capacity}) - {', '.join(usage_types)}"
    
    # Add unused rooms
    for room in rooms.values():
        if room["id"] not in room_hours:
            utilization[room["name"]] = f"0h/week (0%) - {room.get('type', 'Unknown')} (cap: {room.get('capacity', 0)}) - unused"
    
    return utilization

def calculate_constraint_satisfaction(solution: List[Dict[str, Any]], ga_instance) -> Dict[str, Any]:
    """Calculate constraint satisfaction metrics"""
    from .constraint_checker import ConstraintChecker
    
    checker = ConstraintChecker(ga_instance)
    total_activities = len(solution)
    
    # Hard constraint violations
    teacher_conflicts = checker.check_teacher_conflicts(solution)
    student_conflicts = checker.check_student_conflicts(solution)
    room_conflicts = checker.check_room_conflicts(solution)
    capacity_violations = checker.check_room_capacity_violations(solution)
    qualification_violations = checker.check_teacher_qualification_violations(solution)
    room_type_violations = checker.check_room_type_violations(solution)
    
    # Soft constraint violations
    workload_violations = checker.check_teacher_workload_violations(solution)
    consecutive_violations = checker.check_consecutive_hours_violations(solution)
    gap_penalties = checker.check_schedule_gaps(solution)
    lunch_violations = checker.check_lunch_break_violations(solution)
    preference_violations = checker.check_teacher_preference_violations(solution)
    research_day_violations = checker.check_research_day_violations(solution)
    
    hard_violations = (teacher_conflicts + student_conflicts + room_conflicts + 
                      capacity_violations + qualification_violations + room_type_violations)
    
    soft_violations = (workload_violations + consecutive_violations + gap_penalties + 
                      lunch_violations + preference_violations + research_day_violations)
    
    return {
        "hardConstraints": {
            "totalViolations": hard_violations,
            "satisfactionRate": round((1 - min(hard_violations / max(total_activities, 1), 1)) * 100, 2),
            "details": {
                "teacherConflicts": teacher_conflicts,
                "studentConflicts": student_conflicts,
                "roomConflicts": room_conflicts,
                "capacityViolations": capacity_violations,
                "qualificationViolations": qualification_violations,
                "roomTypeViolations": room_type_violations
            }
        },
        "softConstraints": {
            "totalViolations": soft_violations,
            "satisfactionRate": round(max(0, 100 - (soft_violations / max(total_activities, 1)) * 10), 2),
            "details": {
                "workloadViolations": workload_violations,
                "consecutiveViolations": consecutive_violations,
                "scheduleGaps": gap_penalties,
                "lunchViolations": lunch_violations,
                "preferenceViolations": preference_violations,
                "researchDayViolations": research_day_violations
            }
        },
        "overallSatisfaction": round((1 - min((hard_violations * 10 + soft_violations) / max(total_activities * 10, 1), 1)) * 100, 2)
    }