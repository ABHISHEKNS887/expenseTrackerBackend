import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Expense } from "../../models/client/expenses.model.js";
import { validateMandatoryParams, isValidObjectId } from "../../utils/commonUtil.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../../utils/cloudinary.js";
import { ExpenseTypes } from "../../models/admin/expenseTypes.model.js";

const createExpense = asyncHandler( async(req, res) => {
    const { expenseMonthYear, expenseTypeId, dateOfExpense, amount, remarks} = req.body;

    validateMandatoryParams({expenseMonthYear, expenseTypeId, dateOfExpense, amount})

    const isValidExpenseTypeId = isValidObjectId(expenseTypeId)

    if (!isValidExpenseTypeId){
        throw new ApiError(400, `Invalid expense type Id ${expenseTypeId}`)
    }
    
    const expenseType = await ExpenseTypes.findById(expenseTypeId)

    if (!expenseType){
        throw new ApiError(404, 'Expense type not found')
    }

    if (isNaN(amount)){
        throw new ApiError(400, `Amount needs to be a number`)
    }

    const documentLocalPath = req.files && Array.isArray(req.files.documents) && req.files.documents.length > 0 ? req.files.documents : null

    if (!documentLocalPath){
        throw new ApiError(404, "Document is required")
    }

    const documentPaths = documentLocalPath.map(documentPath => documentPath.path)


    const cloudinaryDocuments = []

    for (let documentPath of documentPaths) {
        const cloudinaryDocument = await uploadOnCloudinary(documentPath)
        cloudinaryDocuments.push(cloudinaryDocument.url)
    }

    const expense = await Expense.create({
        expenseMonthYear: expenseMonthYear,
        empId: req.user?._id,
        expenseType: expenseTypeId,
        dateOfExpense: dateOfExpense,
        amount: Number(amount),
        documents: cloudinaryDocuments,
        remarks: remarks
    })

    const createdExpense = await Expense.findById(expense?._id)

    if (!createdExpense){
        throw new Error(500, "Something went wrong while creating the expense")
    }

    res
    .status(200)
    .json(new ApiResponse(200, createdExpense, "Expense created Successfully"))
})

export { createExpense }