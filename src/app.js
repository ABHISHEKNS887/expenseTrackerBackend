import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors(
    {origin: process.env.CROSS_ORIGIN,
    credentials: true}
))

app.use(express.json({limit: "16kb"})); // Setting limit for JSON responses.
app.use(express.urlencoded({extended: true, limit: "16kb"})); // converting url to readable we use urlencoded.
app.use(express.static('public'))
app.use(cookieParser());

export { app }