import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL not found in environment variables");
  }

  console.log("🔌 Connecting to database...");
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    console.log("📖 Reading migration file...");
    const migrationPath = path.join(process.cwd(), "migration-phase2.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("🚀 Executing migration...\n");

    // Execute the entire migration as one transaction
    await client.unsafe(migrationSQL);

    console.log("\n✅ Migration completed successfully!");

    // Verify key changes
    console.log("\n🔍 Verifying migration...");
    const result = await client`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'leases'
      AND column_name IN ('initial_fee_amount', 'deposit_amount')
    `;

    console.log("  Columns in leases table:", result.map(r => r.column_name).join(", "));

    const tablesResult = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('property_documents', 'user_documents')
    `;

    console.log("  New tables:", tablesResult.map(r => r.table_name).join(", "));

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.end();
    console.log("\n🔌 Database connection closed");
  }
}

runMigration()
  .then(() => {
    console.log("\n✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error:", error);
    process.exit(1);
  });
