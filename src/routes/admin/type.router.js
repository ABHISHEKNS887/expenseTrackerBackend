import { Router } from "express";
import { addAndUpdateType } from "../../controllers/admin/type.controller.js";
import { verifyAdminJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// secure routers
router.route('/expenseType').post(verifyAdminJWT, addAndUpdateType);

export default router;