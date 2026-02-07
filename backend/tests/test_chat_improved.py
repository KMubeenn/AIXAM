import urllib.request
import urllib.parse
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000"

# Colors
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
CYAN = "\033[96m"
YELLOW = "\033[93m"

def log(msg, color=RESET):
    print(f"{color}{msg}{RESET}")

def make_request(method, endpoint, data=None, headers=None, is_json=True, is_form=False):
    url = f"{BASE_URL}{endpoint}"
    req_headers = headers or {}
    
    encoded_data = None
    if data:
        if is_json:
            encoded_data = json.dumps(data).encode('utf-8')
            req_headers['Content-Type'] = 'application/json'
        elif is_form:
            encoded_data = urllib.parse.urlencode(data).encode('utf-8')
            req_headers['Content-Type'] = 'application/x-www-form-urlencoded'
            
    req = urllib.request.Request(url, method=method, headers=req_headers)
    
    try:
        with urllib.request.urlopen(req, data=encoded_data) as response:
            status = response.status
            body = response.read()
            try:
                text = body.decode('utf-8')
                return status, json.loads(text)
            except:
                return status, text
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        log(f"HTTP Error {e.code}:", RED)
        log(f"Response body (first 500 chars):\n{body[:500]}", YELLOW)
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        log(f"Error: {e}", RED)
        return 0, None

def run_flow():
    log("=== Starting Chat Test Flow ===\n", CYAN)
    
    # 1. Signup
    unique_id = int(time.time())
    email = f"testuser_{unique_id}@example.com"
    password = "Start123!"
    name = "Test User"
    
    log(f"1. Testing Signup ({email})...")
    status, res = make_request("POST", "/api/auth/signup/", {
        "email": email,
        "password": password,
        "name": name
    })
    
    if status in [200, 201]:
        log(f"[OK] Signup Successful. User ID: {res.get('user', {}).get('id')}", GREEN)
    else:
        log(f"[FAIL] Signup Failed: {status} - {res}", RED)
        return

    # 2. Login
    log(f"\n2. Testing Login...")
    status, res = make_request("POST", "/api/auth/login/", {
        "email": email,
        "password": password
    })
    
    if status == 200:
        token = res.get("token")
        log(f"[OK] Login Successful. Token obtained.", GREEN)
    else:
        log(f"[FAIL] Login Failed: {status} - {res}", RED)
        return

    auth_headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Session
    log(f"\n3. Creating Chat Session...")
    status, res = make_request("POST", "/api/chat/sessions/", {
        "title": f"Test Session {unique_id}"
    }, headers=auth_headers)
    
    if status == 201:
        session_id = res.get("id")
        log(f"[OK] Session Created. ID: {session_id}", GREEN)
    else:
        log(f"[FAIL] Create Session Failed: {status} - {res}", RED)
        return

    # 4. Send Message (Chat) - Testing with form data
    log(f"\n4. Sending Chat Message (Form Data)...")
    message_data = {
        "session_id": session_id,
        "message": "Hello, this is a test message."
    }
    
    status, res = make_request("POST", "/api/chat/", message_data, headers=auth_headers, is_json=False, is_form=True)
    
    if status == 200:
        log(f"[OK] Chat Response Received:", GREEN)
        print(f"Server replied: {str(res)[:200]}...")
    else:
        log(f"[FAIL] Chat Message Failed: {status}", RED)
        # The error details are already printed in make_request

    # 5. Try with JSON data too
    log(f"\n5. Sending Chat Message (JSON Data - alternative)...")
    status, res = make_request("POST", "/api/chat/", message_data, headers=auth_headers, is_json=True)
    
    if status == 200:
        log(f"[OK] Chat Response Received:", GREEN)
        print(f"Server replied: {str(res)[:200]}...")
    else:
        log(f"[FAIL] Chat Message Failed: {status}", RED)

    log("\n=== Test Flow Complete ===", CYAN)

if __name__ == "__main__":
    run_flow()