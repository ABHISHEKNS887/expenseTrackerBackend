import { Router } from "express";
import { createType, updateExpenseType, deleteExpenseType, 
    getallExpenseTypes
 } 
 from "../../controllers/admin/expenseTypes.controller.js";
import { verifyAdminJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// secure routers
router.route('/')
.post(verifyAdminJWT, createType)
.get(verifyAdminJWT, getallExpenseTypes);

router.route('/:expenseTypeId')
.patch(verifyAdminJWT, updateExpenseType)
.delete(verifyAdminJWT, deleteExpenseType);


export default router;