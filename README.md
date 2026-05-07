
# AI Task Processing Platform

A full-stack AI task processing platform built with MERN stack, Python worker, Docker, Kubernetes, and Argo CD.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Worker**: Python
- **Database**: MongoDB
- **Queue**: Redis
- **Container**: Docker
- **Orchestration**: Kubernetes
- **GitOps**: Argo CD
- **CI/CD**: GitHub Actions

## Supported Operations
- Uppercase
- Lowercase
- Reverse string
- Word count

## Local Development Setup

### Prerequisites
- Docker Desktop
- Node.js 20+
- Python 3.11+

### Run Locally
``````bash
git clone https://github.com/Anam-Parwez-code/ai-task-platform.git
cd ai-task-platform
docker compose up --build
``````
Open http://localhost:3000

## Kubernetes Deployment

### Prerequisites
- kubectl
- Kubernetes cluster (Docker Desktop / k3s)
- Argo CD installed

### Deploy with kubectl
``````bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/worker.yaml
kubectl apply -f k8s/frontend.yaml
``````

### Deploy with Argo CD
``````bash
kubectl apply -f argocd-app.yaml
``````

## CI/CD
GitHub Actions automatically:
1. Runs lint checks
2. Builds Docker images
3. Pushes to Docker Hub
4. Updates image tags in infra repo
5. Argo CD auto-syncs

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | JWT signing secret |
| REDIS_HOST | Redis host |
| REDIS_PORT | Redis port |

## Architecture
See architecture.md for detailed system design.

## Repositories
- App: https://github.com/Anam-Parwez-code/ai-task-platform
- Infra: https://github.com/Anam-Parwez-code/ai-task-platform-infra
