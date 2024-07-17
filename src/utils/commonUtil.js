import { Admin } from "../models/admin/admin.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

const generateAccessAndRefreshToken = async (userId, Model) => {
    try {
        const user = await Model.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token")
    }
}

const validateMandatoryParams = function (params) {
    let empty_params = []
    for (const param in params) {
        if (!params[param]) empty_params.push(param)
    }

    if (empty_params.length > 0) throw new ApiError(404, `${empty_params.join(", ")} params not found`)
}

const isValidObjectId = function(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export { generateAccessAndRefreshToken, validateMandatoryParams, isValidObjectId }