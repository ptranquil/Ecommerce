import { Request, Response } from "express";
import { apiError, apiSuccess, globalErrors } from "../utils/helper";
import config from "../../../config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userDocument, userModel } from "../../db/model/user.model";
import * as _ from "lodash";

async function checkUserExist(data: object) {
    const isUserExist = await userModel.find({
        ...data,
        isActive: true
    }).select("-_id -password -token -isActive, -createdAt -updatedAt");
    return isUserExist;
}

export const registerUser = async (req: Request, res: Response) => {
    try {
        const reqData: userDocument = req.body;

        /** checking whether user already exist */
        /** Email duplication check */
        let userEmailExist = await checkUserExist({ email: reqData.email })
        if (userEmailExist.length > 0) {
            return globalErrors(409, "User email already exists", res);
        }

        /** Phone No duplication check */
        let userMobileExist = await checkUserExist({ phoneNo: reqData.phoneNo })
        if (userMobileExist.length > 0) {
            return globalErrors(409, "User phone no already exists", res);
        }

        const password = await bcrypt.hash(reqData.password, 10);
        const newUser = new userModel({
            name: reqData.name,
            email: reqData.email,
            password: password,
            phoneNo: reqData.phoneNo,
            address: reqData.address,
            isActive: true
        });
        await newUser.save();
        return apiSuccess(201, "User Registeration Succesfull", res);
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "registerUser");
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        /** check wheter userExist */
        let user = await userModel.find({ email, isActive: true })
        if (user.length <= 0) {
            return globalErrors(404, "Unauthorized - Invalid credentials", res);
        }

        /** Password validity check */
        const flag = await bcrypt.compare(password, user[0].password as string);
        if (!flag) {
            return globalErrors(401, "Unauthorized - Invalid credentials", res);
        }

        /** jwt token creation */
        const token = jwt.sign(
            { userId: user[0]._id },
            process.env.JWT_USER_SECRETKEY as string,
            { expiresIn: config.JWTEXPIRY }
        );
        user[0].token = token;
        await user[0].save();
        return apiSuccess(200, "User logged in successfully", res, { token: token });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "login");
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;
        const user = await checkUserExist({ _id: userId })
        if (user.length < 0) {
            return globalErrors(404, "User not found", res);
        }
        return apiSuccess(200, "User fetched successfully", res, user[0]);
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getUsers");
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;
        const reqData: Partial<userDocument> = req.body;

        /** checking whether user exist and active */
        // let existingUser = await checkUserExist({ _id: userId })
        let existingUser = await userModel.findById(userId)
        if (_.isEmpty(existingUser)) {
            return globalErrors(404, "User not found or is inactive", res);
        }

        /** Validating user updated data */
        if (reqData.email) {
            /** Check for email duplication if email is provided */
            const userEmailExist = await userModel.findOne({ email: reqData.email, _id: { $ne: userId } });
            if (userEmailExist) {
                return globalErrors(409, "Email is already in use", res);
            }
            existingUser.email = reqData.email;
        }

        if (reqData.phoneNo) {
            /** Check for phone number duplication if phone number is provided */
            const userMobileExist = await userModel.findOne({ phoneNo: reqData.phoneNo, _id: { $ne: userId } });
            if (userMobileExist) {
                return globalErrors(409, "Phone number is already in use", res);
            }
            existingUser.phoneNo = reqData.phoneNo;
        }

        if (reqData.password) {
            /** Hasing and updating the password if provided */
            const hashedPassword = await bcrypt.hash(reqData.password, 10);
            existingUser.password = hashedPassword;
        }

        /** Updating other fields if needed */
        if (reqData.name) {
            existingUser.name = reqData.name;
        }

        if (reqData.address) {
            existingUser.address = reqData.address;
        }
        await existingUser.save();
        return apiSuccess(200, "User updated successfully", res);
    } catch (error: any) {
        console.log(error)
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "updateUser");
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { token: "" },
            { new: true }
        );
        if (updatedUser) {
            return apiSuccess(200, "User logout successfully", res);
        } else {
            return globalErrors(409, "User not found", res);
        }
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "logout");
    }
}