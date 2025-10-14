#!/usr/bin/env python3
"""
Test script to verify password hashing and verification
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import bcrypt

# The stored hash from database
stored_hash = "$2b$12$lEgTGxyXoDL/Il4iJkYxi.bA8XB.bmSyfil98yfE.UHduM74ORyOi"

# Test password
test_password = "admin123"

print("Testing password verification...")
print(f"Password: {test_password}")
print(f"Stored hash: {stored_hash}")
print()

# Test verification
try:
    result = bcrypt.checkpw(
        test_password.encode('utf-8'),
        stored_hash.encode('utf-8')
    )
    print(f"✅ Password verification result: {result}")

    if result:
        print("✅ SUCCESS: Password 'admin123' matches the stored hash!")
    else:
        print("❌ FAILED: Password does not match!")

except Exception as e:
    print(f"❌ ERROR during verification: {e}")

print()

# Test creating a new hash
print("Creating new hash for comparison...")
try:
    salt = bcrypt.gensalt()
    new_hash = bcrypt.hashpw(test_password.encode('utf-8'), salt).decode('utf-8')
    print(f"New hash: {new_hash}")

    # Verify new hash works
    verify_new = bcrypt.checkpw(test_password.encode('utf-8'), new_hash.encode('utf-8'))
    print(f"New hash verification: {verify_new}")

except Exception as e:
    print(f"❌ ERROR creating hash: {e}")
