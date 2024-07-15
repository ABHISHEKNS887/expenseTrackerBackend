import { Router } from "express";
import { registerUser, logInUser, logoutUser, changeCurrentPassword } from "../../controllers/client/users.controller.js";
import { verifyUserJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser);

router.route('/login').post(logInUser);

// Secure Routes
router.route('/logout').post(verifyUserJWT, logoutUser);

router.route('/change-password').post(verifyUserJWT, changeCurrentPassword);

export default router;