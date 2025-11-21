# Comparison: real-test.ts vs real-test-supabase-js.ts

This document compares the two approaches for working with Supabase Analytics (Iceberg) buckets.

## Overview

Both test files perform identical operations:

1. List all namespaces and tables
2. Clean up existing test resources
3. Create a new namespace
4. Create a new table with taxi dataset schema
5. Drop the table
6. Drop the namespace

The difference is in **how they initialize the Iceberg catalog client**.

## Approach 1: Direct `iceberg-js` (real-test.ts)

### Configuration

```typescript
import { IcebergRestCatalog } from "iceberg-js";

const catalog = new IcebergRestCatalog({
  baseUrl: SUPABASE_CATALOG_URI, // Full Iceberg endpoint URL
  catalogName: SUPABASE_WAREHOUSE, // Warehouse/bucket name
  auth: {
    type: "bearer",
    token: SUPABASE_TOKEN, // Secret key
  },
  accessDelegation: ["vended-credentials"],
});
```

### Environment Variables Required

```bash
SUPABASE_TOKEN=eyJhbGci...                                    # Secret key
SUPABASE_WAREHOUSE=warehouse                                  # Bucket name
SUPABASE_CATALOG_URI=https://xyz.storage.supabase.co/storage/v1/iceberg
```

### When to Use

- When you need fine-grained control over Iceberg client configuration
- When you want to use advanced `iceberg-js` features not exposed by supabase-js
- When working with analytics buckets outside of the Supabase client ecosystem
- When you need to configure `accessDelegation` or other advanced options

### Pros

✅ Full control over IcebergRestCatalog configuration
✅ Can use latest iceberg-js features directly
✅ No dependency on @supabase/supabase-js
✅ Lighter weight if you only need Iceberg operations

### Cons

❌ More verbose configuration
❌ Need to manually construct the catalog URL
❌ Need to manage authentication separately
❌ Not integrated with other Supabase features

---

## Approach 2: Via `supabase-js` (real-test-supabase-js.ts)

### Configuration

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

// Get catalog via convenience method
const catalog = supabase.storage.analytics.fromCatalog(ANALYTICS_BUCKET_NAME);
```

### Environment Variables Required

```bash
SUPABASE_URL=https://xyz.supabase.co              # Project URL
SUPABASE_SECRET_KEY=eyJhbGci...            # Secret key (required for analytics)
ANALYTICS_BUCKET_NAME=warehouse                   # Bucket name
```

### When to Use

- When you're already using @supabase/supabase-js in your application
- When you want simplified configuration
- When you want authentication to be managed automatically
- When you're working with multiple Supabase features (auth, database, storage, analytics)

### Pros

✅ Simpler configuration (just project URL + key)
✅ Authentication handled automatically
✅ Consistent with other Supabase patterns
✅ Integrated with the Supabase ecosystem
✅ URL construction handled for you

### Cons

❌ Adds dependency on @supabase/supabase-js
❌ Less control over advanced Iceberg client options
❌ Must wait for supabase-js to expose new iceberg-js features

---

## Side-by-Side Comparison

| Aspect                 | iceberg-js (direct)       | supabase-js (fromCatalog)     |
| ---------------------- | ------------------------- | ---------------------------- |
| **Package**            | `iceberg-js`              | `@supabase/supabase-js`      |
| **Setup Lines**        | 8 lines                   | 3 lines                      |
| **URL Construction**   | Manual                    | Automatic                    |
| **Auth Configuration** | Manual                    | Automatic                    |
| **Environment Vars**   | 3 (token, warehouse, URI) | 3 (URL, key, bucket)         |
| **Integration**        | Standalone                | Full Supabase ecosystem      |
| **Advanced Options**   | Full control              | Limited to fromCatalog config |
| **Use Case**           | Analytics-only apps       | Full Supabase apps           |

---

## Code Differences

### Initialization

```typescript
// real-test.ts (iceberg-js)
const catalog = new IcebergRestCatalog({
  baseUrl: SUPABASE_CATALOG_URI,
  catalogName: SUPABASE_WAREHOUSE,
  auth: { type: "bearer", token: SUPABASE_TOKEN },
  accessDelegation: ["vended-credentials"],
});

// real-test-supabase-js.ts (supabase-js)
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
const catalog = supabase.storage.analytics.fromCatalog(ANALYTICS_BUCKET_NAME);
```

### Everything Else

After initialization, **both approaches use the exact same Iceberg catalog API**:

```typescript
// Identical in both files
await catalog.listNamespaces()
await catalog.createNamespace({ namespace: ["test"] })
await catalog.createTable(...)
await catalog.dropTable(...)
await catalog.dropNamespace(...)
```

---

## Recommendation

### Use `supabase-js` (fromCatalog) when:

- Building a full Supabase application
- You want simpler configuration
- You're using other Supabase features (auth, database, storage)
- You prefer convention over configuration

### Use `iceberg-js` directly when:

- Building analytics-only microservices
- You need advanced configuration options
- You want to minimize dependencies
- You're already familiar with Iceberg and want full control

---

## Behind the Scenes

What does `fromCatalog()` actually do? Let's look at the implementation:

```typescript
// From StorageAnalyticsClient.ts
fromCatalog(bucketName: string): IcebergRestCatalog {
  const catalogUrl = `${this.url}/v1`

  return new IcebergRestCatalog({
    baseUrl: catalogUrl,
    catalogName: bucketName,
    auth: {
      type: 'custom',
      getHeaders: async () => this.headers,
    },
    fetch: this.fetch,
  })
}
```

**Key Points:**

1. Constructs the Iceberg REST Catalog URL automatically
2. Uses the bucket name as the catalog name (Iceberg warehouse)
3. Passes through the Supabase client's authentication headers
4. Uses the same fetch implementation for consistency

So `fromCatalog()` is essentially a **convenience factory** that creates an `IcebergRestCatalog` with Supabase-specific configuration pre-applied.

---

## Running the Tests

### Setup

```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your project credentials

# Install dependencies
npm install
# or
bun install
```

### Run Direct iceberg-js Version

```bash
npx tsx real-test.ts
# or
bun real-test.ts
```

### Run supabase-js Version

```bash
npx tsx real-test-supabase-js.ts
# or
bun real-test-supabase-js.ts
```

Both should produce identical output! 🎉
