import express from "express";
import { getProductBasedOnCategory, getProducts } from "../controllers/product.controller";

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.get("/category/:category", getProductBasedOnCategory);

export default productRouter;