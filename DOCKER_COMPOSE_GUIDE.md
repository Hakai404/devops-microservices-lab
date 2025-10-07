# Docker Compose Orchestration Guide

This guide explains how to use Docker Compose to run the entire Expenses Management System locally.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0 or higher

## Quick Start

### 1. Start all services (except Lake Publisher)

```bash
docker-compose up -d
```

### 2. View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### 3. Check service health

```bash
docker-compose ps
```

### 4. Stop all services

```bash
docker-compose down
```

## Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| **MongoDB** | 27017 | Database | `mongosh ping` |
| **RabbitMQ** | 5672, 15672 | Message Queue | `rabbitmq-diagnostics ping` |
| **Backend** | 3000 | API Server | HTTP GET `/` |
| **Frontend** | 3030 | Web UI | HTTP GET `/` |
| **Processor** | - | Message Consumer | No health check |
| **Lake Publisher** | - | Batch Export | Profile: analytics |

## Service Dependencies

The startup order is managed automatically:

```
MongoDB + RabbitMQ (parallel)
    ↓
Backend (waits for MongoDB & RabbitMQ healthy)
    ↓
Frontend + Processor (wait for Backend healthy)
    ↓
Lake Publisher (optional, profile: analytics)
```

## Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```bash
cp .env.example .env
```

Key variables:
- `JWT_SECRET`: Secret for JWT token signing
- `LAKEPUBLISHER_TOKEN`: API token for Lake Publisher

## Advanced Usage

### Start with Lake Publisher

The Lake Publisher runs as a one-time job for exporting data. Start it using the `analytics` profile:

```bash
docker-compose --profile analytics up -d
```

Or run it once:

```bash
docker-compose run --rm lakepublisher
```

### Rebuild specific service

```bash
docker-compose build backend
docker-compose up -d backend
```

### Scale the processor

```bash
docker-compose up -d --scale processor=3
```

### View real-time logs

```bash
docker-compose logs -f backend processor
```

### Clean everything (including volumes)

```bash
docker-compose down -v
```

## Persistent Data

Data is stored in named Docker volumes:

- `mongodb_data`: Database files
- `rabbitmq_data`: Message queue data
- `backend_uploads`: Uploaded expense files
- `processor_messages`: Processed message files
- `lakepublisher_data`: Exported Parquet files

### Backup volumes

```bash
docker run --rm -v expenses_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz /data
```

### Restore volumes

```bash
docker run --rm -v expenses_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /
```

## Health Checks

Each service has configured health checks:

- **MongoDB**: Checks database connectivity every 10s
- **RabbitMQ**: Verifies message broker every 10s
- **Backend**: HTTP probe on port 3000 every 10s
- **Frontend**: HTTP probe on port 80 every 10s

Services won't be marked as healthy until checks pass.

## Networking

All services communicate via the `expenses-network` bridge network.

Internal DNS resolution:
- Backend: `http://backend:3000`
- MongoDB: `mongodb://mongodb:27017`
- RabbitMQ: `amqp://rabbitmq`

## Troubleshooting

### Service won't start

Check dependencies are healthy:
```bash
docker-compose ps
```

### View service logs

```bash
docker-compose logs backend
```

### Restart a service

```bash
docker-compose restart backend
```

### Rebuild after code changes

```bash
docker-compose up -d --build
```

### Clean restart

```bash
docker-compose down
docker-compose up -d --build
```

## Access Points

Once running:
- **Frontend**: http://localhost:3030
- **Backend API**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MongoDB**: mongodb://localhost:27017

## Development Workflow

1. **Start infrastructure**:
   ```bash
   docker-compose up -d mongodb rabbitmq
   ```

2. **Start backend**:
   ```bash
   docker-compose up -d backend
   ```

3. **Start frontend**:
   ```bash
   docker-compose up -d frontend
   ```

4. **Start processor**:
   ```bash
   docker-compose up -d processor
   ```

5. **Run lake publisher** (when needed):
   ```bash
   docker-compose run --rm lakepublisher
   ```

## Production Considerations

For production deployment:

1. Change default credentials in `.env`
2. Enable authentication on MongoDB
3. Use secrets management for sensitive data
4. Configure proper volume backup strategy
5. Set up monitoring and alerting
6. Use specific image tags instead of `latest`
7. Configure resource limits
8. Enable TLS/SSL on all services
