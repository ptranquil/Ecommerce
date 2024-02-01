import { object, string } from "zod"
import { validateEmail, validateMobileNumber } from "../utils/helper";

export const userLoginSchema = object({
    email: string().trim().refine(val => {
        return validateEmail(val)
    }),
    password: string().min(1)
});

export const userSchema = object({
    name: string().trim().min(2),
    phoneNo: string().trim().refine(val => {
        return validateMobileNumber(val)
    }),
    address: string().trim().nonempty(),
}).merge(userLoginSchema);
