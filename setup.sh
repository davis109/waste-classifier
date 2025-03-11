#!/bin/bash

# Create Python virtual environment
echo "Creating Python virtual environment..."
python -m venv backend/venv

# Activate virtual environment
if [ -f "backend/venv/Scripts/activate" ]; then
    source backend/venv/Scripts/activate  # Windows
else
    source backend/venv/bin/activate      # Unix/MacOS
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install

echo "Setup complete! You can now start the development servers:"
echo "1. Backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "2. Frontend: cd frontend && npm run dev" 