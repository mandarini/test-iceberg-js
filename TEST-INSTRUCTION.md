# Testing iceberg-js with Local Docker Catalog

This guide shows you how to test `iceberg-js` against a local Iceberg REST Catalog running in Docker.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and npm

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Docker Services

Start the Iceberg REST Catalog and MinIO:

```bash
# Start the Iceberg REST Catalog
docker compose up -d

# Verify it's running
curl http://localhost:8181/v1/config
```

### 3. Run the Test Script

```bash
# Run the test script
npx tsx test-local.ts

# Stop containers when done
docker compose down -v
```

This starts:

- **Iceberg REST Catalog** on `http://localhost:8181`
- **MinIO** (S3-compatible storage) on `http://localhost:9000` (API) and `http://localhost:9001` (Console)

## Accessing MinIO Console

You can view the underlying S3 storage:

1. Open http://localhost:9001 in your browser
2. Login with:
   - Username: `supa-storage`
   - Password: `secret1234`
3. Navigate to the `warehouse--table-s3` bucket to see table data

## Stopping the Catalog

```bash
# Stop containers but keep data
docker compose stop

# Stop and remove containers + data
docker compose down -v
```

## Troubleshooting

### Port already in use

If port 8181 or 9000 is already taken, edit `docker-compose.yml` and change the ports:

```yaml
ports:
  - "8182:8181" # Use 8182 instead of 8181
```

Then update `test-local.ts` to use the new port.

### Catalog not responding

Wait a few seconds after `docker-compose up` for the services to fully start:

```bash
# Check logs
docker compose logs -f iceberg-rest

# Wait for "Started ServerConnector" message
```

## What's Running?

- **Iceberg REST Catalog** (`tabulario/iceberg-rest`): Official Apache Iceberg REST catalog implementation
- **MinIO**: S3-compatible object storage where table data and metadata are stored

This setup matches the configuration used in the Supabase Storage repository for consistency.
