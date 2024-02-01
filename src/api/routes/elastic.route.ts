import { addDocument, deleteAll, deleteDocument, indexExists, initIndex, initMapping, ping, searchDocument, updateDocument } from "../controllers/elastics.controller";
import express from "express";
const elasticRoute = express.Router();

elasticRoute.get('/ping', ping)
elasticRoute.post('/index/init/:indexName', initIndex)
elasticRoute.post('/index/check/:indexName', indexExists)
elasticRoute.post('/index/mapping/:indexName', initMapping)
elasticRoute.post('/add', addDocument)
elasticRoute.get('/search', searchDocument)
elasticRoute.put('/update', updateDocument)
elasticRoute.delete('/delete', deleteDocument)
elasticRoute.delete('/delete-all', deleteAll)

export default elasticRoute;