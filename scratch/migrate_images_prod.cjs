const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const PROD_URL = "https://vice-vault.onrender.com";

console.log("=== Vice Vault Image Migration Script ===");
console.log(`Target: ${PROD_URL}\n`);

rl.question('Enter your Admin UID (From Firebase Console -> Authentication): ', async (uid) => {
    try {
      console.log(`\n\n1. Starting image migration for UID ${uid} (this may take a minute or two)...`);
      
      const migrateRes = await fetch(`${PROD_URL}/api/admin/migrate-images`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": uid.trim()
        }
      });
      
      const migrateData = await migrateRes.json();
      
      if (!migrateRes.ok) {
        throw new Error(migrateData.error || "Migration failed");
      }
      
      console.log("\n🎉 Migration Complete!");
      console.log(`Catalog Items Migrated: ${migrateData.catalogMigrated}`);
      console.log(`User Lockers Migrated: ${migrateData.lockersMigrated}`);
      
    } catch (error) {
      console.error("\n❌ Error:", error.message);
    } finally {
      process.exit(0);
    }
  });
