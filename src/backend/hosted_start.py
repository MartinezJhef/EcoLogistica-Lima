"""Single free web instance: API plus durable report worker subprocess."""
import os
import subprocess
import sys
import uvicorn


if __name__ == '__main__':
    worker = subprocess.Popen([sys.executable, 'report_worker.py'])
    try:
        uvicorn.run('main:app', host='0.0.0.0', port=int(os.getenv('PORT', '8000')))
    finally:
        worker.terminate()
        worker.wait(timeout=10)
