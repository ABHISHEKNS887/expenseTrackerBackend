import mongoose, {Schema} from "mongoose";

const expenseTypesSchema = new Schema({
    expenseType: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    limit: {
        type: Number,
        required: true,
        trim: true
    }
}, {timestamps: true})

export const ExpenseTypes = new mongoose.model("ExpenseTypes", expenseTypesSchema);