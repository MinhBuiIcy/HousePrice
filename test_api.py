"""
Test script for ML API endpoints
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8001"

print("="*80)
print("TESTING ML API")
print("="*80)

# Wait for API to start
print("\nWaiting for API to start...")
time.sleep(2)

# Check if API is running
try:
    requests.get(f"{BASE_URL}/health", timeout=2)
    print("API is running!")
except:
    print("ERROR: API is not running. Please start with: python ml_api.py")
    sys.exit(1)

# Test 1: Health Check
print("\n1. Testing Health Check...")
try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")

# Test 2: Price Prediction
print("\n2. Testing Price Prediction...")
try:
    data = {
        "area": 80,
        "rooms": 3,
        "toilets": 2,
        "floors": 4,
        "district": "Quận Hoàn Kiếm"
    }
    response = requests.post(f"{BASE_URL}/predict", json=data)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")

# Test 3: Recommend by Features
print("\n3. Testing Recommend by Features...")
try:
    data = {
        "price": 5000000000,
        "area": 80,
        "rooms": 3,
        "toilets": 2,
        "floors": 4,
        "district": "Quận Hoàn Kiếm",
        "n_recommendations": 3
    }
    response = requests.post(f"{BASE_URL}/recommend/by-features", json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"User Input: {result['user_input']}")
        print(f"Recommendations: {len(result['recommendations'])}")
        for rec in result['recommendations']:
            print(f"  Rank {rec['rank']}: {rec['price_billions']} tỷ, {rec['area']} m², District: {rec['district']}, Similarity: {rec['similarity_score']}")
    else:
        print(f"Error Response: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

print("\n" + "="*80)
print("TESTING COMPLETE")
print("="*80)
