from typing import Dict, Any, List
from collections import defaultdict

def generate_validation_suggestions(errors: List[str]) -> List[str]:
    """Generate helpful suggestions based on validation errors"""
    suggestions = []
    
    for error in errors:
        if "No qualified teacher found for subject:" in error:
            subject_name = error.split(":")[-1].strip()
            suggestions.append(f"Add '{subject_name}' to the 'subjectsCanTeach' array of qualified teachers")
        elif "No room large enough for" in error:
            suggestions.append("Consider adding larger capacity rooms or splitting large student groups into smaller sections")
        elif "Lab subjects found but no laboratory rooms available" in error:
            suggestions.append("Add rooms with type 'Laboratory' for lab subjects, or change lab subjects to theory")
        elif "Missing required section:" in error:
            section = error.split(":")[-1].strip()
            suggestions.append(f"Add the '{section}' section to your university data")
        else:
            suggestions.append("Please review and correct the data according to the error message")
    
    return suggestions

def perform_pre_generation_checks(university_data: Dict[str, Any]) -> Dict[str, Any]:
    """Perform comprehensive pre-generation checks"""
    critical_issues = []
    recommendations = []
    can_generate = True
    
    teachers = university_data.get("teachers", [])
    subjects = university_data.get("subjects", [])
    students = university_data.get("students", [])
    time_slots = university_data.get("timeSlots", [])
    working_days = university_data.get("basicInfo", {}).get("workingDays", [])
    
    # Check if we have enough data to generate anything
    if not teachers:
        critical_issues.append("No teachers defined - cannot generate timetable without faculty")
        can_generate = False
    
    if not subjects:
        critical_issues.append("No subjects defined - cannot generate timetable without courses")
        can_generate = False
        
    if not students:
        critical_issues.append("No student groups defined - cannot generate timetable without students")
        can_generate = False
        
    if not time_slots:
        critical_issues.append("No time slots defined - cannot generate timetable without time periods")
        can_generate = False
        
    if not working_days:
        critical_issues.append("No working days defined - cannot generate timetable without schedule days")
        can_generate = False
    
    # Check teacher qualifications
    total_required_hours = 0
    total_available_hours = 0
    total_time_slots = 0
    
    if can_generate:
        unqualified_subjects = []
        for subject in subjects:
            subject_name = subject.get("name", "")
            subject_code = subject.get("code", "")
            qualified_teachers = [
                t for t in teachers 
                if subject_name in t.get("subjectsCanTeach", []) or subject_code in t.get("subjectsCanTeach", [])
            ]
            if not qualified_teachers:
                unqualified_subjects.append(f"{subject_name} ({subject_code})")
        
        if unqualified_subjects:
            critical_issues.append(f"No qualified teachers for: {', '.join(unqualified_subjects)}")
            recommendations.append("Go to Teachers section and add subject names/codes to 'subjectsCanTeach' arrays")
            can_generate = False
        
        # Check workload feasibility
        for subject in subjects:
            hours_per_week = subject.get("hoursPerWeek", 3)
            enrolled_groups = len([sg for sg in students if subject["id"] in sg.get("subjects", [])])
            total_required_hours += hours_per_week * enrolled_groups
        
        total_available_hours = sum(teacher.get("maxHoursPerWeek", 20) for teacher in teachers)
        
        if total_required_hours > total_available_hours:
            critical_issues.append(f"Insufficient teacher capacity: need {total_required_hours}h/week, available {total_available_hours}h/week")
            recommendations.append("Either reduce course hours, add more teachers, or increase teacher working hours")
            can_generate = False
        
        # Check time slot capacity
        total_time_slots = len(time_slots) * len(working_days)
        if total_required_hours > total_time_slots * 0.9:  # 90% utilization threshold
            critical_issues.append("Time slot capacity nearly exceeded - high risk of scheduling conflicts")
            recommendations.append("Consider adding more time slots per day or additional working days")
    
    return {
        "canGenerate": can_generate,
        "criticalIssues": critical_issues,
        "recommendations": recommendations,
        "stats": {
            "totalRequiredHours": total_required_hours,
            "totalAvailableHours": total_available_hours,
            "totalTimeSlots": total_time_slots
        }
    }

def validate_enhanced_university_data(university_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enhanced validation with detailed analysis and recommendations
    """
    errors = []
    warnings = []
    recommendations = []
    
    # Basic structure validation
    required_sections = ["basicInfo", "teachers", "subjects", "rooms", "students", "timeSlots"]
    for section in required_sections:
        if section not in university_data:
            errors.append(f"Missing required section: {section}")
    
    if errors:
        return {
            "valid": False,
            "errors": errors,
            "warnings": warnings,
            "recommendations": recommendations
        }
    
    subjects = university_data.get("subjects", [])
    teachers = university_data.get("teachers", [])
    students = university_data.get("students", [])
    rooms = university_data.get("rooms", [])
    
    # Enhanced validation checks
    
    # 1. Teacher-Subject qualification analysis
    unqualified_subjects = []
    for subject in subjects:
        subject_name = subject.get("name", "")
        qualified_teachers = [t for t in teachers if subject_name in t.get("subjectsCanTeach", [])]
        if not qualified_teachers:
            unqualified_subjects.append(subject_name)
            errors.append(f"No qualified teacher found for subject: {subject_name}")
        elif len(qualified_teachers) == 1:
            warnings.append(f"Only one qualified teacher for subject: {subject_name}")
    
    # 2. Lab infrastructure analysis
    lab_subjects = [s for s in subjects if s.get("type") == "Lab"]
    lab_rooms = [r for r in rooms if r.get("type") == "Laboratory"]
    
    if lab_subjects and not lab_rooms:
        errors.append("Lab subjects found but no laboratory rooms available")
    elif lab_subjects and len(lab_rooms) < len(lab_subjects) // 2:
        warnings.append("Limited laboratory rooms relative to lab subjects")
    
    # 3. Capacity analysis
    capacity_issues = []
    for student_group in students:
        total_students = student_group.get("totalStudents", 0)
        batch = student_group.get("batch", "Unknown")
        
        suitable_rooms = [r for r in rooms if r.get("capacity", 0) >= total_students]
        if not suitable_rooms:
            capacity_issues.append(batch)
            errors.append(f"No room large enough for {batch} ({total_students} students)")
        elif len(suitable_rooms) < 3:
            warnings.append(f"Limited room options for {batch} ({total_students} students)")
    
    # 4. Workload analysis
    total_required_hours = 0
    for subject in subjects:
        hours_per_week = subject.get("hoursPerWeek", 3)
        enrolled_groups = len([sg for sg in students if subject["id"] in sg.get("subjects", [])])
        total_required_hours += hours_per_week * enrolled_groups
    
    total_available_hours = sum(teacher.get("maxHoursPerWeek", 20) for teacher in teachers)
    min_available_hours = sum(teacher.get("minHoursPerWeek", 0) for teacher in teachers)
    
    if total_required_hours > total_available_hours:
        errors.append(f"Insufficient teacher capacity: need {total_required_hours}h, available {total_available_hours}h")
    elif total_required_hours < min_available_hours:
        warnings.append(f"Teachers may be under-utilized: need {total_required_hours}h, minimum {min_available_hours}h")
    
    # 5. Generate recommendations
    if unqualified_subjects:
        recommendations.append(f"Consider hiring qualified teachers for: {', '.join(unqualified_subjects)}")
    
    if capacity_issues:
        recommendations.append(f"Consider larger rooms or split sections for: {', '.join(capacity_issues)}")
    
    if len(lab_rooms) < len(lab_subjects):
        recommendations.append("Consider adding more laboratory rooms or scheduling lab sessions carefully")
    
    # 6. Time slot analysis
    time_slots = university_data.get("timeSlots", [])
    working_days = university_data.get("basicInfo", {}).get("workingDays", [])
    total_time_slots = len(time_slots) * len(working_days)
    
    if total_required_hours > total_time_slots * 0.8:
        warnings.append("High time slot utilization - may lead to scheduling conflicts")
    
    # 7. Research day conflicts
    research_day_conflicts = []
    for teacher in teachers:
        research_days = teacher.get("researchDays", [])
        preferred_days = teacher.get("preferredDays", [])
        if research_days and preferred_days:
            overlap = set(research_days) & set(preferred_days)
            if overlap:
                research_day_conflicts.append(teacher.get("name", "Unknown"))
    
    if research_day_conflicts:
        warnings.append(f"Teachers with research day conflicts: {', '.join(research_day_conflicts)}")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "recommendations": recommendations,
        "statistics": {
            "teachers": len(teachers),
            "subjects": len(subjects),
            "rooms": len(rooms),
            "students": len(students),
            "labSubjects": len(lab_subjects),
            "labRooms": len(lab_rooms),
            "totalRequiredHours": total_required_hours,
            "totalAvailableHours": total_available_hours,
            "utilizationRate": round((total_required_hours / max(total_available_hours, 1)) * 100, 1),
            "timeSlotCapacity": total_time_slots
        },
        "feasibilityScore": round(max(0, 100 - len(errors) * 20 - len(warnings) * 5), 1)
    }