import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { validateMandatoryParams } from "../../utils/commonUtil.js";
import { User } from "../../models/client/users.model.js";

const createUser = asyncHandler( async(req, res) => {
    const {empId, userName, email} = req.body;

    validateMandatoryParams({
            empId: empId,
            userName: userName,
            email: email
        })

    const existedUser = await User.findOne({
        $or: [{empId}, {email}]
    })

    if (existedUser) throw new ApiError(401, 'User already exists')

    const user = await User.create({
        empId: empId,
        userName: userName,
        email: email
    })

    const createdUser = await User.findById(user._id)

    if (!createdUser) throw new ApiError(500, 'Something went wrong while creating a new user')

    res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"))

})

const getUsers = asyncHandler( async(req, res) => {
    const {page = 1, limit = 10} = req.query

    // Extract page number and limit from req.query
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Calculate startIndex and endIndex for pagination
    const skip = (pageNumber - 1) * limitNumber;

    const users = await User.find({}).skip(skip).limit(limitNumber);

    // Count total number of users
    const totalUsers = await User.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limitNumber);

    res
    .status(200)
    .json(new ApiResponse(200, {
        page: pageNumber,
        limit: limitNumber,
        totalUsers: totalUsers,
        totalPages: totalPages,
        data: users}, 
        "Fetched users list successfully"))
})


const checkDataIfExists = async function (data) {
    const existData = [];
    for (const item in data) {
        const existedNewEmp = await User.findOne({[item]: data[item]});
        if (existedNewEmp) existData.push(item);
    }

    return existData
}

const updateUser = asyncHandler( async(req, res) => {
    const {userName, email} = req.body;
    const {empId} = req.params;

    validateMandatoryParams({
            empId: empId,
            userName: userName,
            email: email
        })

    const existedUser = await User.findOne({empId})

    if (!existedUser) throw new ApiError(401, 'User not exists')

    const existedData = await checkDataIfExists({userName: userName, email: email})

    if (existedData.length > 0) throw new ApiError(401, `'${existedData.join(", ")}' already exists`)

    const updateUser = await User.findByIdAndUpdate(existedUser?._id,
        {
            $set: {
                userName: userName,
                email: email
            }
        },
        {
            new: true
        }
    )

    res
    .status(200)
    .json(new ApiResponse(200, updateUser, "User updated successfully"))

})

const deleteUser = asyncHandler( async(req, res) => {
    const {empId} = req.params;

    validateMandatoryParams({
            empId: empId
        })

    const existedUser = await User.findOne({empId})

    if (!existedUser) throw new ApiError(401, 'User not exists')

    await User.findByIdAndDelete(existedUser?._id)

    res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));

})

export { createUser, getUsers, updateUser, deleteUser }