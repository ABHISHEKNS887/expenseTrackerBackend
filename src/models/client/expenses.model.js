import mongoose, {Schema} from "mongoose";

const expenseSchema = new Schema({
    expenseMonthYear: {
        type: String,
        required: true,
        trim: true
    },
    empId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    expenseType: {
        type: Schema.Types.ObjectId,
        ref: "ExpenseTypes"
    },
    dateOfExpense: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
    },
    documents: [{
        type: String, // Cloudinary URL
        required: true,
    }],
    remarks: {
        type: String
    }
}, {timestamps: true})

export const Expense = new mongoose.model("Expense", expenseSchema);