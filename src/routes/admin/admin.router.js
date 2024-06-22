import { Router } from "express";
import { registerAdmin, loginAdmin, logoutAdmin } from "../../controllers/admin/admin.controller.js";
import { verifyAdminJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerAdmin);

router.route('/login').post(loginAdmin);

// Secure Routes
 router.route('/logout').post(verifyAdminJWT, logoutAdmin);

 export default router;