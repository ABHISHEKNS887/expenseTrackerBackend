import { Router } from "express";
import { createExpense, updateExpense, deleteExpense, getExpense } from "../../controllers/client/expenses.controller.js";
import { verifyUserJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

router.route('/create').post(upload.fields([
            {
                name: "documents",
                maxcount: 5
            }
        ]), verifyUserJWT, createExpense);

router.route('/:expenseId')
.patch(upload.fields([
            {
                name: "documents",
                maxcount: 5
            }
        ]), verifyUserJWT, updateExpense)
.delete(verifyUserJWT, deleteExpense)

router.route('/').get(verifyUserJWT, getExpense)

export default router;