import redis
import json
import os
import time
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Connections
r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

mongo = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/ai-tasks"))
db = mongo["ai-tasks"]
tasks_col = db["tasks"]

def process_operation(input_text, operation):
    if operation == "uppercase":
        return input_text.upper()
    elif operation == "lowercase":
        return input_text.lower()
    elif operation == "reverse":
        return input_text[::-1]
    elif operation == "wordcount":
        count = len(input_text.split())
        return f"Word count: {count}"
    else:
        raise ValueError(f"Unknown operation: {operation}")

def add_log(task_id, message):
    tasks_col.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"logs": {"message": message, "timestamp": datetime.utcnow()}}}
    )

def run_worker():
    print("Worker started. Waiting for jobs...")
    while True:
        try:
            # Blocking pop - waits for job (timeout 5 sec)
            job = r.brpop("task_queue", timeout=5)
            if not job:
                continue

            _, payload = job
            data = json.loads(payload)
            task_id = data["taskId"]
            input_text = data["inputText"]
            operation = data["operation"]

            print(f"Processing task {task_id} - {operation}")

            # Mark as running
            tasks_col.update_one(
                {"_id": ObjectId(task_id)},
                {"$set": {"status": "running"}}
            )
            add_log(task_id, f"Task started: {operation}")

            time.sleep(1)  # Simulate processing

            try:
                result = process_operation(input_text, operation)
                tasks_col.update_one(
                    {"_id": ObjectId(task_id)},
                    {"$set": {"status": "success", "result": result}}
                )
                add_log(task_id, f"Completed successfully")
                print(f"Task {task_id} completed")
            except Exception as e:
                tasks_col.update_one(
                    {"_id": ObjectId(task_id)},
                    {"$set": {"status": "failed"}}
                )
                add_log(task_id, f"Error: {str(e)}")
                print(f"Task {task_id} failed: {e}")

        except redis.exceptions.ConnectionError:
            print("Redis connection lost. Retrying in 5s...")
            time.sleep(5)
        except Exception as e:
            print(f"Worker error: {e}")
            time.sleep(2)

if __name__ == "__main__":
    run_worker()