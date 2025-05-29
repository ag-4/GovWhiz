#!/usr/bin/env python3
"""
GovWhiz MP Lookup Server Startup Script
Handles installation and server startup automatically
"""

import subprocess
import sys
import os
import time

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install packages: {e}")
        return False

def check_requirements():
    """Check if required packages are installed"""
    required_packages = ['flask', 'flask_cors', 'requests']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    return len(missing_packages) == 0, missing_packages

def setup_environment():
    """Set up environment variables"""
    if not os.getenv('THEYWORKFORYOU_API_KEY'):
        print("⚠️  No API key found in environment variables")
        print("   You can set it with: export THEYWORKFORYOU_API_KEY=your_key_here")
        print("   Or the server will use mock data for testing")

def start_server():
    """Start the Flask server"""
    print("\n🏛️ Starting GovWhiz MP Lookup Server...")
    print("=" * 60)
    
    try:
        # Import and run the Flask app
        from app import app
        app.run(debug=True, host="0.0.0.0", port=5000)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main startup function"""
    print("🚀 GovWhiz MP Lookup Server Setup")
    print("=" * 40)
    
    # Check if requirements are installed
    packages_ok, missing = check_requirements()
    
    if not packages_ok:
        print(f"❌ Missing packages: {missing}")
        print("📦 Installing requirements...")
        if not install_requirements():
            print("❌ Failed to install requirements. Please run manually:")
            print("   pip install -r requirements.txt")
            return
    else:
        print("✅ All required packages are installed")
    
    # Set up environment
    setup_environment()
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()
