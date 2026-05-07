
# Architecture Document - AI Task Processing Platform

## System Overview
The platform processes AI tasks asynchronously using a queue-based architecture.
Users submit tasks via the React frontend, the Node.js backend saves them to MongoDB
and pushes jobs to Redis queue. Python workers pick up jobs and process them.

---

## 1. Worker Scaling Strategy

Workers are stateless and consume jobs from a shared Redis queue using BRPOP
(blocking pop). This ensures each job is processed by exactly one worker.

**Horizontal Scaling:**
- Kubernetes Deployment with replicas: 3
- Each worker independently pulls from Redis queue
- No coordination needed between workers
- Scale up: kubectl scale deployment/worker --replicas=10

**Auto-scaling with KEDA (future):**
- Monitor Redis queue length
- Scale workers up when queue > 100 jobs
- Scale down when queue is empty

---

## 2. Handling 100k Tasks Per Day

**Math:**
- 100,000 tasks/day = ~1.2 tasks/second average
- Peak load assumption: 10x average = 12 tasks/second

**Strategy:**
- Redis queue acts as buffer - absorbs traffic spikes
- 3-5 worker replicas handle 12 tasks/second easily
- MongoDB with proper indexing handles write load
- Backend API: 2 replicas with rate limiting

**Bottlenecks and Solutions:**
| Component | Limit | Solution |
|-----------|-------|----------|
| Redis | Single instance | Redis Cluster for HA |
| MongoDB | Single node | MongoDB Atlas / Replica Set |
| Workers | 3 replicas | Scale to 10+ replicas |
| Backend | 2 replicas | Scale behind load balancer |

---

## 3. Database Indexing Strategy

**Collections:**
- users: indexed on email (unique)
- tasks: compound index on userId + createdAt

**Indexes applied:**
``````javascript
// Task queries by user (most common)
taskSchema.index({ userId: 1, createdAt: -1 })

// Admin/monitoring queries by status
taskSchema.index({ status: 1 })

// Auto-cleanup old tasks (TTL index)
taskSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })
``````

**Query patterns optimized:**
- Get all tasks for user: uses userId + createdAt index
- Filter by status: uses status index
- Dashboard stats: uses status index with aggregation

---

## 4. Handling Redis Failure

**Detection:**
- Worker has retry logic with exponential backoff
- Reconnects automatically every 50ms to 2000ms

**Recovery Strategy:**
1. Tasks already saved in MongoDB with status 'pending'
2. On Redis recovery, a cron job re-queues pending tasks
3. Workers resume processing automatically

**Production Solution:**
- Redis Sentinel for automatic failover
- Or Redis Cluster with 3 master nodes
- BullMQ library for more robust queue management

**Code in worker.py:**
``````python
except redis.exceptions.ConnectionError:
    print("Redis down, retrying in 5s...")
    time.sleep(5)
``````

---

## 5. Staging and Production Environments

**Repository Structure:**