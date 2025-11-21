# test-iceberg-js

A test project for the [`iceberg-js`](https://github.com/supabase/iceberg-js) library, demonstrating how to interact with an Apache Iceberg REST Catalog running locally via Docker.

## Overview

This project provides a simple test suite that validates `iceberg-js` functionality against a local Iceberg REST Catalog. It demonstrates common operations such as:

- Creating and listing namespaces
- Creating tables with schemas
- Loading table metadata
- Updating table properties
- Managing table lifecycle

## Prerequisites

- **Node.js** 20+
- **Docker** and **Docker Compose**
- **npm** or **pnpm** (for package management)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Docker Services

Start the Iceberg REST Catalog and MinIO storage:

```bash
docker compose up -d
```

This starts:

- **Iceberg REST Catalog** on `http://localhost:8181`
- **MinIO** (S3-compatible storage) on:
  - API: `http://localhost:9000`
  - Console: `http://localhost:9001`

### 3. Verify Services

Check that the catalog is running:

```bash
curl http://localhost:8181/v1/config
```

### 4. Run the Test

Execute the test script:

```bash
npx tsx test-local.ts
```

The test will:

1. Clean up any existing test data
2. List namespaces
3. Create a `test` namespace
4. Create a `users` table with a schema
5. List tables in the namespace
6. Load table metadata
7. Update table properties

## Project Structure

```
.
├── docker-compose.yml      # Docker services configuration
├── test-local.ts           # Main test script
├── package.json            # Node.js dependencies
└── README.md              # This file
```

## Test Script Details

The `test-local.ts` script performs the following operations:

1. **Cleanup**: Removes existing test namespace and table (if present)
2. **List Namespaces**: Retrieves all available namespaces
3. **Create Namespace**: Creates a `test` namespace with properties
4. **Create Table**: Creates a `users` table with:
   - Schema: `id` (long), `name` (string), `email` (string)
   - Partition spec (empty)
   - Write order (empty)
   - Parquet format
5. **List Tables**: Lists all tables in the `test` namespace
6. **Load Metadata**: Retrieves and displays table schema information
7. **Update Properties**: Updates table properties (split target size, compression)

## Accessing MinIO Console

You can inspect the underlying S3 storage:

1. Open http://localhost:9001 in your browser
2. Login with:
   - **Username**: `supa-storage`
   - **Password**: `secret1234`
3. Navigate to the `warehouse--table-s3` bucket to see table data

## Stopping Services

```bash
# Stop containers but keep data
docker compose stop

# Stop and remove containers + data
docker compose down -v
```

## Troubleshooting

### Port Already in Use

If ports 8181 or 9000 are already in use, edit `docker-compose.yml` to change the port mappings:

```yaml
ports:
  - "8182:8181" # Use 8182 instead of 8181
```

Then update `test-local.ts` to use the new port.

### Catalog Not Responding

Wait a few seconds after starting Docker services for them to fully initialize:

```bash
# Check logs
docker compose logs -f iceberg-rest

# Wait for "Started ServerConnector" message
```

## Dependencies

- [`iceberg-js`](https://github.com/supabase/iceberg-js): JavaScript/TypeScript client for Apache Iceberg REST Catalog
- **TypeScript**: For type-safe development
- **Docker**: For running local Iceberg REST Catalog and MinIO

## Additional Documentation

For more detailed testing instructions, see [TEST-INSTRUCTION.md](./TEST-INSTRUCTION.md).

## License

ISC
