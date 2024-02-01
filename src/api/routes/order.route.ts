import express from "express";
import verifyToken from "../middlewares/verifyToken";
import { createOrder, viewOrders, confirmOrder, cancelOrder } from "../controllers/order.controller";

const orderRouter = express.Router();

orderRouter.post("/create", verifyToken, createOrder);
orderRouter.get("/", verifyToken, viewOrders);
orderRouter.get("/:orderId", verifyToken, viewOrders);
orderRouter.put("/:orderId/confirm", verifyToken, confirmOrder);
orderRouter.put("/:orderId/cancel", verifyToken, cancelOrder);

export default orderRouter;