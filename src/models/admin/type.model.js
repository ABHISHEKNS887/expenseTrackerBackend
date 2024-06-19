import mongoose, {Schema} from "mongoose";

const typeSchema = new Schema({
    type: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    categories: {
        type: [String],
        required: true,
        unique: true,
        trim: true
    }
}, {timestamps: true})

export const Type = new mongoose.model("Type", typeSchema);