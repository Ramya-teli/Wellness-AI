#!/usr/bin/env python3

import requests
import sys
import json
import time
from datetime import datetime

class WellnessAPITester:
    def __init__(self, base_url="https://fitlife-guide-1.preview.customagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, timeout=timeout)
            elif method == 'POST':
                response = self.session.post(url, json=data, timeout=timeout)
            elif method == 'PUT':
                response = self.session.put(url, json=data, timeout=timeout)
            elif method == 'DELETE':
                response = self.session.delete(url, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:500]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_dashboard(self):
        """Test dashboard endpoint"""
        return self.run_test("Dashboard", "GET", "dashboard", 200)

    def test_workout_endpoints(self):
        """Test workout-related endpoints"""
        results = []
        
        # Test workout logs (empty initially)
        success, _ = self.run_test("Get Workout Logs", "GET", "workout/logs", 200)
        results.append(success)
        
        # Test workout recommendations
        success, _ = self.run_test("Get Workout Recommendations", "GET", "workout/recommendations?energy_level=7", 200)
        results.append(success)
        
        # Test logging a workout
        workout_data = {
            "workout_type": "Strength Training",
            "duration_minutes": 45,
            "intensity": "medium",
            "energy_level": 7,
            "notes": "Test workout session"
        }
        success, response = self.run_test("Log Workout", "POST", "workout/log", 200, workout_data)
        results.append(success)
        
        if success and response:
            print(f"   Created workout with ID: {response.get('id', 'N/A')}")
        
        return all(results)

    def test_sleep_endpoints(self):
        """Test sleep-related endpoints"""
        results = []
        
        # Test sleep logs (empty initially)
        success, _ = self.run_test("Get Sleep Logs", "GET", "sleep/logs", 200)
        results.append(success)
        
        # Test sleep analysis
        success, _ = self.run_test("Get Sleep Analysis", "GET", "sleep/analysis", 200)
        results.append(success)
        
        # Test logging sleep
        sleep_data = {
            "sleep_time": "22:30",
            "wake_time": "06:30",
            "quality": 8,
            "interruptions": 1,
            "notes": "Good night's sleep"
        }
        success, response = self.run_test("Log Sleep", "POST", "sleep/log", 200, sleep_data)
        results.append(success)
        
        if success and response:
            print(f"   Created sleep log with ID: {response.get('id', 'N/A')}")
        
        return all(results)

    def test_meditation_endpoints(self):
        """Test meditation-related endpoints"""
        results = []
        
        # Test meditation logs (empty initially)
        success, _ = self.run_test("Get Meditation Logs", "GET", "meditation/logs", 200)
        results.append(success)
        
        # Test guided meditation generation
        success, _ = self.run_test("Get Guided Meditation", "GET", "meditation/guided?mood=6&duration=10", 200)
        results.append(success)
        
        # Test logging meditation
        meditation_data = {
            "session_type": "guided",
            "duration_minutes": 15,
            "mood_before": 5,
            "mood_after": 7,
            "stress_level": 4,
            "focus_quality": 8,
            "notes": "Very relaxing session"
        }
        success, response = self.run_test("Log Meditation", "POST", "meditation/log", 200, meditation_data)
        results.append(success)
        
        if success and response:
            print(f"   Created meditation log with ID: {response.get('id', 'N/A')}")
        
        return all(results)

    def test_chat_endpoints(self):
        """Test chat-related endpoints"""
        results = []
        
        # Test chat history (empty initially)
        success, _ = self.run_test("Get Chat History", "GET", "chat/history", 200)
        results.append(success)
        
        # Test AI chat - this might take longer due to LLM processing
        chat_data = {
            "message": "Hello, I need some fitness advice for beginners",
            "context": "workout"
        }
        print("   Note: Chat response may take 10-15 seconds due to AI processing...")
        success, response = self.run_test("AI Chat", "POST", "chat", 200, chat_data, timeout=45)
        results.append(success)
        
        if success and response:
            print(f"   AI Response length: {len(response.get('response', ''))}")
            print(f"   Evaluation scores: {response.get('evaluation', {})}")
        
        return all(results)

    def test_opik_endpoints(self):
        """Test Opik-related endpoints"""
        results = []
        
        # Test Opik metrics
        success, _ = self.run_test("Get Opik Metrics", "GET", "opik/metrics", 200)
        results.append(success)
        
        # Test Opik experiments
        success, _ = self.run_test("Get Opik Experiments", "GET", "opik/experiments", 200)
        results.append(success)
        
        return all(results)

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Wellness AI API Test Suite")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        print("\n📡 Testing Basic Connectivity...")
        self.test_root_endpoint()
        
        # Test dashboard
        print("\n📊 Testing Dashboard...")
        self.test_dashboard()
        
        # Test workout endpoints
        print("\n💪 Testing Workout Endpoints...")
        self.test_workout_endpoints()
        
        # Test sleep endpoints
        print("\n😴 Testing Sleep Endpoints...")
        self.test_sleep_endpoints()
        
        # Test meditation endpoints
        print("\n🧘 Testing Meditation Endpoints...")
        self.test_meditation_endpoints()
        
        # Test chat endpoints (AI integration)
        print("\n🤖 Testing AI Chat Endpoints...")
        self.test_chat_endpoints()
        
        # Test Opik endpoints
        print("\n📈 Testing Opik Endpoints...")
        self.test_opik_endpoints()
        
        # Print final results
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            print("\n🔍 FAILED TESTS DETAILS:")
            for i, failure in enumerate(self.failed_tests, 1):
                print(f"\n{i}. {failure['test']}")
                print(f"   Endpoint: {failure['endpoint']}")
                if 'expected' in failure:
                    print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'error' in failure:
                    print(f"   Error: {failure['error']}")
                if 'response' in failure:
                    print(f"   Response: {failure['response'][:200]}...")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = WellnessAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())