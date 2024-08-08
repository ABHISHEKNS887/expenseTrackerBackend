import { Router } from "express";
import { createExpense, updateExpense, deleteExpense } from "../../controllers/client/expenses.controller.js";
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

export default router;