import {rmSync} from "node:fs";
import path from "node:path";

export async function resetDb() {
    // Deletes the database file, then lets db.ts recreate it with the current schema.
    const dbPath = path.join(import.meta.dirname, "..", "data", "pertrain.db");
    rmSync(dbPath, {force: true});

    // Imported only after deleting: a normal import would open the old file first.
    const {db} = await import("../src/db.ts");
    db.close();

    console.log("Database reset:", dbPath);
}

if (import.meta.main) {
    await resetDb();
}