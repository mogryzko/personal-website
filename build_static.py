import os
import subprocess
import sys

# Print debug information
print("Python version:", sys.version)
print("Current directory:", os.getcwd())
print("Directory contents:", os.listdir("."))
print("Environment variables:")
for key, value in sorted(os.environ.items()):
    print(f"  {key}={value}")

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "website.settings")

# Install required packages
subprocess.check_call([sys.executable, "-m", "pip", "install", "whitenoise"])

# Try to collect static files
try:
    print("Collecting static files...")
    import django
    django.setup()
    from django.core.management import call_command
    call_command('collectstatic', '--noinput', verbosity=1)
    print("Static files collected successfully")
except Exception as e:
    print(f"Error collecting static files: {e}")
    import traceback
    traceback.print_exc()

# Create necessary directories if they don't exist
os.makedirs("static", exist_ok=True)
os.makedirs("media", exist_ok=True)

# Create a simple test file to verify static files are working
with open("static/test.txt", "w") as f:
    f.write("This is a test static file")

print("Build script completed")