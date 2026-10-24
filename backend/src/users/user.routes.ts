import { Router } from "express";
import { User } from "./user.ts";
import { deleteUser, getUser, getUserByEmail, saveUser } from "./user.repository.ts";
import bcrypt from "bcrypt";
import {getRidesForUser} from "../rides/ride.repository.ts";

const EMAIL_REGEX = /^(?=.{1,254}$)(?=[^@]{1,64}@)[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z][A-Za-z0-9-]{0,61}[A-Za-z0-9]$/;

export const userRouter = Router();

// GET /users/:id
userRouter.get("/:id", (req, res) => {
    const user = getUser(req.params.id);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(user);
});

// POST /users   body: { "displayName": "Casper van den Berg", "email": "...", "password": "..." }
userRouter.post("/", async (req, res) => {
    const body = req.body ?? {};
    // Every invalid field gets a message, so the client can show all problems at once.
    const errors: Record<string, string> = {};

    // Each field is only normalized once it is known to be a string.
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : undefined;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const password = typeof body.password === "string" ? body.password : undefined;

    if (displayName === undefined || displayName.length === 0 || displayName.length > 64)
        errors.displayName = "must be 1-64 characters";

    if (email === undefined || !EMAIL_REGEX.test(email))
        errors.email = "must be a valid email";

    if (password === undefined || password.length < 8 || Buffer.byteLength(password, "utf8") > 72)
        errors.password = "must be at least 8 characters and at most 72 bytes";

    if (Object.keys(errors).length > 0) {
        res.status(400).json({ errors });
        return;
    }

    const passwordHash = await bcrypt.hash(password!, 12);

    // Checked after the await, so no other request can take the email between this check and the save.
    if (getUserByEmail(email!)) {
        res.status(409).json({ errors: { email: "is already in use" } });
        return;
    }

    const user = new User({ displayName, passwordHash, email });
    saveUser(user);

    res.status(201).json(user);
});

// DELETE /users/:id
userRouter.delete("/:id", (req, res) => {
    if (!deleteUser(req.params.id)) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.status(204).end();
});

userRouter.get("/:id/rides", (req, res) => {
    const user = getUser(req.params.id);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(getRidesForUser(user));
})