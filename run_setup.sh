#!/usr/bin/env bash
set -e

echo "Building Docker container for Product Agent Suite..."
docker build -t product-agent-suite .

echo "Setup completed successfully! Please copy .env.example to .env and configure your GEMINI_API_KEY."
echo "You can run your agents using: ./run_docker.sh python3 src/single_agent.py"
