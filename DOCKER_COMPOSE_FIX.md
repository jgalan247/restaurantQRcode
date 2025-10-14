# Docker Compose Service Name Fix

## Issue
The docker-compose.yml file uses `postgres` as the service name, not `db`.

## ✅ Fixed in All Scripts

All scripts have been updated to use the correct service name:

- ✅ `install_and_start.sh` - Updated to use `docker-compose up -d postgres`
- ✅ `ADMIN_QUICK_START.sh` - Updated to use `docker-compose up -d postgres`
- ✅ `backend/setup_and_run.sh` - Updated documentation

## Correct Commands

### Start Database
```bash
docker-compose up -d postgres
```

### Stop Database
```bash
docker-compose down
```

### View Database Logs
```bash
docker-compose logs postgres
```

### Check Database Status
```bash
docker-compose ps postgres
```

### Restart Database
```bash
docker-compose restart postgres
```

### Access Database CLI
```bash
docker-compose exec postgres psql -U lahacienda -d lahacienda
```

## Database Configuration

From `docker-compose.yml`:
- **Service Name**: `postgres`
- **Container Name**: `lahacienda-db`
- **Database Name**: `lahacienda`
- **Username**: `lahacienda`
- **Password**: `password123`
- **Port**: `5432` (mapped to localhost:5432)

## Connection String

For local development (outside Docker):
```
postgresql+asyncpg://lahacienda:password123@localhost:5432/lahacienda
```

For backend service (inside Docker):
```
postgresql+asyncpg://lahacienda:password123@lahacienda-db:5432/lahacienda
```

## Running the Installer Again

Now you can run:
```bash
./install_and_start.sh
```

It will correctly start the `postgres` service!
