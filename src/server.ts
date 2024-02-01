import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDB } from './db/connection';
import router from './api/routes';

require("dotenv").config();

dotenv.config();
const app = express();

// app.use(cors({
//     origin: "*",
//     methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || "3000";
app.listen(PORT, () => {
    connectToDB();
    app.use('/api', router);
})
