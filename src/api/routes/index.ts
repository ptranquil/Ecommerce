import express from "express";
import userRouter from "./users.routes";
import productRouter from "./product.routes";
import cartRouter from "./cart.routes";
import orderRouter from "./order.route";
import elasticRoute from "./elastic.route";

const router = express.Router();

router.use('/user', userRouter);
router.use('/product', productRouter);
router.use('/cart', cartRouter);
router.use('/order', orderRouter);
router.use('/elastic', elasticRoute);

export default router;