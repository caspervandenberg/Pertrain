import { createHash, randomBytes } from "node:crypto";
import { db } from "../db.ts";
import type { User } from "../users/user.ts";

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Only this hash is stored, so someone who reads the database still can't log in as anyone. */
function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/** Starts a session for the user and returns the token the client has to send along from now on. */
export function createSession(user: User): { token: string; expiresAt: Date } {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
    db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
        .run(hashToken(token), user.id, expiresAt.toISOString());
    return { token, expiresAt };
}
