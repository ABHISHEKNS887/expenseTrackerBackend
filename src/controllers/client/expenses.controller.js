import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Expense } from "../../models/client/expenses.model.js";
import { validateMandatoryParams, isValidObjectId } from "../../utils/commonUtil.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../../utils/cloudinary.js";
import { ExpenseTypes } from "../../models/admin/expenseTypes.model.js";

const createExpense = asyncHandler( async(req, res) => {
    const {expenseTypeId, dateOfExpense, amount, remarks} = req.body;

    validateMandatoryParams({expenseTypeId, dateOfExpense, amount})

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
        expenseMonthYear: getCurrentMonthYear(),
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

const getCurrentMonthYear = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const now = new Date();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  
  return `${month}${year}`;
};

const updateExpense = asyncHandler( async(req, res) => {
    const {expenseTypeId, dateOfExpense, amount, remarks} = req.body;
    const {expenseId} = req.params;

    const getExpense = await Expense.findById(expenseId);

    if (!getExpense) {
        throw new ApiError(404, `${expenseId} doesn't exist`)
    }

    if (expenseTypeId) {
        if (!isValidObjectId(expenseTypeId)){
            throw new ApiError(400, `Invalid expense type Id ${expenseTypeId}`)
        }

        if (!await ExpenseTypes.findById(expenseTypeId)){
            throw new ApiError(404, 'Expense type not found')
        }
    }

    if (amount) {
        if (isNaN(amount)){
            throw new ApiError(400, `Amount needs to be a number`)
        }
    }

    const body = checkProperties({expenseTypeId, dateOfExpense, amount, remarks})

    const documentLocalPath = req.files && Array.isArray(req.files.documents) && req.files.documents.length > 0 ? req.files.documents : null

    if (documentLocalPath) {
        // Delete existing document in the cloudinary
        const files = getExpense.documents
        for (const key in files) {
            if (files.hasOwnProperty(key)) {
                const url = files[key];
                await deleteOnCloudinary(url, 'raw');
                if (!deleteOnCloudinary){
                    throw new ApiError(400, "Error while deleting file in cloudinary.")
                }
            }
        }

        // Add the new document to the cloudinary
        const documentPaths = documentLocalPath.map(documentPath => documentPath.path)

        const cloudinaryDocuments = []

        for (let documentPath of documentPaths) {
            const cloudinaryDocument = await uploadOnCloudinary(documentPath)
            cloudinaryDocuments.push(cloudinaryDocument.url)
        }

        body.documents = cloudinaryDocuments
    }

    const expenseUpdate = await Expense.findByIdAndUpdate(expenseId,
        {
            $set: body
        },
        {
            new: true
        }
    )

    res
    .status(200)
    .json(new ApiResponse(200, expenseUpdate, `Expense updated successfully. ID: ${expenseId}`))
    
})

/**
 * Checks which properties of an object are not null or undefined.
 *
 * @param {Object} obj - The object to check.
 * @returns {Object} A new object containing only the properties that are not null or undefined.
 */
const checkProperties = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

export { createExpense , updateExpense}