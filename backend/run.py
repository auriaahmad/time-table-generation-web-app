#!/usr/bin/env python3
"""
University Timetable Generator - Backend Runner Script
This script automatically sets up and runs the FastAPI backend server.
"""

import os
import sys
import subprocess
import platform
import time
import webbrowser
from pathlib import Path

def print_banner():
    """Print startup banner"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║              University Timetable Generator                  ║
║                     Backend Server                          ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Error: Python 3.8+ is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        print("   Please upgrade Python and try again")
        sys.exit(1)
    else:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")

def create_directory_structure():
    """Create necessary directories if they don't exist"""
    directories = [
        "models",
        "routers", 
        "utils",
        "algorithms",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    print("✅ Directory structure created")

def create_virtual_environment():
    """Create and activate virtual environment"""
    venv_path = Path("venv")
    
    if not venv_path.exists():
        print("📦 Creating virtual environment...")
        try:
            subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
            print("✅ Virtual environment created")
        except subprocess.CalledProcessError:
            print("❌ Failed to create virtual environment")
            print("   Make sure 'python -m venv' is available")
            sys.exit(1)
    else:
        print("✅ Virtual environment already exists")
    
    return venv_path

def get_pip_path(venv_path):
    """Get the correct pip path for the current platform"""
    if platform.system() == "Windows":
        return venv_path / "Scripts" / "pip.exe"
    else:
        return venv_path / "bin" / "pip"

def get_python_path(venv_path):
    """Get the correct python path for the current platform"""
    if platform.system() == "Windows":
        return venv_path / "Scripts" / "python.exe"
    else:
        return venv_path / "bin" / "python"

def install_dependencies(venv_path):
    """Install required dependencies"""
    pip_path = get_pip_path(venv_path)
    
    # Check if dependencies are already installed
    try:
        python_path = get_python_path(venv_path)
        result = subprocess.run([
            str(python_path), "-c", "import fastapi, uvicorn, pydantic"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies already installed")
            return
    except:
        pass
    
    print("📦 Installing dependencies...")
    
    # Core dependencies
    dependencies = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0", 
        "pydantic==2.5.0",
        "python-multipart==0.0.6",
        "python-dotenv==1.0.0",
        "numpy==1.24.3",
        "pandas==2.0.3"
    ]
    
    try:
        for dep in dependencies:
            print(f"   Installing {dep.split('==')[0]}...")
            subprocess.run([str(pip_path), "install", dep], 
                         check=True, capture_output=True, text=True)
        
        print("✅ All dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print("   Try running manually: pip install fastapi uvicorn pydantic")
        sys.exit(1)

def check_required_files():
    """Check if all required files exist"""
    required_files = [
        "main.py",
        "models/university_models.py",
        "routers/timetable.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing required files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\n   Please ensure all backend files are in place")
        print("   Refer to the setup guide for file contents")
        sys.exit(1)
    else:
        print("✅ All required files present")

def check_port_availability(port=8000):
    """Check if port is available"""
    import socket
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            print(f"✅ Port {port} is available")
            return True
        except OSError:
            print(f"⚠️  Port {port} is already in use")
            return False

def start_server(venv_path, port=8000, host="0.0.0.0"):
    """Start the FastAPI server"""
    python_path = get_python_path(venv_path)
    
    print(f"🚀 Starting FastAPI server on {host}:{port}")
    print("   Press Ctrl+C to stop the server")
    print("-" * 60)
    
    try:
        # Start the server
        cmd = [
            str(python_path), "-m", "uvicorn", 
            "main:app", 
            "--host", host,
            "--port", str(port),
            "--reload",
            "--log-level", "info"
        ]
        
        # Show startup URLs
        print(f"📖 API Documentation: http://localhost:{port}/docs")
        print(f"❤️  Health Check: http://localhost:{port}/health")
        print(f"🧪 Interactive API: http://localhost:{port}/docs")
        print("-" * 60)
        
        # Open browser after a short delay
        def open_browser():
            time.sleep(2)
            try:
                webbrowser.open(f"http://localhost:{port}/docs")
            except:
                pass
        
        # Start browser opener in background
        import threading
        threading.Thread(target=open_browser, daemon=True).start()
        
        # Start the server (this will block)
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

def show_help():
    """Show help information"""
    help_text = """
Usage: python run.py [options]

Options:
  --port PORT     Set server port (default: 8000)
  --host HOST     Set server host (default: 0.0.0.0)
  --no-browser    Don't open browser automatically
  --setup-only    Only setup environment, don't start server
  --help, -h      Show this help message

Examples:
  python run.py                    # Start with default settings
  python run.py --port 8080        # Start on port 8080
  python run.py --setup-only       # Only setup environment
  python run.py --no-browser       # Don't open browser
  
Environment Setup:
  This script will automatically:
  ✅ Check Python version compatibility
  ✅ Create virtual environment
  ✅ Install all dependencies
  ✅ Verify required files
  ✅ Start FastAPI server
  ✅ Open API documentation in browser
    """
    print(help_text)

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="University Timetable Generator Backend Runner")
    parser.add_argument("--port", type=int, default=8000, help="Server port (default: 8000)")
    parser.add_argument("--host", default="0.0.0.0", help="Server host (default: 0.0.0.0)")
    parser.add_argument("--no-browser", action="store_true", help="Don't open browser")
    parser.add_argument("--setup-only", action="store_true", help="Only setup, don't start server")
    
    args = parser.parse_args()
    
    # Print banner
    print_banner()
    
    # Setup phase
    print("🔧 Setting up backend environment...")
    check_python_version()
    create_directory_structure()
    venv_path = create_virtual_environment()
    install_dependencies(venv_path)
    check_required_files()
    
    if args.setup_only:
        print("✅ Setup completed successfully!")
        print(f"   To start server: python run.py --port {args.port}")
        return
    
    # Check port availability
    if not check_port_availability(args.port):
        try_port = args.port + 1
        print(f"   Trying port {try_port} instead...")
        if check_port_availability(try_port):
            args.port = try_port
        else:
            print("   Please specify a different port with --port")
            sys.exit(1)
    
    print("✅ Backend setup completed successfully!")
    print()
    
    # Start server
    start_server(venv_path, args.port, args.host)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)