"""
Quick API Test Script
Run this to verify backend is working correctly
"""

import requests
import json

API_BASE = "http://localhost:8000"


def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{API_BASE}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()


def test_compliance():
    """Test compliance validation"""
    print("Testing compliance validation...")

    creative_data = {
        "canvas_width": 1080,
        "canvas_height": 1080,
        "format": "1:1",
        "background_color": "#FFFFFF",
        "headline": "Fresh Products",
        "subhead": "Available now",
        "elements": [
            {
                "type": "image",
                "left": 100,
                "top": 100,
                "x": 100,
                "y": 100,
                "width": 400,
                "height": 400
            }
        ]
    }

    response = requests.post(
        f"{API_BASE}/api/compliance/validate",
        json={"creative_data": creative_data}
    )

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Compliance Score: {result.get('compliance_score', 0)}%")
        print(f"Errors: {len(result.get('errors', []))}")
        print(f"Warnings: {len(result.get('warnings', []))}")
    else:
        print(f"Error: {response.text}")
    print()


def test_formats():
    """Test supported formats endpoint"""
    print("Testing formats endpoint...")
    response = requests.get(f"{API_BASE}/api/formats")
    print(f"Status: {response.status_code}")
    formats = response.json()
    print(f"Supported formats: {list(formats['formats'].keys())}")
    print()


if __name__ == "__main__":
    print("=" * 50)
    print("Tesco Creative Studio - API Test")
    print("=" * 50)
    print()

    try:
        test_health()
        test_compliance()
        test_formats()
        print("✅ All tests passed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
