# test-iceberg-js

A test project for the [`iceberg-js`](https://github.com/supabase/iceberg-js) library, demonstrating how to interact with an Apache Iceberg REST Catalog both locally via Docker and remotely via Supabase.

## Overview

This project provides test scripts that validate `iceberg-js` functionality against both local and remote Iceberg REST Catalogs. It demonstrates common operations such as:

- Creating and listing namespaces
- Creating tables with schemas
- Loading table metadata
- Updating table properties
- Managing table lifecycle

**Two test scenarios:**

- **`test-local.ts`**: Tests against a local Docker-based Iceberg REST Catalog
- **`real-test.ts`**: Tests against a remote Supabase Iceberg REST Catalog

## Prerequisites

- **Node.js** 20+ (includes native `.env` file support)
- **npm** or **pnpm** (for package management)
- **Docker** and **Docker Compose** (for local testing only)
- **Supabase account** with Iceberg support (for remote testing only)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Choose Your Test Scenario

#### Option A: Local Testing (Docker)

##### 2a. Start Docker Services

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

##### 4a. Run the Local Test

Execute the local test script:

```bash
npm run test:local
# or manually:
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

#### Option B: Remote Testing (Supabase)

##### 2b. Set Up Environment Variables

**Note:** Environment variables are only required for remote Supabase testing, not for local Docker testing.

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

To get these values go to:

```text
https://supabase.com/dashboard/project/<project id>/storage/analytics/buckets/<bucket name>
```

and copy "Connection details"

```bash
SUPABASE_TOKEN=your_service_role_key_here
SUPABASE_WAREHOUSE=warehouse
SUPABASE_CATALOG_URI=https://your-project-ref.storage.supabase.co/storage/v1/iceberg

# Optional: For direct S3 access
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_ENDPOINT=https://your-project-ref.storage.supabase.co/storage/v1/s3
```

**Where to find your credentials:**

- `SUPABASE_TOKEN`: Project Settings → API → service_role key (Secret)
- `SUPABASE_CATALOG_URI`: Replace `your-project-ref` with your Supabase project reference
- `SUPABASE_WAREHOUSE`: Typically `warehouse` (your Iceberg warehouse name)

**Security Note:** The `.env` file is gitignored and should never be committed to version control.

##### 3b. Run the Remote Test

Execute the remote test script:

```bash
npm run test:remote
# or manually (ensure .env is loaded):
npx tsx --env-file=.env real-test.ts
```

The test will:

1. List all namespaces and tables in your Supabase warehouse
2. Create a `demo` namespace with custom properties
3. Create a `taxi_dataset` table with NYC taxi data schema (19 fields)
4. Demonstrate access delegation with vended credentials
5. Clean up by dropping the table and namespace

## Project Structure

```
.
├── docker-compose.yml      # Docker services configuration
├── test-local.ts           # Local Docker test script
├── real-test.ts            # Remote Supabase test script
├── .env                    # Environment variables (gitignored)
├── .env.example            # Environment variables template
├── package.json            # Node.js dependencies
└── README.md              # This file
```

## Test Script Details

### test-local.ts (Local Docker Testing)

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

### real-test.ts (Remote Supabase Testing)

The `real-test.ts` script demonstrates advanced features:

1. **Authentication**: Uses bearer token authentication with service_role key
2. **Catalog Name**: Specifies the warehouse/catalog name for multi-catalog support
3. **Access Delegation**: Requests vended credentials for direct S3 access
4. **Complex Schema**: Creates a table with 19 fields (NYC taxi dataset schema)
5. **Namespace Management**: Creates namespaces with custom properties
6. **Cleanup**: Properly removes tables and namespaces after testing

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

## Environment Variables Reference

For remote testing with `real-test.ts`, the following environment variables are used:

| Variable                | Required | Description                         | Example                                              |
| ----------------------- | -------- | ----------------------------------- | ---------------------------------------------------- |
| `SUPABASE_TOKEN`        | Yes      | Secret key from Supabase project    | `eyJhbGc...`                                         |
| `SUPABASE_WAREHOUSE`    | Yes      | Name of your Iceberg warehouse      | `warehouse`                                          |
| `SUPABASE_CATALOG_URI`  | Yes      | Iceberg REST Catalog endpoint       | `https://xxx.storage.supabase.co/storage/v1/iceberg` |
| `AWS_ACCESS_KEY_ID`     | Optional | AWS access key for direct S3 access | `AKIAIOSFODNN7EXAMPLE`                               |
| `AWS_SECRET_ACCESS_KEY` | Optional | AWS secret key for direct S3 access | `wJalrXUtnFEMI/...`                                  |
| `S3_ENDPOINT`           | Optional | S3 endpoint URL                     | `https://xxx.storage.supabase.co/storage/v1/s3`      |

## Troubleshooting

### Environment Variables Not Loading (real-test.ts)

If you get an error like `Cannot read properties of undefined (reading 'endsWith')`, it means your environment variables aren't loaded:

1. Ensure you have a `.env` file in the project root
2. Verify Node.js version is 20+ (which supports native `.env` loading via `--env-file`)
3. Check that your `.env` file has all required variables (see `.env.example`)
4. Run using the npm script: `npm run test:remote` (automatically loads `.env`)
5. Or manually with explicit env loading: `npx tsx --env-file=.env real-test.ts`

### Port Already in Use (test-local.ts)

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

MIT
