# Docker & Docker Compose Troubleshooting Guide

This guide details common Docker issues encountered when running **CampusStock** along with practical diagnostic commands and remediation steps.

---

## 1. Container Port Conflicts (`port is already allocated`)

### Symptom
```
Error response from daemon: driver failed programming external connectivity on endpoint campusstock-backend: Bind for 0.0.0.0:8000 failed: port is already allocated
```

### Root Cause
Another local process (e.g. an existing uvicorn instance, local PostgreSQL, or an orphaned container) is already bound to ports `5432`, `8000`, `3000`, or `9090`.

### Solution
1. Identify the process utilizing the port:
   - **Windows PowerShell**:
     ```powershell
     Get-NetTCPConnection -LocalPort 8000, 5432, 3000 | Format-Table -Property LocalAddress, LocalPort, OwningProcess, State
     Stop-Process -Id <OwningProcessId> -Force
     ```
   - **Linux / macOS**:
     ```bash
     lsof -i :8000 -i :5432
     kill -9 <PID>
     ```
2. Stop lingering Docker containers:
   ```bash
   docker stop $(docker ps -q)
   docker compose down -v
   ```

---

## 2. PostgreSQL Healthcheck Failures / Backend Connection Refused

### Symptom
```
backend service failed to start: dependency failed to start: container campusstock-postgres is unhealthy
```
or
```
psycopg2.OperationalError: could not connect to server: Connection refused
```

### Root Cause
PostgreSQL initialized slowly or an existing corrupted volume prevented the daemon from accepting connections before the healthcheck timed out.

### Solution
1. Inspect the PostgreSQL container logs:
   ```bash
   docker logs campusstock-postgres
   ```
2. Verify PostgreSQL readiness manually:
   ```bash
   docker exec -it campusstock-postgres pg_isready -U campus_user -d campusstock_db
   ```
3. Reset stale data volumes and restart:
   ```bash
   docker compose down -v
   docker compose up -d --build
   ```

---

## 3. Database Migration Desynchronization (`alembic upgrade head`)

### Symptom
```
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedTable) relation "items" does not exist
```

### Root Cause
The database container is up, but migrations have not yet been applied to the new database instance.

### Solution
Run the migration inside the backend container:
```bash
docker compose exec backend alembic upgrade head
```
Verify the tables:
```bash
docker compose exec postgres psql -U campus_user -d campusstock_db -c "\dt"
```

---

## 4. Permission Denied in Backend Container (Non-Root User)

### Symptom
```
PermissionError: [Errno 13] Permission denied: '/app/alembic.ini'
```

### Root Cause
File ownership in the container was not granted to the non-root `appuser:appgroup` during image build.

### Solution
Ensure `COPY --chown=appuser:appgroup` is specified in `backend/Dockerfile`. Rebuild without cache:
```bash
docker compose build --no-cache backend
docker compose up -d backend
```

---

## 5. Nginx Reverse Proxy `502 Bad Gateway` on `/api`

### Symptom
When opening `http://localhost:3000/api/items`, the browser receives `502 Bad Gateway`.

### Root Cause
The frontend Nginx container cannot reach `http://backend:8000` because the backend container is either starting up, crashed, or not sharing the same Docker network.

### Solution
1. Verify backend container status:
   ```bash
   docker compose ps backend
   docker logs campusstock-backend
   ```
2. Test network resolution from inside the frontend container:
   ```bash
   docker compose exec frontend wget -qO- http://backend:8000/health
   ```
