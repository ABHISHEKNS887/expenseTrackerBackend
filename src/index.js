import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import { app } from "./app.js";


dotenv.config({
    path: "/env"
})

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

