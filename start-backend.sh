#!/bin/bash

echo "Installing required packages..."
python3 -m pip install pydantic==1.10.8 fastapi uvicorn numpy

echo "Starting backend server..."
cd backend
python3 -m uvicorn app.main:app --reload 