import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from "helmet";

const app = express();

app.use(cors(
    {
        origin: process.env.CROSS_ORIGIN,
        methods: 'GET,POST,PUT,DELETE,PATCH', // Allow these HTTP methods
        allowedHeaders: 'Content-Type,Authorization', // Allow these headers
    }
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
import expenseTypesRouter from "./routes/admin/expenseTypes.router.js";
import userRouter from "./routes/admin/users.router.js";

//router declarations
app.use('/api/v1/admin/', adminRouter);
app.use('/api/v1/admin/expenseTypes/', expenseTypesRouter);
app.use('/api/v1/admin/users/', userRouter);

// -------------------------------- Admin Routes --------------------------------

// -------------------------------- Client Routes --------------------------------
// import router
import clientRouter from "./routes/client/users.router.js";
import expenseRouter from "./routes/client/expenses.router.js";

//router declarations
app.use('/api/v1/client/', clientRouter);
app.use('/api/v1/expense/', expenseRouter);

// -------------------------------- Client Routes --------------------------------
export { app }