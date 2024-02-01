import { Request, Response } from "express";
import { apiError, apiSuccess, globalErrors } from "../utils/helper";
import config from "../../../config";
import { cartModel } from "../../db/model/cart.mode";
import { productModel } from "../../db/model/product.model";
import mongoose from "mongoose";

export const addProductToCart = async (req: Request, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        const userId = res.locals.user.userId;

        const product = await productModel.findOne({ _id: productId, isActive: true, quantity: { $gt: 0 } });
        if (!product) {
            return globalErrors(404, "Product not found or unavailable", res);
        }

        /** Inserting if cart already exist */
        const existingCartItem = await cartModel.findOneAndUpdate(
            { userId, 'items.productId': productId, status: 'inCart' },
            {
                $inc: {
                    'items.$.quantity': quantity
                }
            },
            { new: true }
        ).populate('items.productId');

        /** creating new cart if cart does not exist */
        if (!existingCartItem) {
            const cart = await createNewcart(userId, productId, quantity, product);
            return apiSuccess(200, "Product added to the cart successfully", res, cart);
        }

        /** updating product total price */
        let cartTotal = 0;
        existingCartItem.items.forEach((item) => {
            item.totalPrice = item.price * item.quantity;
            cartTotal += item.totalPrice;
        });
        existingCartItem.cartTotal = cartTotal;
        await existingCartItem.save();
        return apiSuccess(200, "Product quantity updated in the cart", res, existingCartItem);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "addProductToCart");
    }
};

export const viewCart = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;

        /** getting cart details */
        const cart = await cartModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            status: 'inCart'
        }).populate({
            path: "items.productId",
            model: "products",
            select: "_id name price description category",
            match: { isActive: true },
        })
        return apiSuccess(200, "Cart fetched successfully", res, cart);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "viewCart");
    }
};

export const updateCart = async (req: Request, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        const userId = res.locals.user.userId;

        const product = await productModel.findOne({ _id: productId, isActive: true, quantity: { $gt: 0 } });
        if (!product) {
            return globalErrors(404, "Product not found or unavailable", res);
        }

        /** Update cart if it already exists */
        const updatedCart = await cartModel.findOneAndUpdate(
            { userId, 'items.productId': productId, status: 'inCart' },
            {
                $set: {
                    'items.$.quantity': quantity,
                    'items.$.totalPrice': product.price * quantity
                }
            },
            { new: true }
        ).populate({
            path: "items.productId",
            model: "products",
            select: "_id name description category",
            match: { isActive: true },
        });

        /** If cart doesn't exist, create a new one */
        if (!updatedCart) {
            const newCart = await createNewcart(userId, productId, quantity, product);
            return apiSuccess(200, "Product added to the cart successfully", res, newCart);
        }

        /** Update cartTotal based on the updated item */
        updatedCart.cartTotal = updatedCart.items.reduce((total, item) => total + item.totalPrice, 0);
        await updatedCart.save();
        return apiSuccess(200, "Cart updated successfully.", res, updatedCart);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "updateCart");
    }
};

export const removeCartItem = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const userId = res.locals.user.userId;

        const removedCartItem = await cartModel.findOneAndUpdate(
            { userId, 'items.productId': productId, status: 'inCart' },
            {
                $pull: {
                    items: { productId }
                }
            },
            { new: true }
        ).populate({
            path: "items.productId",
            model: "products",
            select: "_id name price description category",
            match: { isActive: true },
        });

        if (!removedCartItem) {
            return globalErrors(404, "Product not found in the cart", res);
        }

        /** Update cartTotal based on the removed item */
        removedCartItem.cartTotal = removedCartItem.items.reduce((total, item) => total + item.totalPrice, 0);
        await removedCartItem.save();

        return apiSuccess(200, "Product removed from the cart successfully", res, removedCartItem);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "removeCartItem");
    }
};

export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;
        const clearedCart = await cartModel.findOneAndUpdate(
            { userId, status: 'inCart' },
            {
                $set: { items: [] },
                $unset: { cartTotal: '' }
            },
            { new: true }
        );

        if (!clearedCart) {
            return globalErrors(404, "Cart not found or already empty", res);
        }
        return apiSuccess(200, "Cart cleared successfully.", res, clearedCart);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "clearCart");
    }
};

async function createNewcart(userId: string, productId: string, quantity: number, product: any) {
    const newCart = await cartModel.findOneAndUpdate(
        {
            userId,
            status: 'inCart'
        },
        {
            $push: {
                items: {
                    productId,
                    quantity,
                    price: product.price,
                    totalPrice: product.price * quantity,
                },
            },
        },
        { new: true, upsert: true }
    ).populate({
        path: "items.productId",
        model: "products",
        select: "_id name description category",
        match: { isActive: true },
    });
    /** Calculating cartTotal based on the newly added/updated item */
    newCart.cartTotal = newCart.items.reduce((total, item) => total + item.totalPrice, 0);
    await newCart.save();
    return newCart;
}
