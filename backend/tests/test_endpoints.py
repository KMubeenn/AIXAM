import urllib.request
import urllib.error
import urllib.parse
import json
import sys
import time

BASE_URL = "http://127.0.0.1:8000"

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def check_endpoint(method, path, data=None, description=""):
    url = f"{BASE_URL}{path}"
    print(f"Checking {method} {url}...", end=" ")
    
    req = urllib.request.Request(url, method=method)
    
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        req.data = json_data
        
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            print(f"{GREEN}[OK] {status}{RESET} - {description}")
            return True, status
    except urllib.error.HTTPError as e:
        if e.code in [401, 403]: # Auth required is technically a "success" in terms of "endpoint exists"
            print(f"{YELLOW}[AUTH (OK)] {e.code}{RESET} - {description} (Endpoint exists, requires auth)")
            return True, e.code
        elif e.code == 400: # Bad Request means endpoint exists and validation is working
            print(f"{YELLOW}[INPUT (OK)] {e.code}{RESET} - {description} (Endpoint exists, validation active)")
            return True, e.code
        elif e.code == 405: # Method not allowed means endpoint exists
            print(f"{YELLOW}[METHOD (OK)] {e.code}{RESET} - {description} (Endpoint exists, wrong method)")
            return True, e.code
        else:
            print(f"{RED}[FAIL] {e.code}{RESET} - {description}")
            return False, e.code
    except urllib.error.URLError as e:
        print(f"{RED}[FAIL] Connection Error: {e.reason}{RESET} - Is the server running?")
        return False, 0
    except Exception as e:
        print(f"{RED}[FAIL] Error: {e}{RESET}")
        return False, 0

def run_tests():
    print(f"=== Testing API Endpoints on {BASE_URL} ===\n")
    
    # 1. Health Checks
    print("--- Core / Health ---")
    check_endpoint("GET", "/api/health/", description="Health Check Root")
    check_endpoint("GET", "/api/health/status/", description="Health Status")
    check_endpoint("GET", "/api/health/system/", description="System Health")
    
    # 2. Authentication
    print("\n--- Authentication ---")
    # Using dummy data for structure check
    check_endpoint("POST", "/api/auth/signup/", data={"username": "test", "password": "pwd"}, description="Signup") 
    check_endpoint("POST", "/api/auth/login/", data={"username": "test", "password": "pwd"}, description="Login")
    
    # 3. Chat (URLs cleaned up)
    print("\n--- Chat ---")
    check_endpoint("POST", "/api/chat/", description="Chat Endpoint") 
    check_endpoint("POST", "/api/chat/voice/", description="Voice Endpoint")
    check_endpoint("GET", "/api/chat/sessions/", description="Chat Sessions List")
    
    # 4. Analytics
    print("\n--- Analytics ---")
    check_endpoint("GET", "/api/analytics/", description="Token Usage Summary")
    check_endpoint("GET", "/api/analytics/admin/usage", description="Admin Token Usage")

if __name__ == "__main__":
    try:
        run_tests()
    except KeyboardInterrupt:
        print("\nTest interrupted.")
