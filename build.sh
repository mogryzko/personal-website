#!/bin/bash
# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Create test files to verify access
echo "Test static file" > static/test.txt
echo "Test media file" > media/test.txt

echo "Build completed"