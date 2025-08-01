# Use a lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files to the container
COPY . .

# Expose the port your Flask app will run on
ENV PORT=8080
EXPOSE 8080

# Run the Flask app
CMD ["python", "app.py"]