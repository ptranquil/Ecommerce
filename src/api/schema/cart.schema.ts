import { number, object, string } from "zod"
import { productModel } from "../../db/model/product.model";
import { checkObjectId } from "../utils/helper";

export const cartItemSchema = object({
    productId: string({ required_error: 'product Id is required' })
        .refine(async (value) => {
            return checkObjectId(value, productModel)
        }, { "message": "Invalid product Id" }),
    quantity: number().refine(async (value) => {
        return !(value <= 0)
    }, { "message": "quantity should be greter then 0" })
});
