from typing import Dict, Any, List
from collections import defaultdict
import logging

class ConstraintChecker:
    """Handles all constraint checking and fitness calculation"""
    
    def __init__(self, ga_instance):
        self.ga = ga_instance
    
    def calculate_enhanced_fitness(self, chromosome: List[Dict[str, Any]]) -> float:
        """Enhanced fitness calculation with proper penalty weights"""
        penalty = 0
        
        # Hard Constraints (Must be zero for valid solution)
        penalty += self.check_teacher_conflicts(chromosome) * self.ga.penalty_weights["teacher_conflict"]
        penalty += self.check_student_conflicts(chromosome) * self.ga.penalty_weights["student_conflict"]
        penalty += self.check_room_conflicts(chromosome) * self.ga.penalty_weights["room_conflict"]
        penalty += self.check_room_capacity_violations(chromosome) * self.ga.penalty_weights["capacity_violation"]
        penalty += self.check_teacher_qualification_violations(chromosome) * self.ga.penalty_weights["qualification_violation"]
        penalty += self.check_room_type_violations(chromosome) * self.ga.penalty_weights["room_type_violation"]
        
        # Soft Constraints (Should be minimized)
        penalty += self.check_teacher_workload_violations(chromosome) * self.ga.penalty_weights["workload_violation"]
        penalty += self.check_consecutive_hours_violations(chromosome) * self.ga.penalty_weights["consecutive_violation"]
        penalty += self.check_schedule_gaps(chromosome) * self.ga.penalty_weights["gap_penalty"]
        penalty += self.check_lunch_break_violations(chromosome) * self.ga.penalty_weights["lunch_violation"]
        penalty += self.check_teacher_preference_violations(chromosome) * self.ga.penalty_weights["preference_violation"]
        penalty += self.check_research_day_violations(chromosome) * self.ga.penalty_weights["research_day_violation"]
        
        # Return fitness (higher is better, max possible is 100000)
        return max(0, 100000 - penalty)
    
    def check_teacher_conflicts(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check for teacher conflicts (same teacher, same time)"""
        conflicts = 0
        teacher_time_map = defaultdict(list)
        
        for activity in chromosome:
            key = (activity["teacherId"], activity["day"], activity["timeSlotId"])
            teacher_time_map[key].append(activity["activityId"])
        
        for activities in teacher_time_map.values():
            if len(activities) > 1:
                conflicts += len(activities) - 1  # Count extra assignments as conflicts
        
        return conflicts
    
    def check_student_conflicts(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check for student conflicts (same student group, same time)"""
        conflicts = 0
        student_time_map = defaultdict(list)
        
        for activity in chromosome:
            key = (activity["studentGroupId"], activity["day"], activity["timeSlotId"])
            student_time_map[key].append(activity["activityId"])
        
        for activities in student_time_map.values():
            if len(activities) > 1:
                conflicts += len(activities) - 1
        
        return conflicts
    
    def check_room_conflicts(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check for room conflicts (same room, same time)"""
        conflicts = 0
        room_time_map = defaultdict(list)
        
        for activity in chromosome:
            key = (activity["roomId"], activity["day"], activity["timeSlotId"])
            room_time_map[key].append(activity["activityId"])
        
        for activities in room_time_map.values():
            if len(activities) > 1:
                conflicts += len(activities) - 1
        
        return conflicts
    
    def check_room_capacity_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check room capacity violations"""
        violations = 0
        for activity in chromosome:
            room = self.ga.rooms_dict.get(activity["roomId"])
            if room and activity["studentCount"] > room.get("capacity", 0):
                violations += 1
        return violations
    
    def check_teacher_qualification_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check teacher qualification violations"""
        violations = 0
        for activity in chromosome:
            qualified_teachers = self.ga.get_qualified_teachers(activity["subjectName"])
            if activity["teacherId"] not in qualified_teachers:
                violations += 1
        return violations
    
    def check_room_type_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check room type violations (labs in non-lab rooms)"""
        violations = 0
        for activity in chromosome:
            room = self.ga.rooms_dict.get(activity["roomId"])
            if room:
                required_type = activity.get("requiredRoomType", "Classroom")
                room_type = room.get("type", "Classroom")
                
                # Lab subjects MUST be in Laboratory rooms
                if required_type == "Laboratory" and room_type != "Laboratory":
                    violations += 1
        return violations
    
    def check_teacher_workload_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check teacher workload violations"""
        violations = 0
        teacher_hours = defaultdict(int)
        
        for activity in chromosome:
            teacher_hours[activity["teacherId"]] += activity["duration"] // 60
        
        for teacher_id, hours in teacher_hours.items():
            teacher = self.ga.teachers_dict.get(teacher_id)
            if teacher:
                min_hours = teacher.get("minHoursPerWeek", 0)
                max_hours = teacher.get("maxHoursPerWeek", 40)
                
                if hours < min_hours:
                    violations += (min_hours - hours)
                elif hours > max_hours:
                    violations += (hours - max_hours) * 2  # Overload is worse
        
        return violations
    
    def check_consecutive_hours_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check for too many consecutive hours"""
        violations = 0
        teacher_day_schedule = defaultdict(list)
        
        for activity in chromosome:
            key = (activity["teacherId"], activity["day"])
            time_slot_id = activity["timeSlotId"]
            # Convert time slot ID to index for arithmetic operations
            if time_slot_id in self.ga.time_slot_indices:
                teacher_day_schedule[key].append(self.ga.time_slot_indices[time_slot_id])
        
        for (teacher_id, day), time_slot_indices in teacher_day_schedule.items():
            teacher = self.ga.teachers_dict.get(teacher_id)
            if teacher and time_slot_indices:
                max_consecutive = teacher.get("maxConsecutiveHours", 4)
                sorted_indices = sorted(time_slot_indices)
                
                consecutive_count = 1
                max_consecutive_found = 1
                
                for i in range(1, len(sorted_indices)):
                    if sorted_indices[i] == sorted_indices[i-1] + 1:
                        consecutive_count += 1
                        max_consecutive_found = max(max_consecutive_found, consecutive_count)
                    else:
                        consecutive_count = 1
                
                if max_consecutive_found > max_consecutive:
                    violations += (max_consecutive_found - max_consecutive)
        
        return violations
    
    def check_schedule_gaps(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check for large gaps in teacher schedules"""
        gap_penalty = 0
        teacher_day_schedule = defaultdict(list)
        
        for activity in chromosome:
            key = (activity["teacherId"], activity["day"])
            time_slot_id = activity["timeSlotId"]
            # Convert time slot ID to index for arithmetic operations
            if time_slot_id in self.ga.time_slot_indices:
                teacher_day_schedule[key].append(self.ga.time_slot_indices[time_slot_id])
        
        for (teacher_id, day), time_slot_indices in teacher_day_schedule.items():
            if len(time_slot_indices) > 1:
                sorted_indices = sorted(time_slot_indices)
                for i in range(1, len(sorted_indices)):
                    gap = sorted_indices[i] - sorted_indices[i-1] - 1
                    if gap > 1:  # Gap of more than 1 period
                        gap_penalty += gap
        
        return gap_penalty
    
    def check_lunch_break_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check lunch break violations"""
        violations = 0
        lunch_start = self.ga.university_data.get("basicInfo", {}).get("lunchBreakStart", "12:00")
        lunch_end = self.ga.university_data.get("basicInfo", {}).get("lunchBreakEnd", "13:00")
        
        for activity in chromosome:
            time_slot_id = activity["timeSlotId"]
            time_slot = self.ga.time_slots_dict.get(time_slot_id)
            if time_slot:
                start_time = time_slot.get("startTime", "")
                end_time = time_slot.get("endTime", "")
                # Check if this time slot overlaps with lunch break
                if (start_time >= lunch_start and start_time < lunch_end) or \
                   (end_time > lunch_start and end_time <= lunch_end):
                    violations += 1
        
        return violations
    
    def check_teacher_preference_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check teacher preference violations"""
        violations = 0
        for activity in chromosome:
            teacher = self.ga.teachers_dict.get(activity["teacherId"])
            if teacher:
                preferred_days = teacher.get("preferredDays", [])
                if preferred_days and activity["day"] not in preferred_days:
                    violations += 1
        return violations
    
    def check_research_day_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check research day violations"""
        violations = 0
        for activity in chromosome:
            teacher = self.ga.teachers_dict.get(activity["teacherId"])
            if teacher:
                research_days = teacher.get("researchDays", [])
                if activity["day"] in research_days:
                    violations += 2  # Higher penalty for research day violations
        return violations