import requests
import threading
import time

TARGET_URL = "http://localhost:5001/api/telemetry"

def attack_flood():
    while True:
        try:
            requests.get(TARGET_URL)
        except requests.exceptions.RequestException:
            pass

print("Launching simulated HTTP Flood against localhost:5001...")

threads = []
for i in range(50):
    t = threading.Thread(target=attack_flood)
    t.daemon = True
    threads.append(t)
    t.start()

time.sleep(15)
print("Simulated attack finished.")
