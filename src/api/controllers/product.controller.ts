import { Request, Response } from "express";
import { apiError, apiSuccess, globalErrors } from "../utils/helper";
import config from "../../../config";
import { productModel, } from "../../db/model/product.model";
import elasticClient from "../../../client/elasticClient";

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await productModel.find();
        return apiSuccess(200, "Product fetched successfully", res, { count: products.length, products });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getProducts");
    }
};

export const getProductBasedOnCategory = async (req: Request, res: Response) => {
    try {
        const categoryName = req.params.category;
        const products = await productModel.find({ category: { $regex: new RegExp(categoryName, 'i') } });
        return apiSuccess(200, "Product fetched successfully", res, { count: products.length, products });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getProductBasedOnCategory");
    }
};

// export const getProducts = async (req: Request, res: Response) => {
//     try {
//         const query = { category: 'electronics' }

//         const response = await elasticClient.search({
//             index: 'products',
//             body: {
//                 query: {
//                     match: { category: "electronics" }
//                 }
//             },
//         });

//         const hits = response.body.hits.hits;
//         const productIds = hits.map((hit: any) => hit._id);

// Fetch products from MongoDB based on the IDs returned by Elasticsearch
//         const products = await productModel.find({ _id: { $in: productIds } });

//         res.json({
//             status: true,
//             message: 'Search results retrieved successfully',
//             data: products,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: false, message: 'Internal Server Error' });
//     }
// };
