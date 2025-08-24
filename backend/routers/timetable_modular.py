from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import time
import logging
from datetime import datetime

# Import our modular components
from algorithms.enhanced_genetic_algorithm import EnhancedTimetableGA
from utils.enhanced_validator import (
    generate_validation_suggestions, 
    perform_pre_generation_checks,
    validate_enhanced_university_data
)
from utils.timetable_formatter import (
    format_enhanced_timetable,
    calculate_enhanced_teacher_utilization,
    calculate_enhanced_room_utilization,
    calculate_constraint_satisfaction
)
from utils.conflict_analyzer import check_enhanced_conflicts
from utils.data_validator import validate_university_data_structure

router = APIRouter()

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
            return {
                "success": False,
                "error": "Missing university data",
                "message": "Please provide university data including teachers, subjects, rooms, students, and time slots",
                "details": {
                    "errorType": "MISSING_DATA",
                    "requiredFields": ["basicInfo", "teachers", "subjects", "rooms", "students", "timeSlots"]
                }
            }
        
        # Validate data structure with detailed feedback
        validation_result = validate_university_data_structure(university_data)
        if not validation_result["valid"]:
            return {
                "success": False,
                "error": "Data validation failed",
                "message": "Your university data has validation errors that prevent timetable generation",
                "details": {
                    "errorType": "VALIDATION_FAILED",
                    "errors": validation_result["errors"],
                    "warnings": validation_result.get("warnings", []),
                    "suggestions": generate_validation_suggestions(validation_result["errors"])
                }
            }
        
        # Additional pre-generation checks
        pre_check_result = perform_pre_generation_checks(university_data)
        if not pre_check_result["canGenerate"]:
            return {
                "success": False,
                "error": "Pre-generation checks failed",
                "message": "Critical issues found that prevent timetable generation",
                "details": {
                    "errorType": "PRE_GENERATION_FAILED",
                    "criticalIssues": pre_check_result["criticalIssues"],
                    "recommendations": pre_check_result["recommendations"]
                }
            }
        
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
            return {
                "success": False,
                "error": "Algorithm failed to generate solution",
                "message": "The genetic algorithm could not produce a valid timetable with the given constraints",
                "details": {
                    "errorType": "ALGORITHM_FAILURE",
                    "suggestions": [
                        "Try relaxing some constraints",
                        "Add more teachers or rooms",
                        "Reduce course hours or student enrollments",
                        "Increase algorithm generations or population size"
                    ]
                }
            }
        
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
        
        # Provide meaningful error messages based on the exception
        error_message = str(e)
        error_type = "GENERATION_ERROR"
        suggestions = []
        
        if "can only concatenate str" in error_message:
            error_message = "Time slot format incompatibility detected"
            error_type = "TIME_SLOT_FORMAT_ERROR"
            suggestions = ["Ensure time slots have consistent ID format (all strings or all numbers)"]
        elif "No qualified teacher" in error_message:
            error_type = "TEACHER_QUALIFICATION_ERROR" 
            suggestions = ["Add subject names/codes to teacher 'subjectsCanTeach' arrays"]
        elif "not enough values to unpack" in error_message:
            error_type = "DATA_STRUCTURE_ERROR"
            suggestions = ["Check that all required fields are present in your data"]
        elif "list index out of range" in error_message:
            error_type = "INSUFFICIENT_DATA_ERROR"
            suggestions = ["Ensure you have sufficient teachers, rooms, and time slots for your requirements"]
        
        return {
            "success": False,
            "error": error_message,
            "message": f"An unexpected error occurred during timetable generation: {error_message}",
            "details": {
                "errorType": error_type,
                "suggestions": suggestions,
                "technicalDetails": error_traceback if logging.getLogger().isEnabledFor(logging.DEBUG) else None
            }
        }

@router.post("/validate-enhanced-data")
async def validate_enhanced_data_endpoint(request_data: Dict[str, Any]):
    """
    Enhanced validation with detailed analysis and recommendations
    """
    try:
        university_data = request_data.get("universityData", request_data)
        return validate_enhanced_university_data(university_data)
        
    except Exception as e:
        logging.error(f"Validation error: {str(e)}")
        return {
            "valid": False,
            "errors": [f"Validation error: {str(e)}"],
            "warnings": [],
            "recommendations": ["Please check your data format and try again"]
        }

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
        "architecture": "modular",
        "algorithm": {
            "name": "Enhanced Genetic Algorithm",
            "version": "2.0",
            "improvements": [
                "Smart initial population generation",
                "Enhanced constraint handling",
                "Improved resource allocation logic",
                "Better convergence detection",
                "Detailed conflict analysis"
            ]
        },
        "modules": [
            "algorithms.enhanced_genetic_algorithm",
            "utils.constraint_checker",
            "utils.timetable_formatter", 
            "utils.enhanced_validator",
            "utils.conflict_analyzer"
        ],
        "features": {
            "error_handling": "comprehensive with meaningful messages",
            "validation": "multi-level with suggestions",
            "conflict_detection": "detailed with severity levels",
            "performance": "optimized with modular architecture"
        },
        "timestamp": datetime.now().isoformat()
    }