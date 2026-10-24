import {Router} from "express";
import {getTrain} from "./train.repository.ts";
import {Train} from "./train.ts";
import {getRidesForTrain} from "../rides/ride.repository.ts";
import type {User} from "../users/user.ts";

export const trainRouter = Router();

// GET /trains/9494
trainRouter.get("/:id", (req, res) => {
    const trainNumber = Number(req.params.id);

    if (!Number.isInteger(trainNumber) || trainNumber < 0 || trainNumber > 9999) {
        res.status(400).json({error: "Train number must be a whole number from 0 to 9999"});
        return;
    }

    // Every number is a real train, even if nobody has logged a ride on it yet.
    const train = getTrain(trainNumber) ?? new Train(trainNumber);
    const rides = getRidesForTrain(train);

    // Keyed by user id: each ride gets its own User object, so the objects themselves never match.
    const counts = new Map<string, { user: User, rides: number }>();
    for (const ride of rides) {
        const entry = counts.get(ride.user.id) ?? {user: ride.user, rides: 0};
        entry.rides++;
        counts.set(ride.user.id, entry);
    }

    const leaderboard = [...counts.values()]
        .map(entry => ({...entry, share: entry.rides / rides.length}))
        .sort((a, b) => b.rides - a.rides || a.user.displayName.localeCompare(b.user.displayName));

    res.json({
        // Train
        trainNumber: train.trainNumber,
        trainSeries: train.series,
        trainRun: train.run,

        // History
        totalRides: rides.length,
        rides: rides.map(ride => ({id: ride.id, timestamp: ride.timestamp, user: ride.user})),
        leaderboard,
    });
})
