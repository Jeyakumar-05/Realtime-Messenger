import User from '../models/userModels.js';
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

        //socket.io implementation

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage", error.message);
        res.status(500).json({ error: "Internal Server error" });
    }
};