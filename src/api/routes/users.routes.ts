import express from "express";
import ValidateZod from "../validators";
import { userLoginSchema, userSchema } from "../schema/user.schema";
import { getUsers, login, logout, registerUser, updateUser } from "../controllers/users.controller";
import verifyToken from "../middlewares/verifyToken";

const userRouter = express.Router();

userRouter.post("/register", ValidateZod(userSchema), registerUser);
userRouter.post("/login", ValidateZod(userLoginSchema), login);
userRouter.get("/", verifyToken, getUsers);
userRouter.patch("/", verifyToken, updateUser);
userRouter.get("/logout", verifyToken, logout);

export default userRouter;