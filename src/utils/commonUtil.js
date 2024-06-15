import { Admin } from "../models/admin/user.model.js";
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
    for (const param in params) {
        if (!param) throw new ApiError(404, `${param} not found`)
    }
}

export { generateAccessAndRefreshToken, validateMandatoryParams }