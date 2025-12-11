import express from "express"
import { protectRoute } from "../middleware/authMiddleware.js";
import { getUsersForSidebar, getMessages } from "../controllers/messageControllers.js";
import { sendMessage } from "../controllers/messageControllers.js";

const router = express.Router()

router.get('/users',protectRoute, getUsersForSidebar);
router.get('/:id',protectRoute, getMessages);
router.post('/send/:id',protectRoute, sendMessage);
// router.post('/send-image/:id',protectRoute, sendImage);

export default router;