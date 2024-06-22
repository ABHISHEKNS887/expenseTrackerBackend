import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Type } from "../../models/admin/type.model.js";
import { validateMandatoryParams } from "../../utils/commonUtil.js";

// This API handles both creating and updating the type.
const addAndUpdateType = asyncHandler( async(req, res) => {
    const { type, categories} = req.body;
    let createType;

    validateMandatoryParams([type, categories])

    const getType = await Type.findOne({type})

    if (getType) {
        createType = await Type.findByIdAndUpdate(
            getType._id,
            {
                $set: {
                    categories: categories.split(',').map(category => category.trim())
                }
            },
            {
                new: true
            }
        )
    }
    else {
        createType = await Type.create({
        type: type,
        categories: categories.split(',')
    })
    }


    if (!createType) throw new ApiError(500, 'Something went wrong while creating type')

    res
    .status(200)
    .json(new ApiResponse(200, createType, "Type created successfully"))
})

export {addAndUpdateType}