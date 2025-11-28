import { createClient } from "@supabase/supabase-js";
import { IcebergError } from "iceberg-js";

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_TOKEN = process.env.SUPABASE_TOKEN!;
const ANALYTICS_BUCKET_NAME = process.env.ANALYTICS_BUCKET_NAME!;

const supabase = createClient(SUPABASE_URL, SUPABASE_TOKEN);

const catalog = supabase.storage.analytics.from(ANALYTICS_BUCKET_NAME);

const vectors = supabase.storage.vectors.getBucket("test");
const vector = supabase.storage.vectors.from("test");
const { data: vectors2 } = await vector.listIndexes({ prefix: "documents-" });
const bucket = supabase.storage.vectors.from("embeddings-prod");
const { data: hello } = await bucket.getIndex("documents-openai");
console.log("Dimension:", hello?.index.dimension);

const index = supabase.storage.vectors
  .from("embeddings-prod")
  .index("documents-openai");

// Insert vectors
await index.putVectors({
  vectors: [
    { key: "doc-1", data: { float32: [] }, metadata: { title: "Intro" } },
  ],
});

// Query similar vectors
const { data } = await index.queryVectors({
  queryVector: { float32: [] },
  topK: 5,
});

const files = supabase.storage.getBucket("test");
const analytics = supabase.storage.analytics.listBuckets();
console.log(analytics);

async function listAll() {
  let namespaces = await catalog.listNamespaces();

  for (const namespaceItem of namespaces) {
    let namespaceName = namespaceItem.namespace[0];
    console.log(namespaceName);
    let tables = await catalog.listTables(namespaceItem);
    for (let i = 0; i < tables.length; i++) {
      const isLast = i === tables.length - 1;
      const prefix = isLast ? "└── " : "├── ";
      console.log(prefix + tables[i]!.name);
    }
  }
}

async function createTable(namespace: any, tableName: string) {
  const metadata = await catalog.createTable(namespace, {
    name: tableName,
    schema: {
      type: "struct",
      fields: [
        { id: 1, name: "VendorID", type: "long", required: false },
        {
          id: 2,
          name: "tpep_pickup_datetime",
          type: "timestamp",
          required: false,
        },
        {
          id: 3,
          name: "tpep_dropoff_datetime",
          type: "timestamp",
          required: false,
        },
        { id: 4, name: "passenger_count", type: "double", required: false },
        { id: 5, name: "trip_distance", type: "double", required: false },
        { id: 6, name: "RatecodeID", type: "double", required: false },
        { id: 7, name: "store_and_fwd_flag", type: "string", required: false },
        { id: 8, name: "PULocationID", type: "long", required: false },
        { id: 9, name: "DOLocationID", type: "long", required: false },
        { id: 10, name: "payment_type", type: "long", required: false },
        { id: 11, name: "fare_amount", type: "double", required: false },
        { id: 12, name: "extra", type: "double", required: false },
        { id: 13, name: "mta_tax", type: "double", required: false },
        { id: 14, name: "tip_amount", type: "double", required: false },
        { id: 15, name: "tolls_amount", type: "double", required: false },
        {
          id: 16,
          name: "improvement_surcharge",
          type: "double",
          required: false,
        },
        { id: 17, name: "total_amount", type: "double", required: false },
        {
          id: 18,
          name: "congestion_surcharge",
          type: "double",
          required: false,
        },
        { id: 19, name: "airport_fee", type: "double", required: false },
      ],
      "schema-id": 0,
      "identifier-field-ids": [],
    },
    "partition-spec": {
      "spec-id": 0,
      fields: [],
    },
    "write-order": {
      "order-id": 0,
      fields: [],
    },
    "stage-create": false,
    properties: {},
  });
}

async function createComplexTypesTable(namespace: any, tableName: string) {
  const metadata = await catalog.createTable(namespace, {
    name: tableName,
    schema: {
      type: "struct",
      fields: [
        { id: 1, name: "id", type: "long", required: true },
        // Decimal type - string format per OpenAPI spec
        { id: 2, name: "price", type: "decimal(10,2)", required: false },
        { id: 3, name: "tax_rate", type: "decimal(5,4)", required: false },
        // Fixed type - string format per OpenAPI spec
        { id: 4, name: "uuid_hash", type: "fixed[16]", required: false },
        { id: 5, name: "sha256_hash", type: "fixed[32]", required: false },
        // List type - array of strings
        {
          id: 6,
          name: "tags",
          type: {
            type: "list",
            "element-id": 7,
            element: "string",
            "element-required": false,
          },
          required: false,
        },
        // List type - array of integers
        {
          id: 8,
          name: "scores",
          type: {
            type: "list",
            "element-id": 9,
            element: "int",
            "element-required": true,
          },
          required: false,
        },
        // Map type - string to string
        {
          id: 10,
          name: "metadata",
          type: {
            type: "map",
            "key-id": 11,
            key: "string",
            "value-id": 12,
            value: "string",
            "value-required": false,
          },
          required: false,
        },
        // Map type - string to long (for counters)
        {
          id: 13,
          name: "counters",
          type: {
            type: "map",
            "key-id": 14,
            key: "string",
            "value-id": 15,
            value: "long",
            "value-required": true,
          },
          required: false,
        },
        // Nested struct type
        {
          id: 16,
          name: "address",
          type: {
            type: "struct",
            fields: [
              { id: 17, name: "street", type: "string", required: false },
              { id: 18, name: "city", type: "string", required: true },
              { id: 19, name: "zip", type: "string", required: false },
              { id: 20, name: "country", type: "string", required: true },
            ],
          },
          required: false,
        },
        // List of structs (contacts)
        {
          id: 21,
          name: "contacts",
          type: {
            type: "list",
            "element-id": 22,
            element: {
              type: "struct",
              fields: [
                { id: 23, name: "name", type: "string", required: true },
                { id: 24, name: "email", type: "string", required: false },
                { id: 25, name: "phone", type: "string", required: false },
              ],
            },
            "element-required": false,
          },
          required: false,
        },
        // Map with struct values
        {
          id: 26,
          name: "attributes",
          type: {
            type: "map",
            "key-id": 27,
            key: "string",
            "value-id": 28,
            value: {
              type: "struct",
              fields: [
                { id: 29, name: "value", type: "string", required: true },
                { id: 30, name: "updated_at", type: "timestamp", required: false },
              ],
            },
            "value-required": false,
          },
          required: false,
        },
      ],
      "schema-id": 0,
      "identifier-field-ids": [1],
    },
    "partition-spec": {
      "spec-id": 0,
      fields: [],
    },
    "write-order": {
      "order-id": 0,
      fields: [],
    },
    "stage-create": false,
    properties: {},
  });
  return metadata;
}

console.log("\n═══════════════════════════════════════");
console.log("    🚀 STARTING (using supabase-js)");
console.log("═══════════════════════════════════════\n");

// List all namespaces and tables
await listAll();

const newNamespace = { namespace: ["test"] };
const newTable = "taxi_dataset";

// Cleanup: Drop existing table and namespace if they exist
console.log("\n🧹 Cleaning up existing resources...\n");
try {
  await catalog.dropTable({ ...newNamespace, name: newTable }, { purge: true });
  console.log("  ✓ Dropped existing table");
} catch (error: any) {
  // Check for 404 errors (resource not found) - handle various error formats
  const is404 =
    (error instanceof IcebergError && error.status === 404) ||
    error?.status === 404 ||
    error?.details?.error?.code === 404;

  if (is404) {
    console.log("  • No existing table to clean up");
  } else {
    throw error;
  }
}

try {
  await catalog.dropNamespace(newNamespace);
  console.log("  ✓ Dropped existing namespace");
} catch (error: any) {
  // Check for 404 errors (resource not found) - handle various error formats
  const is404 =
    (error instanceof IcebergError && error.status === 404) ||
    error?.status === 404 ||
    error?.details?.error?.code === 404;

  if (is404) {
    console.log("  • No existing namespace to clean up");
  } else {
    throw error;
  }
}
console.log("\n✅ Cleanup complete!\n");

// Create a new namespace
await catalog.createNamespace(newNamespace, {
  properties: { owner: "data-team" },
});
console.log("\n✅ ADDED NEW NAMESPACE\n");
await listAll();

// Create a new table in the namespace
await createTable(newNamespace, newTable);
console.log("\n✅ ADDED NEW TABLE\n");
await listAll();

// Drop the table
await catalog.dropTable({ ...newNamespace, name: newTable }, { purge: true });
console.log("\n❌ DROPPED NEW TABLE\n");
await listAll();

// Drop the namespace
await catalog.dropNamespace(newNamespace);
console.log("\n❌ DROPPED NEW NAMESPACE\n");
await listAll();

// ═══════════════════════════════════════════════════════════════
// Test Complex Types (decimal, fixed, list, map, struct)
// ═══════════════════════════════════════════════════════════════

console.log("\n═══════════════════════════════════════");
console.log("    📊 TESTING COMPLEX TYPES");
console.log("═══════════════════════════════════════\n");

const complexNamespace = { namespace: ["complex_test"] };
const complexTable = "all_types";

// Cleanup first
console.log("🧹 Cleaning up complex types test resources...\n");
try {
  await catalog.dropTable(
    { ...complexNamespace, name: complexTable },
    { purge: true }
  );
  console.log("  ✓ Dropped existing complex_types table");
} catch (error: any) {
  const is404 =
    (error instanceof IcebergError && error.status === 404) ||
    error?.status === 404 ||
    error?.details?.error?.code === 404;
  if (is404) {
    console.log("  • No existing complex_types table to clean up");
  } else {
    throw error;
  }
}

try {
  await catalog.dropNamespace(complexNamespace);
  console.log("  ✓ Dropped existing complex_test namespace");
} catch (error: any) {
  const is404 =
    (error instanceof IcebergError && error.status === 404) ||
    error?.status === 404 ||
    error?.details?.error?.code === 404;
  if (is404) {
    console.log("  • No existing complex_test namespace to clean up");
  } else {
    throw error;
  }
}

// Create namespace for complex types test
await catalog.createNamespace(complexNamespace, {
  properties: { description: "Testing complex Iceberg types" },
});
console.log("\n✅ Created complex_test namespace\n");

// Create table with all complex types
console.log("📊 Creating table with complex types:");
console.log("   - decimal(10,2), decimal(5,4)");
console.log("   - fixed[16], fixed[32]");
console.log("   - list<string>, list<int>");
console.log("   - map<string,string>, map<string,long>");
console.log("   - struct (nested)");
console.log("   - list<struct>");
console.log("   - map<string,struct>\n");

const complexMetadata = await createComplexTypesTable(
  complexNamespace,
  complexTable
);
console.log("✅ Complex types table created!");
console.log("   Location:", complexMetadata.location);

// Load and verify the table schema
console.log("\n📖 Loading table to verify schema...\n");
const loadedTable = await catalog.loadTable({
  ...complexNamespace,
  name: complexTable,
});

// Find current schema
const currentSchema = loadedTable.schemas?.find(
  (s: any) => s["schema-id"] === loadedTable["current-schema-id"]
);

if (currentSchema) {
  console.log("Schema fields:");
  for (const field of currentSchema.fields) {
    const typeStr =
      typeof field.type === "string"
        ? field.type
        : JSON.stringify(field.type).slice(0, 50) + "...";
    console.log(`   ${field.id}. ${field.name}: ${typeStr}`);
  }
}

console.log("\n✅ Complex types verified!\n");

// Cleanup complex types test
console.log("🧹 Cleaning up complex types test...");
await catalog.dropTable(
  { ...complexNamespace, name: complexTable },
  { purge: true }
);
await catalog.dropNamespace(complexNamespace);
console.log("✅ Cleanup complete!\n");

console.log("\n═══════════════════════════════════════");
console.log("           ✅ COMPLETED");
console.log("═══════════════════════════════════════\n");
