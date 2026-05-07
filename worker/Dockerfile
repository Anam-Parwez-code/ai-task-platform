FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim
RUN useradd -r -u 1001 workeruser
WORKDIR /app
COPY --from=builder /root/.local /home/workeruser/.local
COPY worker.py .
USER workeruser
ENV PATH=/home/workeruser/.local/bin:$PATH
CMD ["python", "worker.py"]