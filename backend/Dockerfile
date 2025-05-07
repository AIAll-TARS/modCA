# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Create a non-root user and set up directories
RUN useradd -m -u 1000 appuser && \
  mkdir -p /app/tmp && \
  chown -R appuser:appuser /app

# Copy requirements first to leverage Docker cache
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app directory first
COPY --chown=appuser:appuser app/ /app/app/

# Copy any other necessary files
COPY --chown=appuser:appuser *.py ./
COPY --chown=appuser:appuser *.txt ./
COPY --chown=appuser:appuser *.db ./

# Create test script to verify environment
RUN echo '#!/usr/bin/env python3\n\
  import os\n\
  import sys\n\
  \n\
  print("=== Environment Test ===")\n\
  print(f"Current directory: {os.getcwd()}")\n\
  print(f"Directory contents: {os.listdir(".")}")\n\
  print(f"App directory contents: {os.listdir("app")}")\n\
  print(f"Python path: {sys.path}")\n\
  \n\
  try:\n\
  import app.main\n\
  print("Successfully imported app.main")\n\
  except Exception as e:\n\
  print(f"Failed to import app.main: {e}")\n\
  \n\
  try:\n\
  from app.main import app\n\
  print("Successfully imported app from app.main")\n\
  except Exception as e:\n\
  print(f"Failed to import app from app.main: {e}")\n\
  ' > /app/test_env.py && chmod +x /app/test_env.py

# Print detailed directory structure
RUN echo "=== Directory Structure ===" && \
  echo "Current directory:" && pwd && \
  echo "\nRoot directory contents:" && ls -la / && \
  echo "\nApp directory contents:" && ls -la /app && \
  echo "\nApp directory structure:" && find /app -type f -name "*.py" && \
  echo "\nPython path:" && python3 -c "import sys; print('\n'.join(sys.path))"

# Add current directory to Python path
ENV PYTHONPATH=/app
ENV PYTHONVERBOSE=1

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8000

# Create a startup script with more debugging
RUN echo '#!/bin/bash\necho "=== Startup Debug Info ==="\necho "Current directory:"\npwd\necho "\nDirectory contents:"\nls -la\necho "\nPython path:"\necho $PYTHONPATH\necho "\nRunning environment test..."\npython3 /app/test_env.py\necho "\nStarting uvicorn..."\nexec uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level debug' > /app/start.sh && \
  chmod +x /app/start.sh

# Command to run the application
CMD ["/app/start.sh"] 