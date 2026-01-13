import User from '../models/userModels.js';
import Message from '../models/messageModel.js';
import cloudinary from '../lib/cloudinary.js';
import { getReceiverSocketId } from '../lib/socket.js';
import { io } from '../lib/socket.js';

export const getUsersForSidebar = async (req, res) => {
    try {

        const loggeduser = req.user._id;

        const filteredusers = await User.find({ _id: { $ne: loggeduser } }).select("-password");

        // Get unread count for each user
        const usersWithUnreadCount = await Promise.all(
            filteredusers.map(async (user) => {
                const unreadCount = await Message.countDocuments({
                    senderId: user._id,
                    recieverId: loggeduser,
                    readAt: null,
                });

                return {
                    ...user.toObject(),
                    unreadCount,
                };
            })
        );

        res.status(200).json(usersWithUnreadCount);

    } catch (error) {
        console.log("Error in getUserForSidebar", error);
        res.status(500).json({ error: "Internal Server error" });

    }
}

export const getMessages = async (req, res) => {
    try {

        const { id: userChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, recieverId: userChatId },
                { senderId: userChatId, recieverId: myId },
            ]
        })

        // Mark messages as read when user opens the chat
        await Message.updateMany(
            {
                senderId: userChatId,
                recieverId: myId,
                readAt: null,
            },
            {
                readAt: new Date(),
            }
        );

        res.status(200).json(messages);


    } catch (error) {
        console.log("Error in getMessages", error.message);
        res.status(500).json({ error: "Internal Server error" });

    }
}


export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const myId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Only mark as read if the current user is the receiver
        if (message.recieverId.toString() === myId.toString() && !message.readAt) {
            message.readAt = new Date();
            await message.save();
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.log("Error in markMessageAsRead", error.message);
        res.status(500).json({ error: "Internal Server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id : recieverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if(image){
            const uploadedResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadedResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            recieverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(recieverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage", error.message);
        res.status(500).json({ error: "Internal Server error" });
    }
};