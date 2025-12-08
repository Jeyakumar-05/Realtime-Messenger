import User from '../models/userModels/js';
import Message from '../models/messageModel.js';

export const getUsersForSidebar = async (req, res) => {
    try {

        const loggeduser = req.user._id;

        const filteredusers = await User.find({ _id: { $ne: loggeduser } }).select("-password");

        res.status(200).json(filteredusers);

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

        res.status(200).json(messages);


    } catch (error) {
        console.log("Error in getMessages", error.message);
        res.status(500).json({ error: "Internal Server error" });

    }
}