import elasticClient from "../../../client/elasticClient";
import { Request, Response } from "express";
import { apiError, apiSuccess, globalErrors } from "../utils/helper";
import config from "../../../config";

export const ping = async (req: Request, res: Response) => {
    try {
        elasticClient.ping({
            requestTimeout: 30000,
        }, function (error: any) {
            if (error) {
                return globalErrors(400, "Elasticsearch cluster is down!", res);
            } else {
                return apiSuccess(200, "Success! Elasticsearch cluster is up!", res);
            }
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "ping");
    }
};

export const initIndex = async (req: Request, res: Response) => {
    try {
        const indexName = req.params.indexName
        elasticClient.indices.create({
            index: indexName
        }).then(function (data: any) {
            return apiSuccess(201, "Index initialized succesfully", res, data);
        }, function (err: any) {
            return globalErrors(400, err.message, res);
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "initIndex");
    }
};

export const indexExists = async (req: Request, res: Response) => {
    try {
        const indexName = req.params.indexName
        elasticClient.indices.exists({
            index: indexName
        }).then(function (data: any) {
            if (data) {
                return apiSuccess(200, "Index exist!", res);
            } else {
                return globalErrors(400, "Index doesn't exist!", res);
            }
        }, function (err: any) {
            return globalErrors(400, err.message, res);
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "initIndex");
    }
};

export const initMapping = async (req: Request, res: Response) => {
    try {
        const indexName = req.params.indexName;
        const payload = req.body;
        elasticClient.indices.putMapping({
            index: indexName,
            body: payload
        }).then(function (data: any) {
            if (data) {
                return apiSuccess(200, "Mapping done!", res);
            } else {
                return globalErrors(400, "Some Issue occured during mapping!", data);
            }
        }, function (err: any) {
            return globalErrors(400, err.message, res);
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "initMapping");
    }
};

export const addDocument = async (req: Request, res: Response) => {
    try {
        const { indexName, id, payload } = req.body;
        elasticClient.index({
            index: indexName,
            id,
            body: payload
        }).then(function (data: any) {
            if (data) {
                return apiSuccess(200, "document added succesfully!", res, data);
            } else {
                return globalErrors(400, "Some Issue occured!", data);
            }
        }, function (err: any) {
            return globalErrors(400, err.message, res);
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "addDocument");
    }
};

export const searchDocument = async (req: Request, res: Response) => {
    try {
        const indexName = req.query.indexName;
        const query = req.query.q
        const payload = {
            query: {
                match: {
                    category: query
                }
            }
        };
        elasticClient.search({
            index: indexName,
            body: payload
        }).then(function (data: any) {
            if (data) {
                return apiSuccess(200, "document fetched succesfully!", res, data);
            } else {
                return globalErrors(400, "Some Issue occured!", data);
            }
        }, function (err: any) {
            return globalErrors(400, err.message, res);
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "searchDocument");
    }
};

export const updateDocument = async (req: Request, res: Response) => {
    try {
        const { indexName, id } = req.query;
        const payload = req.body;
        elasticClient.update({
            index: indexName,
            id: id,
            body: {
                doc: payload
            }
        }).then(function (data: any) {
            if (data) {
                return apiSuccess(200, "document updated succesfully!", res, data);
            } else {
                return globalErrors(400, "Some Issue occured!", data);
            }
        }, function (err: any) {
            return globalErrors(400, err.message, res);
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "updateDocument");
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { indexName, id } = req.query;
        elasticClient.delete({
            index: indexName,
            id,
        }).then(function (data: any) {
            if (data) {
                return apiSuccess(200, "document deleted succesfully!", res, data);
            } else {
                return globalErrors(400, "Some Issue occured!", data);
            }
        }, function (err: any) {
            return globalErrors(400, err.message, res);
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "deleteDocument");
    }
};

export const deleteAll = async (req: Request, res: Response) => {
    try {
        elasticClient.indices.delete({
            index: '_all'
        }).then(function (data: any) {
            if (data) {
                return apiSuccess(200, "deleted succesfully!", res, data);
            } else {
                return globalErrors(400, "Some Issue occured!", data);
            }
        }, function (err: any) {
            return globalErrors(400, err.message, res);
        });
    } catch (error: any) {
        return apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "deleteAll");
    }
};