import express from "express";
import { db } from "./db.ts";
import { userRouter } from "./users/user.routes.ts";
import { authRouter } from "./auth/login.ts";
import {ridesRouter} from "./rides/ride.routes.ts";
import {trainRouter} from "./trains/train.routes.ts";

const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/rides", ridesRouter);
app.use("/trains", trainRouter);

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
  console.log(`Pertrain API on http://localhost:${port}`);
});

// Close the database cleanly on Ctrl+C.
process.on("SIGINT", () => {
  server.close();
  db.close();
  process.exit(0);
});