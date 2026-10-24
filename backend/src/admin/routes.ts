import {Router} from "express";
import {getAllUsers} from "../users/user.repository.ts";

const adminRouter = Router();

adminRouter.get("/users", (req, res) => {
    const users = getAllUsers();
    res.status(200).json(users);
});