import { Router } from "express";
import bcrypt from "bcrypt";
import { getUserByEmail } from "../users/user.repository.ts";
import { createSession } from "./session.repository.ts";

export const authRouter = Router();

// Checked against when the email is unknown, so a wrong email takes as long as a wrong password
// and response times don't reveal which emails have an account.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

// POST /auth/login   body: { "email": "...", "password": "..." }
authRouter.post("/login", async (req, res) => {
    const body = req.body ?? {};
    // Normalized the same way as on sign-up, so the stored email matches.
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const password = typeof body.password === "string" ? body.password : undefined;

    if (email === undefined || password === undefined) {
        res.status(400).json({ error: "email and password are required" });
        return;
    }

    const user = getUserByEmail(email);
    const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

    // One message for both cases, for the same reason as DUMMY_HASH.
    if (!user || !passwordMatches) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }

    const { token, expiresAt } = createSession(user);
    res.json({ token, expiresAt, user });
});
