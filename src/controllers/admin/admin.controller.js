import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Admin } from "../../models/admin/admin.model.js";
import { generateAccessAndRefreshToken, validateMandatoryParams } from "../../utils/commonUtil.js";

const OPTIONS = {
    httpOnly: true,
    secure: true
}

const registerAdmin = asyncHandler( async(req, res) => {
    const {email, password} = req.body;

    validateMandatoryParams({
        email: email,
        password: password
    })

    const existedAdmin = await Admin.findOne({email: email});

    if (existedAdmin) {
        throw new ApiError(401, "Email already registered");
    }

    const admin = await Admin.create({
        email: email,
        password: password
    })

    const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken")

    if (!createdAdmin) throw new ApiError(500, "Something went wrong while registering admin")

    return res.
    status(200)
    .json(new ApiResponse(200, createdAdmin, "Admin registered successfully"))

})

const loginAdmin = asyncHandler( async(req, res) => {
    const {email, password} = req.body;

    validateMandatoryParams({
        email: email,
        password: password
    }) 

    const existedAdmin = await Admin.findOne({email: email});

    if (!existedAdmin) {
        throw new ApiError(404, "Admin does not exist");
    }

    const isPasswordValid = await existedAdmin.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "Incorrect password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedAdmin?._id, Admin)

    const loggedInAdmin = await Admin.findById(existedAdmin._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, OPTIONS)
    .cookie("refreshToken", refreshToken, OPTIONS)
    .json(new ApiResponse(200, 
        {
            admin: loggedInAdmin, accessToken, refreshToken
        },
        "Admin logged in successfully"
    ))
})

const logoutAdmin = asyncHandler( async(req, res) => {
    await Admin.findByIdAndUpdate(req.admin._id, 
        {
            $unset : {refreshToken: 1} // This will remove the filed from the document.
        },
        {
            new: true // This will return the data after update.
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken", OPTIONS)
    .clearCookie("refreshToken", OPTIONS)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"))
})

export {registerAdmin, loginAdmin, logoutAdmin}