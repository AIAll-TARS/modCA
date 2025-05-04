# syntax=docker/dockerfile:1
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m modcauser
WORKDIR /home/modcauser/app

# Copy requirements and install
COPY --chown=modcauser:modcauser requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=modcauser:modcauser app ./app

# Copy database file if exists (optional, for initial setup)
COPY --chown=modcauser:modcauser settings.db ./settings.db

# Set permissions
RUN chown -R modcauser:modcauser /home/modcauser/app

# Expose port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

# Switch to non-root user
USER modcauser

# Entrypoint: Gunicorn with Uvicorn workers
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120"] 