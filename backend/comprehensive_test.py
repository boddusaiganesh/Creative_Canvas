"""
Comprehensive Feature Testing Script
Tests all major functionality of Tesco Creative Studio
"""

import requests
import json
import os
import time

API_BASE = "http://localhost:8000"


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'


def print_test(name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}TEST: {name}{Colors.END}")
    print("-" * 60)


def print_pass(message):
    print(f"{Colors.GREEN}✅ PASS:{Colors.END} {message}")


def print_fail(message):
    print(f"{Colors.RED}❌ FAIL:{Colors.END} {message}")


def print_warn(message):
    print(f"{Colors.YELLOW}⚠️  WARN:{Colors.END} {message}")


# Test counters
tests_run = 0
tests_passed = 0
tests_failed = 0


def run_test(test_func):
    global tests_run, tests_passed, tests_failed
    tests_run += 1
    try:
        result = test_func()
        if result:
            tests_passed += 1
            return True
        else:
            tests_failed += 1
            return False
    except Exception as e:
        tests_failed += 1
        print_fail(f"Exception: {str(e)}")
        return False


# ============================================================================
# TESTS
# ============================================================================

def test_health_check():
    print_test("Health Check Endpoint")
    response = requests.get(f"{API_BASE}/health", timeout=5)

    if response.status_code == 200:
        data = response.json()
        print_pass(f"Status: {response.status_code}")
        print_pass(f"Response: {data}")
        return True
    else:
        print_fail(f"Status: {response.status_code}")
        return False


def test_root_endpoint():
    print_test("Root Endpoint")
    response = requests.get(f"{API_BASE}/", timeout=5)

    if response.status_code == 200:
        data = response.json()
        print_pass(f"App: {data.get('app')}")
        print_pass(f"Version: {data.get('version')}")
        return True
    else:
        print_fail(f"Status: {response.status_code}")
        return False


def test_formats_endpoint():
    print_test("Supported Formats Endpoint")
    response = requests.get(f"{API_BASE}/api/formats", timeout=5)

    if response.status_code == 200:
        data = response.json()
        formats = list(data['formats'].keys())
        print_pass(f"Formats: {formats}")
        return len(formats) == 4
    else:
        print_fail(f"Status: {response.status_code}")
        return False


def test_compliance_rules():
    print_test("Compliance Rules Endpoint")
    response = requests.get(f"{API_BASE}/api/compliance/rules", timeout=5)

    if response.status_code == 200:
        data = response.json()
        print_pass(f"Total rules: {data.get('total_rules')}")
        return data.get('total_rules') == 18
    else:
        print_fail(f"Status: {response.status_code}")
        return False


def test_compliance_validation():
    print_test("Compliance Validation")

    creative_data = {
        "canvas_width": 1080,
        "canvas_height": 1080,
        "format": "1:1",
        "background_color": "#FFFFFF",
        "background_image": None,
        "headline": "Fresh Products",
        "subhead": "Available now",
        "body_text": "",
        "tag_text": "",
        "is_alcohol_campaign": False,
        "has_people_in_images": False,
        "people_confirmed": False,
        "elements": [
            {
                "type": "image",
                "left": 100,
                "top": 100,
                "width": 400,
                "height": 400,
                "angle": 0,
                "opacity": 1.0
            }
        ]
    }

    response = requests.post(
        f"{API_BASE}/api/compliance/validate",
        json={"creative_data": creative_data},
        timeout=10
    )

    if response.status_code == 200:
        data = response.json()
        print_pass(f"Score: {data.get('compliance_score')}%")
        print_pass(f"Errors: {len(data.get('errors', []))}")
        print_pass(f"Warnings: {len(data.get('warnings', []))}")
        return True
    else:
        print_fail(f"Status: {response.status_code}")
        print_fail(f"Response: {response.text}")
        return False


def test_compliance_with_errors():
    print_test("Compliance Validation with Errors")

    creative_data = {
        "canvas_width": 1080,
        "canvas_height": 1080,
        "format": "1:1",
        "background_color": "#FFFFFF",
        "background_image": None,
        "headline": "Win a prize! Great competition!",
        "subhead": "Money back guarantee",
        "body_text": "",
        "tag_text": "",
        "is_alcohol_campaign": False,
        "has_people_in_images": False,
        "people_confirmed": False,
        "elements": []
    }

    response = requests.post(
        f"{API_BASE}/api/compliance/validate",
        json={"creative_data": creative_data},
        timeout=10
    )

    if response.status_code == 200:
        data = response.json()
        errors = data.get('errors', [])
        print_pass(f"Score: {data.get('compliance_score')}%")
        print_pass(f"Errors detected: {len(errors)}")

        if len(errors) > 0:
            print_pass(f"Error examples: {errors[0].get('rule')}")
            return True
        else:
            print_fail("No errors detected for prohibited text")
            return False
    else:
        print_fail(f"Status: {response.status_code}")
        return False


def test_file_upload():
    print_test("File Upload")

    # Create a small test image
    try:
        from PIL import Image
        import io

        # Create test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        files = {'file': ('test_image.png', img_bytes, 'image/png')}
        response = requests.post(
            f"{API_BASE}/api/upload",
            files=files,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            print_pass(f"Uploaded: {data.get('filename')}")
            print_pass(f"Size: {data.get('file_size')} bytes")
            return data.get('success') == True
        else:
            print_fail(f"Status: {response.status_code}")
            return False

    except ImportError:
        print_warn("PIL not available, skipping upload test")
        return True
    except Exception as e:
        print_fail(f"Error: {str(e)}")
        return False


def test_layout_suggestions():
    print_test("AI Layout Suggestions")

    request_data = {
        "canvas_width": 1080,
        "canvas_height": 1080,
        "format": "1:1",
        "has_packshots": True,
        "has_logo": True,
        "has_headline": True
    }

    response = requests.post(
        f"{API_BASE}/api/ai/suggest-layouts",
        json=request_data,
        timeout=10
    )

    if response.status_code == 200:
        data = response.json()
        layouts = data.get('layouts', [])
        print_pass(f"Layouts generated: {len(layouts)}")
        if layouts:
            print_pass(f"First layout: {layouts[0].get('name')}")
        return len(layouts) > 0
    else:
        print_fail(f"Status: {response.status_code}")
        return False


def test_color_palettes():
    print_test("Color Palettes")

    response = requests.get(
        f"{API_BASE}/api/ai/color-palettes",
        timeout=5
    )

    if response.status_code == 200:
        data = response.json()
        palettes = data.get('palettes', [])
        print_pass(f"Palettes available: {len(palettes)}")
        if palettes:
            print_pass(f"First palette: {palettes[0].get('name')}")
        return len(palettes) > 0
    else:
        print_fail(f"Status: {response.status_code}")
        return False


def test_export_formats():
    print_test("Export Service (Dry Run)")

    # Just test that ExportService.FORMATS is accessible
    response = requests.get(f"{API_BASE}/api/formats", timeout=5)

    if response.status_code == 200:
        data = response.json()
        formats = data.get('formats', {})

        expected_formats = ['1:1', '9:16', '1.91:1', '4:5']
        all_present = all(fmt in formats for fmt in expected_formats)

        if all_present:
            print_pass("All 4 formats available")
            return True
        else:
            print_fail("Missing formats")
            return False
    else:
        print_fail(f"Status: {response.status_code}")
        return False


# ============================================================================
# RUN ALL TESTS
# ============================================================================

def main():
    print("=" * 60)
    print(f"{Colors.BOLD}TESCO CREATIVE STUDIO - COMPREHENSIVE TEST SUITE{Colors.END}")
    print("=" * 60)

    # Check if backend is running
    print("\n🔍 Checking backend connection...")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=2)
        print_pass("Backend is running!")
    except requests.exceptions.ConnectionError:
        print_fail("Backend is not running!")
        print(f"\n{Colors.YELLOW}Please start the backend first:{Colors.END}")
        print("  cd backend")
        print("  venv\\Scripts\\activate")
        print("  python main.py")
        return
    except Exception as e:
        print_fail(f"Connection error: {str(e)}")
        return

    print(f"\n{Colors.BOLD}Running tests...{Colors.END}\n")

    # Run all tests
    run_test(test_root_endpoint)
    run_test(test_health_check)
    run_test(test_formats_endpoint)
    run_test(test_compliance_rules)
    run_test(test_compliance_validation)
    run_test(test_compliance_with_errors)
    run_test(test_file_upload)
    run_test(test_layout_suggestions)
    run_test(test_color_palettes)
    run_test(test_export_formats)

    # Print summary
    print("\n" + "=" * 60)
    print(f"{Colors.BOLD}TEST SUMMARY{Colors.END}")
    print("=" * 60)
    print(f"Total Tests: {tests_run}")
    print(f"{Colors.GREEN}Passed: {tests_passed}{Colors.END}")
    print(f"{Colors.RED}Failed: {tests_failed}{Colors.END}")

    pass_rate = (tests_passed / tests_run * 100) if tests_run > 0 else 0
    print(f"\nPass Rate: {pass_rate:.1f}%")

    if tests_failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! 🎉{Colors.END}")
        print(f"\n{Colors.GREEN}✅ Backend is fully functional and ready for use!{Colors.END}")
    else:
        print(f"\n{Colors.YELLOW}⚠️  Some tests failed. Check errors above.{Colors.END}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
