import time

print("[PYTHON SERVER] Booting up...")
count = 0

while True:
    count += 1
    print(f"[PYTHON SERVER] Processing request #{count}")
    time.sleep(1)
    
    # THE TIME BOMB BUG: Crashes on loop 3!
    if count == 3:
        print("[PYTHON SERVER] Uh oh. Math error avoided!")
        # The line 'x = 100 / 0' caused a ZeroDivisionError.
        # It has been removed to fix the crash.