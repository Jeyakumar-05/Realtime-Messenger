import express from "express"
import { protectRoute } from "../middleware/authMiddleware.js";
import { getUsersForSidebar, getMessages, sendMessage, markMessageAsRead } from "../controllers/messageControllers.js";

const router = express.Router()

router.get('/users',protectRoute, getUsersForSidebar);
router.get('/:id',protectRoute, getMessages);
router.post('/send/:id',protectRoute, sendMessage);
router.put('/read/:messageId',protectRoute, markMessageAsRead);

export default router;