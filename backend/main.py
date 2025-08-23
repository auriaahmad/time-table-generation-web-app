from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
from datetime import datetime
import json

# Import our routers
from routers.timetable import router as timetable_router

# Create FastAPI app
app = FastAPI(
    title="University Timetable Generator API",
    description="Backend API for automated university timetable generation using Genetic Algorithm",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(timetable_router, prefix="/api", tags=["timetable"])

# Basic response models
class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: str
    version: str

class TestResponse(BaseModel):
    success: bool
    message: str
    received_data: Optional[Dict[str, Any]] = None

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "University Timetable Generator API",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="University Timetable Generator API is running",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

# Test endpoint to verify backend-frontend communication
@app.post("/test", response_model=TestResponse)
async def test_endpoint(data: Dict[str, Any]):
    """Test endpoint to verify API communication"""
    try:
        return TestResponse(
            success=True,
            message="Backend received data successfully!",
            received_data=data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Simple data validation endpoint
@app.post("/api/validate")
async def validate_university_data(university_data: Dict[str, Any]):
    """Validate university data structure"""
    try:
        # Basic validation
        required_keys = ["basicInfo", "teachers", "subjects", "rooms", "students", "timeSlots"]
        missing_keys = [key for key in required_keys if key not in university_data]
        
        if missing_keys:
            return {
                "valid": False,
                "errors": [f"Missing required key: {key}" for key in missing_keys],
                "message": "University data structure is invalid"
            }
        
        # Count resources
        stats = {
            "teachers": len(university_data.get("teachers", [])),
            "subjects": len(university_data.get("subjects", [])),
            "rooms": len(university_data.get("rooms", [])),
            "students": len(university_data.get("students", [])),
            "timeSlots": len(university_data.get("timeSlots", [])),
            "departments": len(university_data.get("departments", []))
        }
        
        return {
            "valid": True,
            "errors": [],
            "message": "University data structure is valid",
            "statistics": stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")

# Quick test with sample data
@app.get("/api/sample-data")
async def get_sample_data():
    """Return sample university data for testing"""
    return {
        "basicInfo": {
            "universityName": "Test University",
            "academicYear": "2024-2025",
            "semester": "Fall",
            "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "dailyPeriods": 8
        },
        "teachers": [
            {
                "id": 1,
                "name": "Dr. John Doe",
                "department": "Computer Science",
                "designation": "Professor"
            }
        ],
        "subjects": [
            {
                "id": 1,
                "name": "Programming 101",
                "department": "Computer Science",
                "credits": 3
            }
        ],
        "rooms": [
            {
                "id": 1,
                "name": "A-101",
                "capacity": 50,
                "type": "Classroom"
            }
        ],
        "students": [
            {
                "id": 1,
                "batch": "CS-2024",
                "totalStudents": 45,
                "subjects": [1]
            }
        ],
        "timeSlots": [
            {
                "id": 1,
                "startTime": "08:00",
                "endTime": "09:00"
            }
        ]
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 University Timetable Generator API is starting...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("❤️  Health Check: http://localhost:8000/health")
    print("🧪 Test Endpoint: http://localhost:8000/test")

# Main entry point
if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )