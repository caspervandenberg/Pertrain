import { randomUUID } from "crypto";
import type { Train } from "../trains/train.ts";
import type { User } from "../users/user.ts";

/** A train ride a user logged for themself */
export class Ride {
    readonly id: string;
    user: User;
    train: Train;
    readonly timestamp: Date;

    constructor(user: User, train: Train, timestamp: Date = new Date(), id: string = randomUUID()) {
        this.id = id;
        this.user = user;
        this.train = train;
        this.timestamp = timestamp;
    }

    get dateTimeString() {
        return this.timestamp.toLocaleString("nl-NL", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "Europe/Amsterdam",
        });
    }
}
