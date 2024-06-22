import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from "helmet";

const app = express();

app.use(cors(
    {origin: process.env.CROSS_ORIGIN,
    credentials: true}
))

// enabling the Helmet middleware
app.use(helmet())

app.use(express.json({limit: "16kb"})); // Setting limit for JSON responses.
app.use(express.urlencoded({extended: true, limit: "16kb"})); // converting url to readable we use urlencoded.
app.use(express.static('public'))
app.use(cookieParser());

// -------------------------------- Admin Routes --------------------------------
// import router
import adminRouter from "./routes/admin/admin.router.js";
import typeRouter from "./routes/admin/type.router.js";

//router declarations
app.use('/api/v1/admin/', adminRouter);
app.use('/api/v1/types/', typeRouter);

// -------------------------------- Admin Routes --------------------------------
export { app }