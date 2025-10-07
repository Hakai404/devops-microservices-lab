# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY processor.py .

# Create messages directory
RUN mkdir -p /app/messages

# Run the processor
CMD ["python", "-u", "processor.py"]
