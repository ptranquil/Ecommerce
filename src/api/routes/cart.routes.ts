import express from "express";
import ValidateZod from "../validators";
import verifyToken from "../middlewares/verifyToken";
import { addProductToCart, clearCart, removeCartItem, updateCart, viewCart } from "../controllers/cart.controller";
import { cartItemSchema } from "../schema/cart.schema";

const cartRouter = express.Router();

cartRouter.post("/", verifyToken, ValidateZod(cartItemSchema), addProductToCart);
cartRouter.get("/", verifyToken, viewCart);
cartRouter.put("/", verifyToken, updateCart);
cartRouter.delete("/clear", verifyToken, clearCart);
cartRouter.delete("/:productId", verifyToken, removeCartItem);

export default cartRouter;