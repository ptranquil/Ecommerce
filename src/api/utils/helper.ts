import { Response } from "express";
import logger from "../../logger";
import mongoose from "mongoose";

/**
 * function globalErrors: Used to throw error based on the condition (Not found, duplicate etc)
 * @errorMessage : The error message to be thrown if found invalid
 * @res : Express Response Object
 */
export const globalErrors = (
    statusCode: number,
    errorMessage: string | string[],
    res: Response
) => {
    return res.status(statusCode).send({
        status: false,
        message: errorMessage,
    });
};

/**
 * function apiError: Used to return error message mostly used in catch condition
 * @errorMessage : The message to be return within the api error response
 * @res : Express Response Object
 */
export const apiError = (
    errorMessage: string,
    res: Response,
    error: any,
    fileName: any,
    functionName: string
) => {
    logger(fileName).error(`Func(): ${functionName} message : ${error.message}`);
    return res.status(500).send({
        status: false,
        message: errorMessage,
    });
};

/**
 * function apiSuccess: Used to return success message with data if any
 * @message : The message to be return within the api error response
 * @res : Express Response Object
 */
export const apiSuccess = (
    statusCode: number,
    message: string,
    res: Response,
    data?: any
) => {
    return res.status(statusCode).json({
        status: true,
        message,
        data
    });
};

/**
 * 
 * @param email string
 * @returns boolean
 */
export const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * 
 * @param mobileNumber string
 * @returns boolean 
 */
export const validateMobileNumber = (mobileNumber: string) => {
    const mobileNumberRegex = /^\d{10}$/
    return mobileNumberRegex.test(mobileNumber)
}

/**
 * 
 * @param value mongosse ObjectId for validity check
 * @param model mongoose model 
 * @returns boolean : whether object Id is a valid object Id
 */
export const checkObjectId = async (value: string, model: any) => {
    try {
        const doc = mongoose.Types.ObjectId.isValid(value)
            ? await model.findOne({ _id: new mongoose.Types.ObjectId(value) }).count()
            : 0;
        return doc > 0;
    } catch (error) {
        return false;
    }
}