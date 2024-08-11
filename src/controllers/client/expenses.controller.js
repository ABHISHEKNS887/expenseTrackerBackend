import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Expense } from "../../models/client/expenses.model.js";
import { validateMandatoryParams, isValidObjectId } from "../../utils/commonUtil.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../../utils/cloudinary.js";
import { ExpenseTypes } from "../../models/admin/expenseTypes.model.js";

// --------------------------------- Create Expense API --------------------------------
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
// --------------------------------- Create Expense API --------------------------------

// --------------------------------- Update Expense API --------------------------------
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
        await deleteFilesInCloudinary(files);

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
// --------------------------------- Update Expense API --------------------------------

// --------------------------------- Delete Expense API --------------------------------
const deleteExpense = asyncHandler( async(req, res) => {
    const {expenseId} = req.params;

    validateMandatoryParams({expenseId});

    const isValidExpenseId = isValidObjectId(expenseId)

    if (!isValidExpenseId){
        throw new ApiError(400, `Invalid Expense Id ${expenseId}`)
    }
    
    const expense = await Expense.findById(expenseId)

    if (!expense){
        throw new ApiError(404, 'Expense not found')
    }

    // Delete existing document in the cloudinary
    const files = expense.documents
    await deleteFilesInCloudinary(files);
    
    try {
        await Expense.findByIdAndDelete(expenseId)
    } catch (error) {
        throw new ApiError(500, 'Error While deleting the Expense')
    }

    res
    .status(200)
    .json(new ApiResponse(200, {}, `Successfully deleted Expense Id: ${expenseId}`))
})
// --------------------------------- Delete Expense API --------------------------------

// --------------------------------- Get Expense API --------------------------------
const getExpense = asyncHandler( async(req, res) => {
    const { query, sortBy = 'expenseMonthYear', sortType = 'asc' } = req.query

    // Create filter based on query
    const filter = {};
    if (query) {
        filter.expenseMonthYear = query; // Exact match on expenseMonthYear
    } else {
        throw new ApiError(404, "Query not found"); // Throw an error if query is not provided
}

    // Create sort object based on sortBy and sortType
    const sort = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType === 'asc' ? 1 : -1;
    }

    const expenseData = await Expense.aggregate([
        {
            $match: {
                empId: req.user._id,
                ...filter, // Include the filter in the $match stage
            },
        },
        {
            $lookup: {
                from: "expensetypes",
                localField: "expenseType",
                foreignField: "_id",
                as: "expenseType",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            category: 1,
                            description: 1,
                            limit: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: {
                path: "$expenseType",
                preserveNullAndEmptyArrays: true, // Keep documents even if expenseType is not found
            },
        },
        {
            $sort: sort, // Apply sorting after filtering and lookup
        },
    ]);

    // Add serial number to each document
    const expenseDataWithSerialNumbers = expenseData.map((item, index) => ({
        slNo: index + 1,
        ...item,
    }));

    res
    .status(200)
    .json(new ApiResponse(200, 
        expenseDataWithSerialNumbers, 
        expenseDataWithSerialNumbers.length > 0 ? "Fetched all expenses successfully": "No Data Found"))
})

// --------------------------------- Get Expense API --------------------------------
async function deleteFilesInCloudinary(files) {
    for (const key in files) {
        if (files.hasOwnProperty(key)) {
            const url = files[key];
            await deleteOnCloudinary(url, 'raw');
            if (!deleteOnCloudinary) {
                throw new ApiError(400, "Error while deleting file in cloudinary.");
            }
        }
    }
}

export { createExpense , updateExpense, deleteExpense, getExpense}


