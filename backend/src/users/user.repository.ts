import {db} from "../db.ts";
import {User} from "./user.ts";

type UserRow = { id: string; email: string; display_name: string; password_hash: string };

function rowToUser(row: UserRow): User {
    return new User({email: row.email, displayName: row.display_name, passwordHash: row.password_hash}, row.id);
}

export function saveUser(user: User): void {
    // An upsert, not INSERT OR REPLACE: REPLACE deletes the old row first, which would cascade to the user's rides.
    db.prepare(`
        INSERT INTO users (id, email, display_name, password_hash)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET email         = excluded.email,
                                      display_name  = excluded.display_name,
                                      password_hash = excluded.password_hash
    `).run(user.id, user.email, user.displayName, user.passwordHash);
}

export function getAllUsers(): User[] {
    const rows = db.prepare("SELECT * FROM users").all() as UserRow[];
    return rows.map(row => new User({
        displayName: row.display_name,
        passwordHash: row.password_hash,
        email: row.email,
    }, row.id));
}

export function getUser(id: string): User | undefined {
    const row = db.prepare("SELECT id, email, display_name, password_hash FROM users WHERE id = ?")
        .get(id) as UserRow | undefined;
    return row ? rowToUser(row) : undefined;
}

/** Expects the email already trimmed and lowercased, the way it is stored. */
export function getUserByEmail(email: string): User | undefined {
    const row = db.prepare("SELECT id, email, display_name, password_hash FROM users WHERE email = ?")
        .get(email) as UserRow | undefined;
    return row ? rowToUser(row) : undefined;
}

export function deleteUser(id: string): boolean {
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return result.changes > 0;
}
