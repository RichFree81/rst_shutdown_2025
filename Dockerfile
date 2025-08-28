# Stage 1: Build stage with full build tools
FROM python:3.12-slim as builder

WORKDIR /app

# Create and activate a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install dependencies
# This is done first to leverage Docker's layer caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY backend/ .

# Stage 2: Final, slim production stage
FROM python:3.12-slim

WORKDIR /app/backend

# Create a non-root user for better security
RUN useradd --create-home appuser

# Copy the virtual environment and application code from the builder stage
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app/ .

# Grant ownership to the new user
RUN chown -R appuser:appuser /app
USER appuser

# Set the PATH to include the virtual environment's binaries
ENV PATH="/opt/venv/bin:$PATH"

# Expose the port the app will run on
EXPOSE 8000

# Command to run the application in production
# Binds to 0.0.0.0 to be accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
