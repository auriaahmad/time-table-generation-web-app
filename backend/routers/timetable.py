from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List, Tuple, Optional, Set
import time
import random
import copy
from datetime import datetime
from collections import defaultdict
import logging
from utils.data_validator import validate_university_data_structure

router = APIRouter()

# Enhanced Genetic Algorithm Implementation with Better Resource Allocation
class EnhancedTimetableGA:
    def __init__(self, university_data: Dict[str, Any]):
        self.university_data = university_data
        self.teachers = university_data.get("teachers", [])
        self.subjects = university_data.get("subjects", [])
        self.rooms = university_data.get("rooms", [])
        self.students = university_data.get("students", [])
        self.time_slots = university_data.get("timeSlots", [])
        self.working_days = university_data.get("basicInfo", {}).get("workingDays", [])
        self.constraints = university_data.get("constraints", {})
        
        # Create lookup dictionaries for faster access
        self.teachers_dict = {t["id"]: t for t in self.teachers}
        self.subjects_dict = {s["id"]: s for s in self.subjects}
        self.rooms_dict = {r["id"]: r for r in self.rooms}
        self.time_slots_dict = {ts["id"]: ts for ts in self.time_slots}
        
        # Generate activities from the data
        self.activities = self.generate_activities()
        
        # Enhanced GA Parameters from config or defaults
        algorithm_settings = university_data.get("algorithmSettings", {})
        self.population_size = algorithm_settings.get("populationSize", 60)
        self.generations = algorithm_settings.get("generations", 150)
        self.mutation_rate = algorithm_settings.get("mutationRate", 0.12)
        self.crossover_rate = algorithm_settings.get("crossoverRate", 0.85)
        self.elite_size = algorithm_settings.get("eliteSize", 6)
        self.tournament_size = algorithm_settings.get("tournamentSize", 4)
        self.convergence_threshold = algorithm_settings.get("convergenceThreshold", 0.95)
        self.max_stagnation_generations = algorithm_settings.get("maxStagnationGenerations", 20)
        
        # Penalty weights from constraints
        hard_penalties = self.constraints.get("hard", {}).get("penaltyWeights", {})
        soft_penalties = self.constraints.get("soft", {}).get("penaltyWeights", {})
        
        self.penalty_weights = {
            # Hard constraint penalties (very high)
            "teacher_conflict": hard_penalties.get("teacherConflict", 50000),
            "student_conflict": hard_penalties.get("studentConflict", 50000),
            "room_conflict": hard_penalties.get("roomConflict", 50000),
            "capacity_violation": hard_penalties.get("capacityViolation", 25000),
            "qualification_violation": hard_penalties.get("qualificationViolation", 30000),
            "room_type_violation": hard_penalties.get("roomTypeViolation", 35000),
            
            # Soft constraint penalties (lower)
            "workload_violation": soft_penalties.get("workloadViolation", 100),
            "consecutive_violation": soft_penalties.get("consecutiveViolation", 50),
            "gap_penalty": soft_penalties.get("gapPenalty", 30),
            "lunch_violation": soft_penalties.get("lunchViolation", 40),
            "preference_violation": soft_penalties.get("preferenceViolation", 20),
            "research_day_violation": soft_penalties.get("researchDayViolation", 80)
        }
        
        # Pre-compute qualified teacher mappings for efficiency
        self.subject_teacher_map = self.build_subject_teacher_mapping()
        self.room_type_map = self.build_room_type_mapping()
        
        logging.info(f"Enhanced GA initialized with {len(self.activities)} activities")
        
    def generate_activities(self) -> List[Dict[str, Any]]:
        """Generate all required activities from student enrollments with better structure"""
        activities = []
        activity_id = 1
        
        for student_group in self.students:
            batch_name = f"{student_group['batch']} Section {student_group.get('section', 'A')}"
            
            for subject_id in student_group.get("subjects", []):
                subject = self.subjects_dict.get(subject_id)
                if not subject:
                    logging.warning(f"Subject {subject_id} not found for student group {batch_name}")
                    continue
                
                hours_per_week = subject.get("hoursPerWeek", 3)
                duration = subject.get("duration", 60)
                subject_type = subject.get("type", "Theory")
                
                # Calculate sessions needed
                if subject_type == "Lab" and duration > 60:
                    sessions_needed = 1  # One long lab session
                else:
                    sessions_needed = hours_per_week  # Regular theory sessions
                
                # Create activities for each session
                for session in range(sessions_needed):
                    activity = {
                        "activityId": activity_id,
                        "subjectId": subject_id,
                        "subjectName": subject["name"],
                        "subjectCode": subject.get("code", ""),
                        "subjectType": subject_type,
                        "duration": duration,
                        "studentGroupId": student_group["id"],
                        "studentGroupName": batch_name,
                        "studentCount": student_group["totalStudents"],
                        "department": subject.get("department", ""),
                        "requiredRoomType": subject.get("requiredRoomType", "Classroom"),
                        "equipmentRequired": subject.get("equipmentRequired", []),
                        "sessionNumber": session + 1,
                        "totalSessions": sessions_needed,
                        # These will be assigned by GA
                        "teacherId": None,
                        "roomId": None,
                        "day": None,
                        "timeSlotId": None,
                        "period": None
                    }
                    activities.append(activity)
                    activity_id += 1
        
        return activities
    
    def build_subject_teacher_mapping(self) -> Dict[str, List[int]]:
        """Build a mapping of subject names to qualified teacher IDs"""
        mapping = defaultdict(list)
        
        # Create a mapping from subject codes to subject names
        code_to_name = {}
        name_to_code = {}
        for subject in self.subjects:
            name = subject.get("name", "")
            code = subject.get("code", "")
            if name and code:
                code_to_name[code] = name
                name_to_code[name] = code
        
        for teacher in self.teachers:
            for subject_ref in teacher.get("subjectsCanTeach", []):
                # Add mapping for the reference itself
                mapping[subject_ref].append(teacher["id"])
                
                # If it's a code, also add mapping for the name
                if subject_ref in code_to_name:
                    subject_name = code_to_name[subject_ref]
                    mapping[subject_name].append(teacher["id"])
                
                # If it's a name, also add mapping for the code
                if subject_ref in name_to_code:
                    subject_code = name_to_code[subject_ref]
                    mapping[subject_code].append(teacher["id"])
        
        return dict(mapping)
    
    def build_room_type_mapping(self) -> Dict[str, List[int]]:
        """Build a mapping of room types to room IDs"""
        mapping = defaultdict(list)
        for room in self.rooms:
            room_type = room.get("type", "Classroom")
            mapping[room_type].append(room["id"])
            
            # Add cross-compatibility
            if room_type == "Auditorium":
                mapping["Classroom"].append(room["id"])  # Auditorium can be used as classroom
            elif room_type == "Classroom":
                mapping["Theory"].append(room["id"])  # Classroom good for theory
        
        return dict(mapping)
    
    def get_qualified_teachers(self, subject_name: str) -> List[int]:
        """Get teachers qualified to teach a specific subject - STRICT VERSION"""
        qualified_ids = self.subject_teacher_map.get(subject_name, [])
        if not qualified_ids:
            logging.error(f"No qualified teacher found for subject: {subject_name}")
            # Instead of fallback, raise an error or return empty list
            return []
        return qualified_ids
    
    def get_suitable_rooms(self, room_type: str, student_count: int) -> List[int]:
        """Get rooms suitable for a specific type and capacity - STRICT VERSION"""
        # Get rooms of correct type
        if room_type == "Laboratory":
            candidate_rooms = self.room_type_map.get("Laboratory", [])
        else:
            # For non-lab requirements, allow classroom, auditorium, seminar room
            candidate_rooms = []
            for rt in ["Classroom", "Auditorium", "Seminar Room"]:
                candidate_rooms.extend(self.room_type_map.get(rt, []))
        
        # Filter by capacity
        suitable_rooms = []
        for room_id in candidate_rooms:
            room = self.rooms_dict.get(room_id)
            if room and room.get("capacity", 0) >= student_count:
                suitable_rooms.append(room_id)
        
        if not suitable_rooms:
            logging.warning(f"No suitable rooms found for type: {room_type}, capacity: {student_count}")
        
        return suitable_rooms
    
    def validate_assignment(self, activity: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate if an assignment is feasible"""
        errors = []
        
        # Check teacher qualification
        teacher_id = activity.get("teacherId")
        if teacher_id:
            qualified_teachers = self.get_qualified_teachers(activity["subjectName"])
            if teacher_id not in qualified_teachers:
                errors.append(f"Teacher {teacher_id} not qualified for {activity['subjectName']}")
        
        # Check room suitability
        room_id = activity.get("roomId")
        if room_id:
            suitable_rooms = self.get_suitable_rooms(
                activity["requiredRoomType"], 
                activity["studentCount"]
            )
            if room_id not in suitable_rooms:
                errors.append(f"Room {room_id} not suitable for {activity['subjectName']}")
        
        # Check teacher availability
        if teacher_id:
            teacher = self.teachers_dict.get(teacher_id)
            if teacher:
                research_days = teacher.get("researchDays", [])
                if activity.get("day") in research_days:
                    errors.append(f"Teacher {teacher_id} not available on {activity['day']} (research day)")
        
        return len(errors) == 0, errors
    
    def create_smart_chromosome(self) -> List[Dict[str, Any]]:
        """Create a smarter initial chromosome with better resource allocation"""
        chromosome = []
        
        # Track usage to avoid conflicts
        teacher_schedule = defaultdict(set)  # (teacher_id, day, time_slot)
        room_schedule = defaultdict(set)     # (room_id, day, time_slot)
        student_schedule = defaultdict(set)  # (student_group_id, day, time_slot)
        
        # Sort activities by constraint difficulty (labs first, then theory)
        sorted_activities = sorted(self.activities, 
                                 key=lambda x: (x["subjectType"] != "Lab", x["studentCount"]))
        
        for activity in sorted_activities:
            attempts = 0
            max_attempts = 50
            assigned = False
            
            while attempts < max_attempts and not assigned:
                attempts += 1
                
                # Get qualified teachers
                qualified_teachers = self.get_qualified_teachers(activity["subjectName"])
                if not qualified_teachers:
                    logging.error(f"No qualified teachers for {activity['subjectName']}")
                    break
                
                # Get suitable rooms
                suitable_rooms = self.get_suitable_rooms(
                    activity["requiredRoomType"], 
                    activity["studentCount"]
                )
                if not suitable_rooms:
                    logging.error(f"No suitable rooms for {activity['subjectName']}")
                    break
                
                # Try to find available slot
                teacher_id = random.choice(qualified_teachers)
                room_id = random.choice(suitable_rooms)
                day = random.choice(self.working_days)
                time_slot = random.choice(self.time_slots)["id"]
                
                # Check for conflicts
                teacher_key = (teacher_id, day, time_slot)
                room_key = (room_id, day, time_slot)
                student_key = (activity["studentGroupId"], day, time_slot)
                
                if (teacher_key not in teacher_schedule and 
                    room_key not in room_schedule and 
                    student_key not in student_schedule):
                    
                    # Check teacher preferences
                    teacher = self.teachers_dict[teacher_id]
                    research_days = teacher.get("researchDays", [])
                    
                    # Avoid research days if possible (but allow if no other option)
                    if day in research_days and attempts < max_attempts // 2:
                        continue
                    
                    # Assign the activity
                    assigned_activity = copy.deepcopy(activity)
                    assigned_activity.update({
                        "teacherId": teacher_id,
                        "teacherName": teacher["name"],
                        "roomId": room_id,
                        "roomName": self.rooms_dict[room_id]["name"],
                        "day": day,
                        "timeSlotId": time_slot,
                        "period": time_slot
                    })
                    
                    # Add to schedules
                    teacher_schedule[teacher_id].add((day, time_slot))
                    room_schedule[room_id].add((day, time_slot))
                    student_schedule[activity["studentGroupId"]].add((day, time_slot))
                    
                    chromosome.append(assigned_activity)
                    assigned = True
            
            if not assigned:
                # Fallback assignment (may cause conflicts but allows algorithm to continue)
                logging.warning(f"Could not find conflict-free assignment for {activity['subjectName']}")
                assigned_activity = copy.deepcopy(activity)
                
                # Assign teacher
                teacher_id = random.choice(qualified_teachers) if qualified_teachers else self.teachers[0]["id"]
                teacher = self.teachers_dict[teacher_id]
                
                # Assign room  
                room_id = random.choice(suitable_rooms) if suitable_rooms else self.rooms[0]["id"]
                room = self.rooms_dict[room_id]
                
                # Assign time slot
                time_slot = random.choice(self.time_slots)["id"]
                
                assigned_activity.update({
                    "teacherId": teacher_id,
                    "teacherName": teacher["name"],
                    "roomId": room_id,
                    "roomName": room["name"],
                    "day": random.choice(self.working_days),
                    "timeSlotId": time_slot,
                    "period": time_slot
                })
                chromosome.append(assigned_activity)
        
        return chromosome
    
    def calculate_enhanced_fitness(self, chromosome: List[Dict[str, Any]]) -> float:
        """Enhanced fitness calculation with proper penalty weights"""
        penalty = 0
        
        # Hard Constraints (Must be zero for valid solution)
        penalty += self.check_teacher_conflicts(chromosome) * self.penalty_weights["teacher_conflict"]
        penalty += self.check_student_conflicts(chromosome) * self.penalty_weights["student_conflict"]
        penalty += self.check_room_conflicts(chromosome) * self.penalty_weights["room_conflict"]
        penalty += self.check_room_capacity_violations(chromosome) * self.penalty_weights["capacity_violation"]
        penalty += self.check_teacher_qualification_violations(chromosome) * self.penalty_weights["qualification_violation"]
        penalty += self.check_room_type_violations(chromosome) * self.penalty_weights["room_type_violation"]
        
        # Soft Constraints (Should be minimized)
        penalty += self.check_teacher_workload_violations(chromosome) * self.penalty_weights["workload_violation"]
        penalty += self.check_consecutive_hours_violations(chromosome) * self.penalty_weights["consecutive_violation"]
        penalty += self.check_schedule_gaps(chromosome) * self.penalty_weights["gap_penalty"]
        penalty += self.check_lunch_break_violations(chromosome) * self.penalty_weights["lunch_violation"]
        penalty += self.check_teacher_preference_violations(chromosome) * self.penalty_weights["preference_violation"]
        penalty += self.check_research_day_violations(chromosome) * self.penalty_weights["research_day_violation"]
        
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
            room = self.rooms_dict.get(activity["roomId"])
            if room and activity["studentCount"] > room.get("capacity", 0):
                violations += 1
        return violations
    
    def check_teacher_qualification_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check teacher qualification violations"""
        violations = 0
        for activity in chromosome:
            qualified_teachers = self.get_qualified_teachers(activity["subjectName"])
            if activity["teacherId"] not in qualified_teachers:
                violations += 1
        return violations
    
    def check_room_type_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check room type violations (labs in non-lab rooms)"""
        violations = 0
        for activity in chromosome:
            room = self.rooms_dict.get(activity["roomId"])
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
            teacher = self.teachers_dict.get(teacher_id)
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
            teacher_day_schedule[key].append(activity["timeSlotId"])
        
        for (teacher_id, day), time_slots in teacher_day_schedule.items():
            teacher = self.teachers_dict.get(teacher_id)
            if teacher:
                max_consecutive = teacher.get("maxConsecutiveHours", 4)
                sorted_slots = sorted(time_slots)
                
                consecutive_count = 1
                max_consecutive_found = 1
                
                for i in range(1, len(sorted_slots)):
                    if sorted_slots[i] == sorted_slots[i-1] + 1:
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
            teacher_day_schedule[key].append(activity["timeSlotId"])
        
        for (teacher_id, day), time_slots in teacher_day_schedule.items():
            if len(time_slots) > 1:
                sorted_slots = sorted(time_slots)
                for i in range(1, len(sorted_slots)):
                    gap = sorted_slots[i] - sorted_slots[i-1] - 1
                    if gap > 1:  # Gap of more than 1 period
                        gap_penalty += gap
        
        return gap_penalty
    
    def check_lunch_break_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check lunch break violations"""
        violations = 0
        lunch_slot = 5  # Assuming slot 5 is lunch time (13:00-14:00)
        
        for activity in chromosome:
            if activity["timeSlotId"] == lunch_slot:
                violations += 1
        
        return violations
    
    def check_teacher_preference_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check teacher preference violations"""
        violations = 0
        for activity in chromosome:
            teacher = self.teachers_dict.get(activity["teacherId"])
            if teacher:
                preferred_days = teacher.get("preferredDays", [])
                if preferred_days and activity["day"] not in preferred_days:
                    violations += 1
        return violations
    
    def check_research_day_violations(self, chromosome: List[Dict[str, Any]]) -> int:
        """Check research day violations"""
        violations = 0
        for activity in chromosome:
            teacher = self.teachers_dict.get(activity["teacherId"])
            if teacher:
                research_days = teacher.get("researchDays", [])
                if activity["day"] in research_days:
                    violations += 2  # Higher penalty for research day violations
        return violations
    
    def tournament_selection(self, population: List[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """Enhanced tournament selection"""
        tournament = random.sample(population, min(self.tournament_size, len(population)))
        return max(tournament, key=self.calculate_enhanced_fitness)
    
    def smart_crossover(self, parent1: List[Dict[str, Any]], parent2: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Smart crossover that preserves good assignments"""
        if random.random() > self.crossover_rate:
            return parent1.copy()
        
        # Calculate fitness for each activity in both parents
        child = []
        
        for i in range(len(parent1)):
            if i < len(parent2):
                # Choose better assignment from either parent
                act1, act2 = parent1[i], parent2[i]
                
                # Simple heuristic: prefer assignments with fewer violations
                valid1, _ = self.validate_assignment(act1)
                valid2, _ = self.validate_assignment(act2)
                
                if valid1 and not valid2:
                    child.append(copy.deepcopy(act1))
                elif valid2 and not valid1:
                    child.append(copy.deepcopy(act2))
                else:
                    # Both valid or both invalid, choose randomly
                    child.append(copy.deepcopy(random.choice([act1, act2])))
            else:
                child.append(copy.deepcopy(parent1[i]))
        
        return child
    
    def smart_mutate(self, chromosome: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Smart mutation that respects constraints"""
        mutated = copy.deepcopy(chromosome)
        
        for activity in mutated:
            if random.random() < self.mutation_rate:
                mutation_type = random.choice(['teacher', 'room', 'time', 'day'])
                
                if mutation_type == 'teacher':
                    qualified_teachers = self.get_qualified_teachers(activity["subjectName"])
                    if qualified_teachers:
                        new_teacher_id = random.choice(qualified_teachers)
                        new_teacher = self.teachers_dict[new_teacher_id]
                        activity["teacherId"] = new_teacher_id
                        activity["teacherName"] = new_teacher["name"]
                
                elif mutation_type == 'room':
                    suitable_rooms = self.get_suitable_rooms(
                        activity["requiredRoomType"], 
                        activity["studentCount"]
                    )
                    if suitable_rooms:
                        new_room_id = random.choice(suitable_rooms)
                        new_room = self.rooms_dict[new_room_id]
                        activity["roomId"] = new_room_id
                        activity["roomName"] = new_room["name"]
                
                elif mutation_type == 'time':
                    new_slot = random.choice(self.time_slots)
                    activity["timeSlotId"] = new_slot["id"]
                    activity["period"] = new_slot["id"]
                
                elif mutation_type == 'day':
                    # Avoid research days if possible
                    teacher = self.teachers_dict.get(activity["teacherId"])
                    if teacher:
                        research_days = teacher.get("researchDays", [])
                        available_days = [d for d in self.working_days if d not in research_days]
                        if available_days:
                            activity["day"] = random.choice(available_days)
                        else:
                            activity["day"] = random.choice(self.working_days)
                    else:
                        activity["day"] = random.choice(self.working_days)
        
        return mutated
    
    def solve(self) -> Tuple[List[Dict[str, Any]], float, Dict[str, Any]]:
        """Enhanced GA algorithm with better convergence"""
        start_time = time.time()
        
        # Initialize population with smart chromosomes
        population = []
        for _ in range(self.population_size):
            population.append(self.create_smart_chromosome())
        
        best_fitness = 0
        best_solution = None
        generation_count = 0
        stagnation_counter = 0
        fitness_history = []
        
        logging.info(f"Starting GA with population size: {self.population_size}")
        
        for generation in range(self.generations):
            generation_count = generation + 1
            
            # Calculate fitness for all chromosomes
            fitness_scores = [self.calculate_enhanced_fitness(chrom) for chrom in population]
            
            # Track best solution
            current_best_idx = fitness_scores.index(max(fitness_scores))
            current_best_fitness = fitness_scores[current_best_idx]
            
            fitness_history.append(current_best_fitness)
            
            if current_best_fitness > best_fitness:
                best_fitness = current_best_fitness
                best_solution = copy.deepcopy(population[current_best_idx])
                stagnation_counter = 0
                logging.info(f"Generation {generation_count}: New best fitness = {best_fitness}")
            else:
                stagnation_counter += 1
            
            # Early stopping conditions
            if best_fitness >= 99000:  # Near-perfect solution
                logging.info(f"Near-perfect solution found at generation {generation_count}")
                break
            
            if stagnation_counter >= self.max_stagnation_generations:
                logging.info(f"Stagnation detected at generation {generation_count}")
                break
            
            # Selection and reproduction
            new_population = []
            
            # Elitism: keep best solutions
            elite_indices = sorted(range(len(fitness_scores)), 
                                 key=lambda i: fitness_scores[i], reverse=True)[:self.elite_size]
            for idx in elite_indices:
                new_population.append(copy.deepcopy(population[idx]))
            
            # Generate offspring
            while len(new_population) < self.population_size:
                parent1 = self.tournament_selection(population)
                parent2 = self.tournament_selection(population)
                child = self.smart_crossover(parent1, parent2)
                child = self.smart_mutate(child)
                new_population.append(child)
            
            population = new_population
        
        execution_time = time.time() - start_time
        
        stats = {
            "generationsRun": generation_count,
            "finalFitness": best_fitness,
            "populationSize": self.population_size,
            "totalActivities": len(self.activities),
            "executionTime": execution_time,
            "stagnationGenerations": stagnation_counter,
            "fitnessHistory": fitness_history[-10:],  # Last 10 generations
            "convergenceAchieved": best_fitness >= 95000
        }
        
        logging.info(f"GA completed in {execution_time:.2f} seconds with fitness {best_fitness}")
        
        return best_solution, best_fitness, stats

# Enhanced API endpoints
@router.post("/generate-timetable")
async def generate_enhanced_timetable(request_data: Dict[str, Any]):
    """
    Generate university timetable using Enhanced Genetic Algorithm
    """
    try:
        start_time = time.time()
        
        # Extract university data
        university_data = request_data.get("universityData", {})
        algorithm_settings = request_data.get("algorithmSettings", {})
        
        # Basic validation
        if not university_data:
            raise HTTPException(status_code=400, detail="University data is required")
        
        # Validate data structure
        validation_result = validate_university_data_structure(university_data)
        if not validation_result["valid"]:
            raise HTTPException(status_code=400, detail=f"Data validation failed: {validation_result['errors']}")
        
        # Create enhanced GA instance
        ga = EnhancedTimetableGA(university_data)
        
        # Override GA parameters if provided in request
        if algorithm_settings:
            ga.population_size = algorithm_settings.get("populationSize", ga.population_size)
            ga.generations = algorithm_settings.get("generations", ga.generations)
            ga.mutation_rate = algorithm_settings.get("mutationRate", ga.mutation_rate)
            ga.crossover_rate = algorithm_settings.get("crossoverRate", ga.crossover_rate)
            ga.elite_size = algorithm_settings.get("eliteSize", ga.elite_size)
        
        # Run enhanced GA algorithm
        best_solution, best_fitness, algorithm_stats = ga.solve()
        
        if not best_solution:
            raise HTTPException(status_code=500, detail="Failed to generate a valid timetable")
        
        # Format timetable for response
        formatted_timetable = format_enhanced_timetable(best_solution, university_data)
        
        execution_time = time.time() - start_time
        
        # Calculate enhanced statistics
        teacher_utilization = calculate_enhanced_teacher_utilization(best_solution, university_data)
        room_utilization = calculate_enhanced_room_utilization(best_solution, university_data)
        
        # Check for conflicts with detailed reporting
        conflicts = check_enhanced_conflicts(best_solution, ga)
        
        # Calculate constraint satisfaction metrics
        constraint_metrics = calculate_constraint_satisfaction(best_solution, ga)
        
        response = {
            "success": True,
            "message": "Timetable generated successfully using Enhanced Genetic Algorithm",
            "executionTime": f"{execution_time:.2f} seconds",
            "algorithmStats": {
                **algorithm_stats,
                "algorithm": "Enhanced Genetic Algorithm v2.0",
                "constraintViolations": len([c for c in conflicts if c["type"] == "hard_constraint"])
            },
            "timetable": formatted_timetable,
            "conflicts": conflicts,
            "constraintMetrics": constraint_metrics,
            "statistics": {
                "teacherUtilization": teacher_utilization,
                "roomUtilization": room_utilization,
                "totalActivities": len(best_solution),
                "totalTimeSlots": len(university_data.get("timeSlots", [])) * len(university_data.get("basicInfo", {}).get("workingDays", [])),
                "utilizationPercentage": round((len(best_solution) / max(1, len(university_data.get("timeSlots", [])) * len(university_data.get("basicInfo", {}).get("workingDays", [])))) * 100, 1),
                "qualityScore": round((best_fitness / 100000) * 100, 2)
            },
            "generatedAt": datetime.now().isoformat()
        }
        
        return response
        
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        logging.error(f"Timetable generation error: {str(e)}")
        logging.error(f"Full traceback: {error_traceback}")
        raise HTTPException(status_code=500, detail=f"Timetable generation failed: {str(e)}")


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

def calculate_constraint_satisfaction(solution: List[Dict[str, Any]], ga: EnhancedTimetableGA) -> Dict[str, Any]:
    """Calculate constraint satisfaction metrics"""
    
    total_activities = len(solution)
    
    # Hard constraint violations
    teacher_conflicts = ga.check_teacher_conflicts(solution)
    student_conflicts = ga.check_student_conflicts(solution)
    room_conflicts = ga.check_room_conflicts(solution)
    capacity_violations = ga.check_room_capacity_violations(solution)
    qualification_violations = ga.check_teacher_qualification_violations(solution)
    room_type_violations = ga.check_room_type_violations(solution)
    
    # Soft constraint violations
    workload_violations = ga.check_teacher_workload_violations(solution)
    consecutive_violations = ga.check_consecutive_hours_violations(solution)
    gap_penalties = ga.check_schedule_gaps(solution)
    lunch_violations = ga.check_lunch_break_violations(solution)
    preference_violations = ga.check_teacher_preference_violations(solution)
    research_day_violations = ga.check_research_day_violations(solution)
    
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

def check_enhanced_conflicts(solution: List[Dict[str, Any]], ga: EnhancedTimetableGA) -> List[Dict[str, Any]]:
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
        qualified_teachers = ga.get_qualified_teachers(activity["subjectName"])
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
        room = ga.rooms_dict.get(activity["roomId"])
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
        room = ga.rooms_dict.get(activity["roomId"])
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
        teacher = ga.teachers_dict.get(teacher_id)
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
        teacher = ga.teachers_dict.get(activity["teacherId"])
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
    lunch_slot = 5  # Assuming slot 5 is lunch time
    for activity in solution:
        if activity["timeSlotId"] == lunch_slot:
            conflicts.append({
                "type": "soft_constraint",
                "category": "lunch_violation",
                "description": f"Class scheduled during lunch break",
                "details": f"Subject: {activity['subjectName']}, Teacher: {activity.get('teacherName', 'Unknown')}, Day: {activity['day']}",
                "severity": "low",
                "affectedActivities": 1
            })
    
    return conflicts

@router.post("/validate-enhanced-data")
async def validate_enhanced_university_data(request_data: Dict[str, Any]):
    """
    Enhanced validation with detailed analysis and recommendations
    """
    try:
        university_data = request_data.get("universityData", request_data)
        
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
        
    except Exception as e:
        logging.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")

@router.get("/algorithm-settings-enhanced")
async def get_enhanced_algorithm_settings():
    """
    Get enhanced algorithm settings with optimization recommendations
    """
    return {
        "settings": {
            "populationSize": {
                "description": "Number of chromosomes in each generation",
                "default": 60,
                "recommended": 60,
                "min": 30,
                "max": 200,
                "type": "integer",
                "impact": "Higher values improve solution quality but increase runtime"
            },
            "generations": {
                "description": "Maximum number of generations to run",
                "default": 150,
                "recommended": 150,
                "min": 50,
                "max": 500,
                "type": "integer",
                "impact": "More generations allow better convergence but take longer"
            },
            "mutationRate": {
                "description": "Probability of mutation for each gene",
                "default": 0.12,
                "recommended": 0.12,
                "min": 0.05,
                "max": 0.25,
                "type": "float",
                "impact": "Higher values increase exploration but may reduce convergence"
            },
            "crossoverRate": {
                "description": "Probability of crossover between parents",
                "default": 0.85,
                "recommended": 0.85,
                "min": 0.6,
                "max": 0.95,
                "type": "float",
                "impact": "Higher values promote information sharing between solutions"
            },
            "eliteSize": {
                "description": "Number of best chromosomes to preserve each generation",
                "default": 6,
                "recommended": 6,
                "min": 2,
                "max": 15,
                "type": "integer",
                "impact": "Higher values preserve good solutions but reduce diversity"
            },
            "tournamentSize": {
                "description": "Number of individuals in tournament selection",
                "default": 4,
                "recommended": 4,
                "min": 2,
                "max": 8,
                "type": "integer",
                "impact": "Higher values increase selection pressure"
            }
        },
        "presets": {
            "fast": {
                "populationSize": 40,
                "generations": 75,
                "mutationRate": 0.15,
                "crossoverRate": 0.8,
                "eliteSize": 4,
                "description": "Quick generation with acceptable quality (1-2 minutes)"
            },
            "balanced": {
                "populationSize": 60,
                "generations": 150,
                "mutationRate": 0.12,
                "crossoverRate": 0.85,
                "eliteSize": 6,
                "description": "Good balance of speed and quality (2-4 minutes)"
            },
            "quality": {
                "populationSize": 100,
                "generations": 250,
                "mutationRate": 0.1,
                "crossoverRate": 0.9,
                "eliteSize": 8,
                "description": "High quality results (5-10 minutes)"
            },
            "intensive": {
                "populationSize": 150,
                "generations": 400,
                "mutationRate": 0.08,
                "crossoverRate": 0.9,
                "eliteSize": 10,
                "description": "Maximum quality for complex scenarios (10-20 minutes)"
            }
        },
        "constraintWeights": {
            "hardConstraints": {
                "teacherConflict": 50000,
                "studentConflict": 50000,
                "roomConflict": 50000,
                "capacityViolation": 25000,
                "qualificationViolation": 30000,
                "roomTypeViolation": 35000
            },
            "softConstraints": {
                "workloadViolation": 100,
                "consecutiveViolation": 50,
                "gapPenalty": 30,
                "lunchViolation": 40,
                "preferenceViolation": 20,
                "researchDayViolation": 80
            }
        },
        "performance": {
            "dataSize": "Medium (30-50 activities)",
            "estimatedRuntime": "2-5 minutes",
            "successRate": "95-98%",
            "recommendedPreset": "balanced",
            "qualityMetrics": {
                "excellent": "> 95% constraint satisfaction",
                "good": "85-95% constraint satisfaction",
                "acceptable": "70-85% constraint satisfaction"
            }
        }
    }

@router.get("/status-enhanced")
async def get_enhanced_api_status():
    """
    Get enhanced API status with detailed capabilities
    """
    return {
        "status": "operational",
        "version": "2.1.0",
        "algorithm": {
            "name": "Enhanced Genetic Algorithm",
            "version": "2.0",
            "improvements": [
                "Smart initial population generation",
                "Enhanced constraint handling",
                "Improved resource allocation logic",
                "Better convergence detection",
                "Detailed conflict analysis"
            ],
            "operators": [
                "tournament_selection",
                "smart_crossover",
                "intelligent_mutation",
                "elitist_replacement"
            ]
        },
        "constraints": {
            "hard": [
                "teacher_conflicts",
                "student_conflicts", 
                "room_conflicts",
                "capacity_violations",
                "qualification_requirements",
                "room_type_matching"
            ],
            "soft": [
                "teacher_workload_balance",
                "consecutive_hours_limit",
                "schedule_gap_minimization",
                "lunch_break_respect",
                "teacher_preferences",
                "research_day_protection"
            ]
        },
        "features": {
            "resource_allocation": "enhanced with strict validation",
            "conflict_detection": "comprehensive with detailed reporting",
            "utilization_analysis": "detailed teacher and room metrics",
            "constraint_satisfaction": "quantified with satisfaction rates",
            "data_validation": "enhanced with recommendations",
            "performance_optimization": "adaptive parameters with presets"
        },
        "quality_assurance": {
            "constraint_validation": "pre-assignment validation",
            "solution_verification": "post-generation analysis", 
            "conflict_resolution": "detailed reporting with severity levels",
            "performance_monitoring": "execution time and convergence tracking"
        },
        "supported_formats": {
            "input": ["JSON with enhanced validation"],
            "output": ["JSON with detailed metrics", "planned: PDF reports, Excel exports"]
        },
        "timestamp": datetime.now().isoformat()
    }