from typing import Dict, Any, List
from collections import defaultdict

def check_enhanced_conflicts(solution: List[Dict[str, Any]], ga_instance) -> List[Dict[str, Any]]:
    """Enhanced conflict detection with detailed reporting"""
    conflicts = []
    
    # Teacher conflicts
    teacher_time_map = defaultdict(list)
    for activity in solution:
        key = (activity["teacherId"], activity["day"], activity["timeSlotId"])
        teacher_time_map[key].append(activity)
    
    for (teacher_id, day, time_slot), activities in teacher_time_map.items():
        if len(activities) > 1:
            teacher_name = activities[0].get("teacherName", f"Teacher {teacher_id}")
            subjects = [a["subjectName"] for a in activities]
            conflicts.append({
                "type": "hard_constraint",
                "category": "teacher_conflict",
                "description": f"Teacher {teacher_name} has multiple classes scheduled",
                "details": f"Day: {day}, Time Slot: {time_slot}, Subjects: {', '.join(subjects)}",
                "severity": "critical",
                "affectedActivities": len(activities)
            })
    
    # Student conflicts
    student_time_map = defaultdict(list)
    for activity in solution:
        key = (activity["studentGroupId"], activity["day"], activity["timeSlotId"])
        student_time_map[key].append(activity)
    
    for (student_id, day, time_slot), activities in student_time_map.items():
        if len(activities) > 1:
            student_group = activities[0]["studentGroupName"]
            subjects = [a["subjectName"] for a in activities]
            conflicts.append({
                "type": "hard_constraint",
                "category": "student_conflict",
                "description": f"Student group {student_group} has multiple classes scheduled",
                "details": f"Day: {day}, Time Slot: {time_slot}, Subjects: {', '.join(subjects)}",
                "severity": "critical",
                "affectedActivities": len(activities)
            })
    
    # Room conflicts
    room_time_map = defaultdict(list)
    for activity in solution:
        key = (activity["roomId"], activity["day"], activity["timeSlotId"])
        room_time_map[key].append(activity)
    
    for (room_id, day, time_slot), activities in room_time_map.items():
        if len(activities) > 1:
            room_name = activities[0].get("roomName", f"Room {room_id}")
            subjects = [a["subjectName"] for a in activities]
            conflicts.append({
                "type": "hard_constraint",
                "category": "room_conflict",
                "description": f"Room {room_name} is double-booked",
                "details": f"Day: {day}, Time Slot: {time_slot}, Subjects: {', '.join(subjects)}",
                "severity": "critical",
                "affectedActivities": len(activities)
            })
    
    # Teacher qualification violations
    for activity in solution:
        qualified_teachers = ga_instance.get_qualified_teachers(activity["subjectName"])
        if activity["teacherId"] not in qualified_teachers:
            conflicts.append({
                "type": "hard_constraint",
                "category": "qualification_violation",
                "description": f"Teacher not qualified for subject",
                "details": f"Teacher: {activity.get('teacherName', 'Unknown')} assigned to teach {activity['subjectName']} but not qualified",
                "severity": "high",
                "affectedActivities": 1
            })
    
    # Room type violations
    for activity in solution:
        room = ga_instance.rooms_dict.get(activity["roomId"])
        if room:
            required_type = activity.get("requiredRoomType", "Classroom")
            room_type = room.get("type", "Classroom")
            
            if required_type == "Laboratory" and room_type != "Laboratory":
                conflicts.append({
                    "type": "hard_constraint",
                    "category": "room_type_violation",
                    "description": f"Lab subject scheduled in non-lab room",
                    "details": f"Subject: {activity['subjectName']} (requires {required_type}) assigned to {activity.get('roomName', 'Unknown')} (type: {room_type})",
                    "severity": "high",
                    "affectedActivities": 1
                })
    
    # Capacity violations
    for activity in solution:
        room = ga_instance.rooms_dict.get(activity["roomId"])
        if room and activity["studentCount"] > room.get("capacity", 0):
            conflicts.append({
                "type": "hard_constraint",
                "category": "capacity_violation",
                "description": f"Room capacity exceeded",
                "details": f"Room: {activity.get('roomName', 'Unknown')} (capacity: {room.get('capacity', 0)}) assigned {activity['studentCount']} students for {activity['subjectName']}",
                "severity": "medium",
                "affectedActivities": 1
            })
    
    # Workload violations
    teacher_hours = defaultdict(int)
    for activity in solution:
        teacher_hours[activity["teacherId"]] += activity["duration"] // 60
    
    for teacher_id, hours in teacher_hours.items():
        teacher = ga_instance.teachers_dict.get(teacher_id)
        if teacher:
            min_hours = teacher.get("minHoursPerWeek", 0)
            max_hours = teacher.get("maxHoursPerWeek", 40)
            teacher_name = teacher.get("name", f"Teacher {teacher_id}")
            
            if hours < min_hours:
                conflicts.append({
                    "type": "soft_constraint",
                    "category": "workload_violation",
                    "description": f"Teacher under-utilized",
                    "details": f"Teacher: {teacher_name} has {hours} hours/week (minimum: {min_hours})",
                    "severity": "low",
                    "affectedActivities": 0
                })
            elif hours > max_hours:
                conflicts.append({
                    "type": "soft_constraint",
                    "category": "workload_violation",
                    "description": f"Teacher overloaded",
                    "details": f"Teacher: {teacher_name} has {hours} hours/week (maximum: {max_hours})",
                    "severity": "medium",
                    "affectedActivities": 0
                })
    
    # Research day violations
    for activity in solution:
        teacher = ga_instance.teachers_dict.get(activity["teacherId"])
        if teacher:
            research_days = teacher.get("researchDays", [])
            if activity["day"] in research_days:
                conflicts.append({
                    "type": "soft_constraint",
                    "category": "research_day_violation",
                    "description": f"Teaching scheduled on research day",
                    "details": f"Teacher: {activity.get('teacherName', 'Unknown')} scheduled on research day {activity['day']} for {activity['subjectName']}",
                    "severity": "medium",
                    "affectedActivities": 1
                })
    
    # Lunch break violations
    lunch_start = ga_instance.university_data.get("basicInfo", {}).get("lunchBreakStart", "12:00")
    lunch_end = ga_instance.university_data.get("basicInfo", {}).get("lunchBreakEnd", "13:00")
    
    for activity in solution:
        time_slot_id = activity["timeSlotId"]
        time_slot = ga_instance.time_slots_dict.get(time_slot_id)
        if time_slot:
            start_time = time_slot.get("startTime", "")
            end_time = time_slot.get("endTime", "")
            # Check if this time slot overlaps with lunch break
            if (start_time >= lunch_start and start_time < lunch_end) or \
               (end_time > lunch_start and end_time <= lunch_end):
                conflicts.append({
                    "type": "soft_constraint",
                    "category": "lunch_violation",
                    "description": f"Class scheduled during lunch break",
                    "details": f"Subject: {activity['subjectName']}, Teacher: {activity.get('teacherName', 'Unknown')}, Day: {activity['day']}",
                    "severity": "low",
                    "affectedActivities": 1
                })
    
    return conflicts