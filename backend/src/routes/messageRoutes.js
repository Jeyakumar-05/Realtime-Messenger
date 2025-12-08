import express from "express"
import { protectRoute } from "../middleware/authMiddleware";
import { getUsersForSidebar, getMessages } from "../controllers/messageControllers";

const router = express.Router()

router.get('/users',protectRoute, getUsersForSidebar);
router.get('/:id',protectRoute, getMessages);

export default router;