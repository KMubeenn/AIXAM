import urllib.request
import urllib.parse
import urllib.error
import json
import time
import sys
import uuid

# Configuration
BASE_URL = "http://127.0.0.1:8000"
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
CYAN = "\033[96m"

def log(msg, color=RESET):
    print(f"{color}{msg}{RESET}")

def get_auth_token():
    """Register/Login to get a valid token."""
    unique_id = int(time.time())
    email = f"frontend_test_{unique_id}@example.com"
    password = "Start123!"
    
    # Signup
    url = f"{BASE_URL}/api/auth/signup/"
    data = json.dumps({"email": email, "password": password, "name": "Frontend Tester"}).encode()
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method="POST")
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_json = json.loads(resp.read().decode())
            log(f"[Auth] Signup successful for {email}", GREEN)
            return res_json['token']
    except Exception as e:
        log(f"[Auth] Signup failed: {e}", RED)
        return None

def create_session(token):
    """Create a new chat session."""
    url = f"{BASE_URL}/api/chat/sessions/"
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'}, method="POST") # Empty POST for new session
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_json = json.loads(resp.read().decode())
            session_id = res_json['id']
            log(f"[Session] Created session: {session_id}", GREEN)
            return session_id
    except Exception as e:
        log(f"[Session] Creation failed: {e}", RED)
        return None

def test_chat_frontend_style(token, session_id):
    """
    Simulate exact frontend request:
    - URL: /api/chat/
    - Method: POST
    - Headers: Authorization: Bearer <token>
    - Content-Type: application/x-www-form-urlencoded (standard form submission)
    - Body: session_id=...&message=...
    """
    url = f"{BASE_URL}/api/chat/"
    
    # Data to send (Frontend sends this as FormData)
    form_data = {
        "session_id": session_id,
        "message": "tell me about yourself "
    }
    encoded_data = urllib.parse.urlencode(form_data).encode('utf-8')
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/x-www-form-urlencoded", # Critical for request.POST in Django
        "Connection": "keep-alive"
    }
    
    log(f"\n[Chat] Sending request to {url}...", CYAN)
    log(f"[Chat] Payload: {form_data}", CYAN)
    
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method="POST")
    
    try:
        start_time = time.time()
        with urllib.request.urlopen(req) as response:
            log(f"[Chat] Response Status: {response.status}", GREEN)
            
            # Read streaming response
            print(f"{GREEN}[Server Response] > {RESET}", end="", flush=True)
            full_response = ""
            while True:
                chunk = response.read(1024) # Read chunks
                if not chunk:
                    break
                text_chunk = chunk.decode('utf-8', errors='ignore')
                print(text_chunk, end="", flush=True)
                full_response += text_chunk
                
            print("\n") # End line
            log(f"[Chat] Stream finished in {time.time() - start_time:.2f}s", CYAN)
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        log(f"[Chat] Request Failed: {e.code} - {e.reason}", RED)
        log(f"[Chat] Server Error Detail: {error_body}", RED)
    except Exception as e:
        log(f"[Chat] Unexpected Error: {e}", RED)

if __name__ == "__main__":
    log("=== Frontend Mimic Test Started ===", CYAN)
    token = get_auth_token()
    if token:
        session_id = create_session(token)
        if session_id:
            test_chat_frontend_style(token, session_id)
