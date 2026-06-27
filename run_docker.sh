#!/usr/bin/env bash

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please copy .env.example to .env and configure GEMINI_API_KEY."
    exit 1
fi

# Default command if none provided
CMD="python3 src/single_agent.py"
if [ "$#" -gt 0 ]; then
    CMD="$*"
fi

echo "Running agent command in Docker container: $CMD"
docker run -it --rm \
  --env-file .env \
  -v "$(pwd)":/app \
  product-agent-suite \
  bash -c "$CMD"
