import { Router } from "express";
import { createType, updateExpenseType, deleteExpenseType, 
    getallExpenseTypes
 } 
 from "../../controllers/admin/expenseTypes.controller.js";
import { verifyAdminJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// secure routers
router.route('/createExpenseType').post(verifyAdminJWT, createType);

router.route('/updateExpenseType').patch(verifyAdminJWT, updateExpenseType);

router.route('/deleteExpenseType').delete(verifyAdminJWT, deleteExpenseType);

router.route('/allExpenseTypes').get(verifyAdminJWT, getallExpenseTypes);

export default router;