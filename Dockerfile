FROM python:3.11-slim

# Install system dependencies for git and curl
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install Playwright browser and system dependencies
RUN playwright install chromium
RUN playwright install-deps chromium

# Default command
CMD ["python3", "src/single_agent.py"]
