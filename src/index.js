import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import { app } from "./app.js";
import  swaggerUI from 'swagger-ui-express';
import {swaggerDocument} from './swagger.js'

dotenv.config({
    path: "/env"
})

// Serve Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

connectDB()
.then( () => {
    app.on("error", (error) => {
        console.error("App Error: ", error);
        throw error;
    })

    app.listen(process.env.PORT || 3000, () => {
        console.log("Server listening on port " + process.env.PORT)
    })
})
.catch((error) => {
    console.error("DB connection Failed: ", error)
})

