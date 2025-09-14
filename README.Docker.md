# Docker Deployment Guide

This document explains how to run the World Referral System using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system
- Basic understanding of Docker and environment variables

## Quick Start

1. **Clone the repository and navigate to the project directory:**
   ```bash
   git clone <your-repo-url>
   cd WorldReferralSystem
   ```

2. **Create environment configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Edit the `.env` file with your actual configuration:**
   ```bash
   nano .env
   ```
   
   Make sure to update:
   - `WORLDID_CLIENT_ID` - Your World ID app client ID
   - `WORLDID_CLIENT_SECRET` - Your World ID app client secret
   - `SESSION_SECRET` - A secure random string for session encryption
   - `NEXTAUTH_SECRET` - A secure random string for NextAuth encryption

4. **Build and start the services:**
   ```bash
   docker-compose up --build
   ```

5. **Access the application:**
   - Application: http://localhost:8000
   - Database: localhost:5432 (postgres/password123)

## Services

### PostgreSQL Database
- **Image:** postgres:15-alpine
- **Port:** 5432
- **Database:** worldref
- **Username:** postgres
- **Password:** password123

### World Referral System App
- **Build:** Uses local Dockerfile
- **Port:** 8000
- **Environment:** Production-ready configuration

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `SESSION_SECRET` | Session encryption key | Yes | - |
| `WORLDID_CLIENT_ID` | World ID OAuth client ID | Yes | - |
| `WORLDID_CLIENT_SECRET` | World ID OAuth client secret | Yes | - |
| `NEXTAUTH_SECRET` | NextAuth encryption key | Yes | - |
| `NEXTAUTH_URL` | Application base URL | Yes | http://localhost:8000 |
| `NODE_ENV` | Node.js environment | No | production |
| `PORT` | Application port | No | 8000 |

## Docker Commands

### Start services (detached)
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Stop services
```bash
docker-compose down
```

### Rebuild and restart
```bash
docker-compose down
docker-compose up --build
```

### Run database migrations
```bash
docker-compose exec app npm run db:push
```

## Volumes

- **postgres_data:** Persistent storage for PostgreSQL data

## Health Checks

- **Application:** http://localhost:8000/api/health
- **Database:** Automatic PostgreSQL health checks

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is healthy: `docker-compose ps`
2. Check database logs: `docker-compose logs postgres`
3. Verify DATABASE_URL format

### Application Won't Start
1. Check application logs: `docker-compose logs app`
2. Verify all required environment variables are set
3. Ensure database is ready before app starts

### Port Conflicts
If port 8000 or 5432 are in use:
1. Stop conflicting services
2. Modify ports in docker-compose.yml
3. Update NEXTAUTH_URL accordingly

## Production Considerations

1. **Security:**
   - Use strong, unique secrets for all encryption keys
   - Enable HTTPS in production
   - Configure proper firewall rules

2. **Database:**
   - Use external PostgreSQL service for production
   - Set up regular backups
   - Monitor database performance

3. **Monitoring:**
   - Set up application monitoring
   - Configure log aggregation
   - Monitor Docker container health

4. **Scaling:**
   - Use load balancer for multiple app instances
   - Consider read replicas for database
   - Implement caching layer if needed