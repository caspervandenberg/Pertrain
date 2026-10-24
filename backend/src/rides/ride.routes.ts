import {Router} from "express";
import {getRide, saveRide} from "./ride.repository.ts";
import {Ride} from "./ride.ts";
import {Train} from "../trains/train.ts";
import {getUser} from "../users/user.repository.ts";
import {getTrain} from "../trains/train.repository.ts";

export const ridesRouter = Router();

ridesRouter.get('/:id', (req, res) => {
    const ride = getRide(req.params.id);
    if (!ride) {
        res.status(404).json({error: "Ride not found"});
        return;
    }
    res.json(ride);
})

// POST /rides   body: { "userId": "...", "trainNumber": 9494 }
ridesRouter.post('/', (req, res) => {
    const body = req.body ?? {};
    // Every invalid field gets a message, so the client can show all problems at once.
    const errors: Record<string, string> = {};

    const userId = typeof body.userId === "string" ? body.userId : undefined;
    const trainNumber = body.trainNumber;

    if (userId === undefined)
        errors.userId = "must be a string";

    if (!Number.isInteger(trainNumber) || trainNumber < 0 || trainNumber > 9999)
        errors.trainNumber = "must be a whole number from 0 to 9999";

    if (Object.keys(errors).length > 0) {
        res.status(400).json({errors});
        return;
    }

    const user = getUser(userId!);
    if (!user) {
        res.status(404).json({error: "User not found"});
        return;
    }

    const train = getTrain(trainNumber) ?? new Train(trainNumber);

    const ride = new Ride(user, train);
    saveRide(ride);

    res.status(201).json(ride);
})