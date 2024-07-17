import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ExpenseTypes } from "../../models/admin/expenseTypes.model.js";
import { validateMandatoryParams } from "../../utils/commonUtil.js";

// This API handles creating the expense type.
const createType = asyncHandler( async(req, res) => {
    const { expenseType, description, limit} = req.body;

    validateMandatoryParams({
        expenseType: expenseType,
        description: description,
        limit: limit
    })

    const getType = await ExpenseTypes.findOne({expenseType})

    if (getType) throw new ApiError(409, `${expenseType} expense type already exists`)

    const createExpenseType = await ExpenseTypes.create(
        {
            expenseType: expenseType,
            description: description,
            limit: limit
        }
    )

    const createdExpenseType = await ExpenseTypes.findById(createExpenseType._id)

    if (!createdExpenseType) throw new ApiError(500, 'Something went wrong while creating expense type')

    res
    .status(200)
    .json(new ApiResponse(200, createdExpenseType, "Expense Type created successfully"))
})

// The Api will update only description and limit.
const updateExpenseType = asyncHandler(async(req, res) => {
    const {description, limit} = req.body;
    const {expenseTypeId} = req.params;

    validateMandatoryParams({
        expenseTypeId: expenseTypeId,
        description: description,
        limit: limit
    })

    const getType = await ExpenseTypes.findById(expenseTypeId)

    if (!getType) throw new ApiError(404, `${expenseTypeId} expense type not exists`)

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
    .json(new ApiResponse(200, expenseType, `Expense Type '${expenseType}' updated successfully`))

})

const deleteExpenseType = asyncHandler( async(req, res) => {
    const {expenseTypeId} = req.params;

    validateMandatoryParams({
        expenseTypeId: expenseTypeId
    })

    const getType = await ExpenseTypes.findById(expenseTypeId)

    if (!getType) throw new ApiError(409, `Expense type does not exists`)

    await ExpenseTypes.findByIdAndDelete(getType._id)

    res
    .status(200)
    .json(new ApiResponse(200,{}, 'Expense Type deleted successfully'))

})

const getallExpenseTypes = asyncHandler( async(_, res) => {
    const expenseTypes = await ExpenseTypes.find({})

    res
    .status(200)
    .json(new ApiResponse(200, expenseTypes, "Fetched all expense types"))
});

export {createType, updateExpenseType, deleteExpenseType, getallExpenseTypes}