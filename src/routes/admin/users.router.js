import { Router } from "express";
import { createUser, getUsers, updateUser, deleteUser } from "../../controllers/admin/users.controller.js";
import { verifyAdminJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route('/createUser').post(verifyAdminJWT, createUser);

router.route('/getUsers').get(verifyAdminJWT, getUsers);

router.route('/updateUser/:empId').patch(verifyAdminJWT, updateUser);

router.route('/deleteUser/:empId').delete(verifyAdminJWT, deleteUser);

export default router;