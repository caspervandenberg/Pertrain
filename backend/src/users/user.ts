import assert from "assert";
import { randomUUID } from "crypto";

/** Represents a client interacting with the application */
export interface UserOptions {
    /** Unique identifier for user */
    email: string;

    /** Preferably full name */
    displayName: string;

    /** Password has encoded by bcrypt */
    passwordHash: string;
}

export class User {
    readonly id: string;
    displayName: string;
    passwordHash: string;
    email: string;

    constructor(options: UserOptions, id: string = randomUUID()) {
        assert(options.displayName.length <= 64, "displayName may be at most 64 characters");
        this.id = id;
        this.displayName = options.displayName;
        this.passwordHash = options.passwordHash;
        this.email = options.email;
    }

    /** Leaves the password hash out whenever a user is sent as JSON */
    toJSON() {
        return { id: this.id, displayName: this.displayName };
    }
}
