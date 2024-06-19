import { Router } from "express";
import { registerAdmin, loginAdmin, logoutAdmin } from "../../controllers/admin/admin.controller.js";
import { verifyAdminJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new admin
 *     description: Register a new admin with the required details.
 *     tags: 
 *       - Admin
 *     requestBody:
 *       description: Admin registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.route('/register').post(registerAdmin);


router.route('/login').post(loginAdmin);

// Secure Routes
 router.route('/logout').post(verifyAdminJWT, logoutAdmin);

 export default router;