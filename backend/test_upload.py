"""
Test script to verify upload configuration
"""
from app import create_app

app = create_app()

print("=" * 50)
print("UPLOAD CONFIGURATION TEST")
print("=" * 50)
print(f"UPLOAD_FOLDER: {app.config.get('UPLOAD_FOLDER', 'NOT SET')}")
print(f"ALLOWED_EXTENSIONS: {app.config.get('ALLOWED_EXTENSIONS', 'NOT SET')}")
print(f"MAX_CONTENT_LENGTH: {app.config.get('MAX_CONTENT_LENGTH', 'NOT SET')}")
print(f"CORS_ORIGINS: {app.config.get('CORS_ORIGINS', 'NOT SET')}")
print("=" * 50)

import os
upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
print(f"\nChecking if upload folder exists: {upload_folder}")
print(f"Exists: {os.path.exists(upload_folder)}")
print(f"Is directory: {os.path.isdir(upload_folder)}")

if not os.path.exists(upload_folder):
    print(f"Creating folder: {upload_folder}")
    os.makedirs(upload_folder, exist_ok=True)
    print("Created successfully!")
