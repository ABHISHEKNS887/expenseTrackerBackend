import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ExpenseTypes } from "../../models/admin/expenseTypes.model.js";
import { validateMandatoryParams } from "../../utils/commonUtil.js";

// This API handles creating the expense type.
const createType = asyncHandler( async(req, res) => {
    const { category, description, limit} = req.body;

    validateMandatoryParams({
        category: category,
        description: description,
        limit: limit
    })

    const getType = await ExpenseTypes.findOne({category})

    if (getType) throw new ApiError(409, `${category} expense type already exists`)

    const createExpenseType = await ExpenseTypes.create(
        {
            category: category,
            description: description,
            limit: limit
        }
    )

    const expenseType = await ExpenseTypes.findById(createExpenseType._id)

    if (!expenseType) throw new ApiError(500, 'Something went wrong while creating expense type')

    res
    .status(200)
    .json(new ApiResponse(200, expenseType, "Expense Type created successfully"))
})

// The Api will update only description and limit.
const updateExpenseType = asyncHandler(async(req, res) => {
    const { category, description, limit} = req.body;

    validateMandatoryParams({
        category: category,
        description: description,
        limit: limit
    })

    const getType = await ExpenseTypes.findOne({category})

    if (!getType) throw new ApiError(409, `${category} expense type already exists`)

    const expenseType = await ExpenseTypes.findByIdAndUpdate(getType._id, 
        {
            $set: {
                description: description,
                limit: limit
            }
        },
        {
            new: true
        }
    )

    res
    .status(200)
    .json(new ApiResponse(200, expenseType, `Expense Type '${category}' updated successfully`))

})

const deleteExpenseType = asyncHandler( async(req, res) => {
    const {category} = req.body;

    validateMandatoryParams({
        category: category
    })

    const getType = await ExpenseTypes.findOne({category})

    if (!getType) throw new ApiError(409, `${category} expense type already exists`)

    await ExpenseTypes.findByIdAndDelete(getType._id)

    res
    .status(200)
    .json(new ApiResponse(200,{}, `Expense Type '${category}' deleted successfully`))

})

const getallExpenseTypes = asyncHandler( async(_, res) => {
    const expenseTypes = await ExpenseTypes.find({})

    res
    .status(200)
    .json(new ApiResponse(200, expenseTypes, "Fetched all expense types"))
});

export {createType, updateExpenseType, deleteExpenseType, getallExpenseTypes}