from typing import Dict, Any, List, Tuple, Optional, Set
import time
import random
import copy
from datetime import datetime
from collections import defaultdict
import logging

class EnhancedTimetableGA:
    """Enhanced Genetic Algorithm for University Timetable Generation"""
    
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
        
        # Create time slot ID to index mapping for arithmetic operations
        self.time_slot_indices = {ts["id"]: idx for idx, ts in enumerate(self.time_slots)}
        
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
    
    def calculate_enhanced_fitness(self, chromosome):
        """Calculate fitness using the constraint checker module"""
        from utils.constraint_checker import ConstraintChecker
        checker = ConstraintChecker(self)
        return checker.calculate_enhanced_fitness(chromosome)