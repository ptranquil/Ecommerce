import { object, string, number } from 'zod';
import { checkObjectId } from '../utils/helper';
import { userModel } from '../../db/model/user.model';
import { cartModel } from '../../db/model/cart.mode';

export const createOrderSchema = object({
    userId: string({ required_error: 'userId is required' })
        .refine(async (value) => {
            return checkObjectId(value, userModel)
        }, { "message": "Invalid userId" }),
    cartId: string({ required_error: 'cartId is required' })
        .refine(async (value) => {
            return checkObjectId(value, cartModel)
        }, { "message": "Invalid cartId" })
});
