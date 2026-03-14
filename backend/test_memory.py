import urllib.request
import json
import time

def send_chat(message: str, session_id: str):
    data = json.dumps({'message': message, 'intent': 'cat_prep', 'sessionId': session_id}).encode()
    req = urllib.request.Request('http://localhost:5000/api/chat', data=data, headers={'Content-Type': 'application/json', 'x-demo-session-id': 'memory-test-1'})
    
    try:
        response = urllib.request.urlopen(req)
        res = json.loads(response.read().decode())
        print(f"User: {message}")
        print(f"AI: {res.get('reply', '')[:100]}...\n")
        return res.get('sessionId')
    except Exception as e:
        print("Error:", e)

sid = send_chat("What are the important questions for FAT?", "")
time.sleep(1)
if sid:
    send_chat("give me easier questions", sid)
