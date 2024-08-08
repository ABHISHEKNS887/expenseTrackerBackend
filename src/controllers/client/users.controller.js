import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { generateAccessAndRefreshToken, validateMandatoryParams } from "../../utils/commonUtil.js";
import { User } from "../../models/client/users.model.js";
import { OPTIONS } from "../../constants.js";

const registerUser = asyncHandler( async(req, res) => {
    const {empId, email, password} = req.body;

    validateMandatoryParams({
        empId: empId,
        email: email,
        password: password
    })

    const existingUser = await User.findOne({
        $and: [{empId}, {email}]
    })

    if (!existingUser) throw new ApiError(404, "Emp Id or Email not found")

    if (existingUser.password) throw new ApiError(404, "User already registered")

    existingUser.password = password;
    await existingUser.save({validateBeforeSave: true});

    const createdUser = await User.findById(existingUser?._id).select('-password -refreshToken')

    res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"))
})

const logInUser = asyncHandler(async(req, res) => {
    const { empId, password } = req.body;

    validateMandatoryParams({
        empId: empId,
        password: password
    })

    const existingUser = await User.findOne({empId: empId})

    if (!existingUser) {
        throw new ApiError(404, "Emp Id does not exist")
    }

    const isPasswordValid = await existingUser.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existingUser?._id, User)

    const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken")

    res
    .status(200)
    .cookie("accessToken", accessToken, OPTIONS)
    .cookie("refreshToken", refreshToken, OPTIONS)
    .json(new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
    }, "User logged in successfully"))

})

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(req.user._id, 
        {
            $unset : {refreshToken: 1} // This will remove the field from the document.
        },
        {
            new: true // This will return the data after update.
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken", OPTIONS)
    .clearCookie("refreshToken", OPTIONS)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Old Password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: true});

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed successfully"))
})

export {registerUser, logInUser, logoutUser, changeCurrentPassword}