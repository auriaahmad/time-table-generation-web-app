from typing import Dict, Any, List

def validate_university_data_structure(university_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate university data structure"""
    errors = []
    warnings = []
    
    # Check required sections
    required_sections = ["basicInfo", "teachers", "subjects", "rooms", "students", "timeSlots"]
    for section in required_sections:
        if section not in university_data:
            errors.append(f"Missing required section: {section}")
    
    if errors:
        return {"valid": False, "errors": errors, "warnings": warnings}
    
    # Validate teacher-subject relationships
    subjects = university_data.get("subjects", [])
    teachers = university_data.get("teachers", [])
    students = university_data.get("students", [])
    rooms = university_data.get("rooms", [])
    
    # Check if all subjects have qualified teachers
    for subject in subjects:
        subject_name = subject.get("name", "")
        subject_code = subject.get("code", "")
        qualified_teachers = []
        
        # Check both subject name and code
        for teacher in teachers:
            subjects_can_teach = teacher.get("subjectsCanTeach", [])
            if subject_name in subjects_can_teach or subject_code in subjects_can_teach:
                qualified_teachers.append(teacher)
        
        if not qualified_teachers:
            errors.append(f"No qualified teacher found for subject: {subject_name} ({subject_code})")
    
    # Check lab subjects have lab rooms
    lab_subjects = [s for s in subjects if s.get("type") == "Lab"]
    lab_rooms = [r for r in rooms if r.get("type") == "Laboratory"]
    
    if lab_subjects and not lab_rooms:
        errors.append("Lab subjects found but no laboratory rooms available")
    
    # Check room capacities
    for student_group in students:
        total_students = student_group.get("totalStudents", 0)
        suitable_rooms = [r for r in rooms if r.get("capacity", 0) >= total_students]
        if not suitable_rooms:
            errors.append(f"No room large enough for student group {student_group.get('batch', 'Unknown')} ({total_students} students)")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }