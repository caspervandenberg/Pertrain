import { db } from "../db.ts";
import { Ride } from "./ride.ts";
import { Train } from "../trains/train.ts";
import { saveTrain } from "../trains/train.repository.ts";
import { User } from "../users/user.ts";
import {getUser} from "../users/user.repository.ts";

type RideRow = { id: string; train_number: number; timestamp: string; user_id: string };
type RideWithUserRow = RideRow & { user_id: string; email: string; display_name: string; password_hash: string };

export function saveRide(ride: Ride): void {
    // The foreign key needs the train to exist; saveTrain does nothing if it already does.
    saveTrain(ride.train);
    db.prepare(`
        INSERT INTO rides (id, user_id, train_number, timestamp) VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET train_number = excluded.train_number, timestamp = excluded.timestamp
    `).run(ride.id, ride.user.id, ride.train.trainNumber, ride.timestamp.toISOString());
}

export function getRide(id: string): Ride | undefined {
    const row = db.prepare(`
        SELECT rides.id, rides.train_number, rides.timestamp, users.id AS user_id, users.email, users.display_name, users.password_hash
        FROM rides JOIN users ON users.id = rides.user_id
        WHERE rides.id = ?
    `).get(id) as RideWithUserRow | undefined;
    if (!row) return undefined;

    const user = new User({ email: row.email, displayName: row.display_name, passwordHash: row.password_hash }, row.user_id);
    return new Ride(user, new Train(row.train_number), new Date(row.timestamp), row.id);
}

/** All rides of a user, newest first. Takes the User itself, so it isn't fetched again for every ride. */
export function getRidesForUser(user: User): Ride[] {
    const rows = db.prepare("SELECT id, train_number, timestamp FROM rides WHERE user_id = ? ORDER BY timestamp DESC")
        .all(user.id) as RideRow[];
    return rows.map(row => new Ride(user, new Train(row.train_number), new Date(row.timestamp), row.id));
}

export function getRidesForTrain(train: Train): Ride[] {
    const rows = db.prepare("SELECT * FROM rides WHERE train_number = ?;")
        .all(train.trainNumber) as RideRow[];
    return rows.map(row => {
        const user = getUser((row.user_id));
        if (!user) {
            throw new Error(`Cannot find user ${row.user_id} in database`);
        }
        return new Ride(user, train, new Date(row.timestamp), row.id);
    })
}

export function deleteRide(id: string): boolean {
    const result = db.prepare("DELETE FROM rides WHERE id = ?").run(id);
    return result.changes > 0;
}
