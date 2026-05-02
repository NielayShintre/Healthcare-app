#!/bin/bash
# Install dependencies
pip install -r backend/requirements.txt

# Run the server
# Using -m to ensure the package structure is respected
export PYTHONPATH=$PYTHONPATH:$(pwd)
python -m backend.main
