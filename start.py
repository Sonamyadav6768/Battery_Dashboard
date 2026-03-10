import subprocess
import sys
import os
import time
import signal
import threading

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.join(ROOT, "backend")
FRONTEND = os.path.join(ROOT, "frontend")

processes = []

def stream_output(proc, prefix):
    for line in iter(proc.stdout.readline, b''):
        print(f"[{prefix}] {line.decode().rstrip()}")

def start_backend():
    print("🔵 Starting FastAPI backend on http://localhost:8000 ...")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
        cwd=BACKEND,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    processes.append(proc)
    t = threading.Thread(target=stream_output, args=(proc, "BACKEND"), daemon=True)
    t.start()
    return proc

def start_frontend():
    print("🟢 Starting React frontend on http://localhost:5173 ...")
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=(sys.platform == "win32"),
    )
    processes.append(proc)
    t = threading.Thread(target=stream_output, args=(proc, "FRONTEND"), daemon=True)
    t.start()
    return proc

def shutdown(sig, frame):
    print("\n🛑 Shutting down both servers...")
    for p in processes:
        p.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

if __name__ == "__main__":
    backend = start_backend()
    time.sleep(2) 
    frontend = start_frontend()

    print("\n✅ Both servers running!")
    print("   Backend  → http://localhost:8000")
    print("   Frontend → http://localhost:5173")
    print("   API Docs → http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop both.\n")

    backend.wait()
