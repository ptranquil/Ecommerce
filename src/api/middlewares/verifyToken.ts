import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../../config";
import { userModel } from "../../db/model/user.model";
import { globalErrors } from "../utils/helper";

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return globalErrors(401, "Unauthorized Access or Invalid access token", res);
        }
        jwt.verify(
            token,
            process.env.JWT_USER_SECRETKEY!,
            async function (err, decoded) {
                if (!err) {
                    const userData = JSON.parse(JSON.stringify(decoded));
                    const user: any = await userModel.findOne({
                        _id: userData.userId,
                        isActive: true,
                    });
                    if (!user.token) {
                        return globalErrors(401, "User token expired!, Login to continue...", res);
                    }
                    res.locals.user = userData;
                    next();
                } else {
                    return globalErrors(401, "Unauthorized Access or Invalid access token", res);
                }
            }
        );
    } catch (error: any) {
        return globalErrors(401, "Unauthorized Access or Invalid access token", res);
    }
}

export default verifyToken;
