import { Request, Response } from "express";
import config from "../../../config";
import { apiError, apiSuccess, checkObjectId, globalErrors } from "../utils/helper";
import { orderModel } from "../../db/model/order.model";
import { cartModel } from "../../db/model/cart.mode";
import { productModel } from "../../db/model/product.model";
import mongoose from "mongoose";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;

        /** Checking if the cart exist for the user */
        const cart = await cartModel.findOne({
            userId,
            status: 'inCart',
        }).populate({
            path: 'items.productId',
            model: 'products',
        });

        if (!cart) {
            return globalErrors(404, "Kindly add products to the cart to ordered", res);
        }

        /** Checking if each item in the cart is available and has sufficient quantity */
        const unavailableItems = cart.items.filter((item: any) => {
            return !item.productId || !item.productId.isActive || item.productId.quantity < item.quantity;
        });

        if (unavailableItems.length > 0) {
            const errorMessages = unavailableItems.map((item: any) => {
                if (!item.productId) {
                    return `Product ID ${item.productId} not found`;
                } else if (!item.productId.isActive) {
                    return `Product ${item.productId.name} is not active`;
                } else {
                    return `${item.productId.name} not available`;
                }
            });
            return globalErrors(400, errorMessages, res);
        }

        /** Updating product quantities and cart status */
        for (const item of cart.items) {
            const product = await productModel.findById(item.productId);
            if (product) {
                product.quantity -= item.quantity;
                await product.save();
            }
        }

        cart.status = 'ordered';
        await cart.save();

        /**  Creating the order */
        const order = new orderModel({
            userId,
            cartId: cart._id,
            totalAmount: cart.cartTotal,
            status: 'pending',
        });
        await order.save();

        return apiSuccess(200, "Order created successfully", res, order);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "createOrder");
    }
};

export const viewOrders = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;
        const orderId = req.params.orderId;
        /** checking whether orderId is a valid orderId and is belongs to the order table */
        if (orderId) {
            const isValid = await checkObjectId(orderId, orderModel)
            if (!isValid) {
                return globalErrors(404, "Order not found", res);
            }
        }
        const query = orderId
            ? {
                _id: new mongoose.Types.ObjectId(orderId),
                userId: new mongoose.Types.ObjectId(userId)
            }
            : {
                userId: new mongoose.Types.ObjectId(userId)
            };
        const orders = await orderModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "carts",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cart",
                },
            },
            {
                $unwind: "$cart"
            },
            {
                $unwind: "$cart.items"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cart.items.productId",
                    foreignField: "_id",
                    as: "cart.items.product",
                },
            },
            {
                $unwind: "$cart.items.product"
            },
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    totalAmount: { $first: "$totalAmount" },
                    status: { $first: "$status" },
                    cart: {
                        $first: {
                            _id: "$cart._id",
                            cartTotal: "$cart.cartTotal",
                            status: "$cart.status",
                            createdAt: "$cart.createdAt",
                            updatedAt: "$cart.updatedAt",
                        }
                    },
                    items: {
                        $push: {
                            product: {
                                _id: "$cart.items.product._id",
                                name: "$cart.items.product.name",
                                category: "$cart.items.product.category",
                                description: "$cart.items.product.description",
                            },
                            quantity: "$cart.items.quantity",
                            price: "$cart.items.price",
                            totalPrice: "$cart.items.totalPrice",
                        }
                    },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    totalAmount: 1,
                    cart: 1,
                    status: 1,
                    items: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            }
        ]);
        if (orders.length <= 0) {
            return globalErrors(400, "Order not found", res);
        }
        if (orderId && orders) {
            return apiSuccess(200, "Order fetched succesfully", res, orders[0]);
        }
        return apiSuccess(200, "Order fetched succesfully", res, orders);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "viewOrders");
    }
};

export const confirmOrder = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;
        const orderId = req.params.orderId;
        const order = await orderModel.findOne({
            userId,
            _id: orderId,
            status: 'pending'
        })
        if (!order) {
            return globalErrors(404, "Order not found", res);
        }
        order.status = 'confirmed';
        await order.save();
        return apiSuccess(200, "Order confirmed", res);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "confirmOrder");
    }
};

export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;
        const orderId = req.params.orderId;
        const order = await orderModel.findOne({
            userId,
            _id: orderId,
            status: 'confirmed'
        })
        if (!order) {
            return globalErrors(404, "Order not found", res);
        }

        /** restocking the items in inventory */
        const cartId = order.cartId;
        const cart = await cartModel.findOne({
            _id: cartId,
            status: 'ordered'
        })
        if (cart) {
            for (const item of cart.items) {
                const product = await productModel.findById(item.productId);
                if (product) {
                    product.quantity += item.quantity;
                    await product.save();
                }
            }
        } else {
            return globalErrors(400, "Order details does not exists", res);
        }

        order.status = 'cancelled';
        await order.save();
        return apiSuccess(200, "Order cancelled", res);
    } catch (error) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "cancelOrder");
    }
};