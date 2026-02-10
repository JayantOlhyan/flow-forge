import requests
import json
import sys
from datetime import datetime
import uuid

class FlowForgeAPITester:
    def __init__(self, base_url="https://automate-it-9.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test_result(self, name, success, status_code=None, response=None, error=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "status_code": status_code,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if status_code:
            print(f"   Status: {status_code}")
        if error:
            print(f"   Error: {error}")
        if success and response and isinstance(response, dict):
            keys = list(response.keys())[:3]
            print(f"   Response keys: {keys}")
        print()

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        elif self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw": response.text[:200]}

            self.log_test_result(name, success, response.status_code, response_data, 
                               None if success else f"Expected {expected_status}, got {response.status_code}")

            return success, response_data

        except Exception as e:
            self.log_test_result(name, False, None, None, str(e))
            return False, {}

    def test_health_endpoint(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "/health", 200)

    def test_templates_endpoint(self):
        """Test templates endpoint (public)"""
        success, response = self.run_test("Get Templates", "GET", "/templates", 200, headers={})
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} templates")
        return success

    def test_login_existing_user(self, email="alex@test.com", password="password123"):
        """Test login with existing user"""
        success, response = self.run_test(
            "Login Existing User",
            "POST",
            "/auth/login",
            200,
            data={"email": email, "password": password},
            headers={}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   Logged in as: {response.get('user', {}).get('name')}")
        return success

    def test_register_new_user(self):
        """Test registering a new user"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@flowforge-test.com"
        success, response = self.run_test(
            "Register New User",
            "POST",
            "/auth/register",
            200,
            data={
                "name": "Test User",
                "email": test_email,
                "password": "testpass123"
            },
            headers={}
        )
        return success

    def test_get_current_user(self):
        """Test getting current user"""
        if not self.token:
            self.log_test_result("Get Current User", False, None, None, "No token available")
            return False
        
        return self.run_test("Get Current User", "GET", "/auth/me", 200)[0]

    def test_onboarding(self):
        """Test user onboarding"""
        if not self.token:
            self.log_test_result("User Onboarding", False, None, None, "No token available")
            return False
        
        return self.run_test(
            "User Onboarding",
            "PUT",
            "/auth/onboard",
            200,
            data={"job_title": "Software Engineer", "industry": "Technology"}
        )[0]

    def test_dashboard_stats(self):
        """Test dashboard stats"""
        if not self.token:
            self.log_test_result("Dashboard Stats", False, None, None, "No token available")
            return False
        
        success, response = self.run_test("Dashboard Stats", "GET", "/dashboard/stats", 200)
        if success:
            expected_keys = ['active_automations', 'total_automations', 'tasks_run', 'hours_saved']
            if all(key in response for key in expected_keys):
                print(f"   Stats: {response['active_automations']} active, {response['total_automations']} total")
        return success

    def test_create_automation(self):
        """Test creating an automation"""
        if not self.token:
            self.log_test_result("Create Automation", False, None, None, "No token available")
            return False
        
        success, response = self.run_test(
            "Create Automation",
            "POST",
            "/automations",
            200,
            data={
                "name": f"Test Automation {datetime.now().strftime('%H%M%S')}",
                "description": "Test automation for API testing",
                "trigger": "New email received",
                "action": "Send notification",
                "category": "custom"
            }
        )
        return success, response.get('id') if success else None

    def test_get_automations(self):
        """Test getting user automations"""
        if not self.token:
            self.log_test_result("Get Automations", False, None, None, "No token available")
            return False
        
        success, response = self.run_test("Get Automations", "GET", "/automations", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} automations")
        return success

    def test_toggle_automation(self, automation_id):
        """Test toggling an automation"""
        if not self.token or not automation_id:
            self.log_test_result("Toggle Automation", False, None, None, "No token or automation ID")
            return False
        
        return self.run_test(
            "Toggle Automation",
            "PUT",
            f"/automations/{automation_id}/toggle",
            200
        )[0]

    def test_delete_automation(self, automation_id):
        """Test deleting an automation"""
        if not self.token or not automation_id:
            self.log_test_result("Delete Automation", False, None, None, "No token or automation ID")
            return False
        
        return self.run_test(
            "Delete Automation",
            "DELETE",
            f"/automations/{automation_id}",
            200
        )[0]

    def test_ai_suggestion(self):
        """Test AI suggestion endpoint"""
        if not self.token:
            self.log_test_result("AI Suggestion", False, None, None, "No token available")
            return False
        
        success, response = self.run_test(
            "AI Suggestion",
            "POST",
            "/ai/suggest",
            200,
            data={"message": "Send weekly sales report to my manager"}
        )
        if success and 'suggestion' in response:
            suggestion = response['suggestion']
            if isinstance(suggestion, dict) and 'name' in suggestion:
                print(f"   AI suggested: {suggestion.get('name')}")
        return success

    def test_activity_log(self):
        """Test activity log endpoint"""
        if not self.token:
            self.log_test_result("Activity Log", False, None, None, "No token available")
            return False
        
        success, response = self.run_test("Activity Log", "GET", "/activity", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} activity entries")
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Flow-Forge API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic endpoints (no auth needed)
        self.test_health_endpoint()
        self.test_templates_endpoint()
        
        # Authentication
        self.test_login_existing_user()
        self.test_register_new_user()
        
        # Authenticated endpoints
        if self.token:
            self.test_get_current_user()
            self.test_onboarding()
            self.test_dashboard_stats()
            
            # Automation CRUD
            automation_created, automation_id = self.test_create_automation()
            self.test_get_automations()
            
            if automation_id:
                self.test_toggle_automation(automation_id)
                self.test_delete_automation(automation_id)
            
            # Other endpoints
            self.test_ai_suggestion()
            self.test_activity_log()
        else:
            print("⚠️  Skipping authenticated tests - login failed")
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test.get('error', 'Unknown error')}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = FlowForgeAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results to JSON file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed': tester.tests_passed,
                'failed': tester.tests_run - tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%",
                'timestamp': datetime.now().isoformat()
            },
            'results': tester.test_results
        }, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())