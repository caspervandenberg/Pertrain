import { db } from "../db.ts";
import { Train } from "./train.ts";

type TrainRow = { train_number: number };

export function saveTrain(train: Train): void {
    db.prepare("INSERT INTO trains (train_number) VALUES (?) ON CONFLICT DO NOTHING")
        .run(train.trainNumber);
}

export function getTrain(trainNumber: number): Train | undefined {
    const row = db.prepare("SELECT train_number FROM trains WHERE train_number = ?")
        .get(trainNumber) as TrainRow | undefined;
    return row ? new Train(row.train_number) : undefined;
}

export function getAllTrains(): Train[] {
    const rows = db.prepare("SELECT train_number FROM trains ORDER BY train_number").all() as TrainRow[];
    return rows.map(row => new Train(row.train_number));
}

export function deleteTrain(trainNumber: number): boolean {
    const result = db.prepare("DELETE FROM trains WHERE train_number = ?").run(trainNumber);
    return result.changes > 0;
}
