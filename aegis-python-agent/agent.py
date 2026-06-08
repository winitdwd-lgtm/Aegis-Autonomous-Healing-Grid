import subprocess
import requests
import json
import os

BRAIN_URL = "http://localhost:8081/api/heal"
TARGET_FILE = "target.py"

print("========================================")
print("🛡️ AEGIS PYTHON SIDECAR: ONLINE")
print("========================================")

def start_server():
    print("[SIDECAR] Launching target.py in protective bubble...")
    
    # Run the Python server and capture its output
    process = subprocess.Popen(
        ['python', TARGET_FILE], 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE,
        text=True
    )

    while True:
        # Read the normal logs
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())

    # If the process died, grab the error log!
    error_log = process.stderr.read()
    if error_log:
        print("\n🚨 [CRASH DETECTED] Python Traceback caught! 🚨")
        print("-> " + error_log.strip().split('\n')[-1]) # Print just the last line of the error
        initiate_healing_sequence(error_log)

def initiate_healing_sequence(error_log):
    print("\n[SIDECAR] Reading broken source code...")
    with open(TARGET_FILE, 'r') as file:
        broken_code = file.read()

    print("[SIDECAR] Transmitting JSON payload to Central Brain API (Port 8081)...")
    payload = {
        "language": "python",
        "brokenCode": broken_code,
        "errorLog": error_log
    }

    try:
        response = requests.post(BRAIN_URL, json=payload)
        data = response.json()

        if data['status'] == 'success':
            print("[SIDECAR] Patch received! Applying Hot-Swap...")
            
            # Overwrite the target.py file with the fixed code!
            with open(TARGET_FILE, 'w') as file:
                file.write(data['fixedCode'])
                
            print("========================================")
            print("⚡ RESURRECTION SEQUENCE INITIATED ⚡")
            print("========================================")
            start_server() # Reboot!
            
    except Exception as e:
        print(f"[CRITICAL] Failed to contact Central Brain. {e}")

# Turn it on!
start_server()