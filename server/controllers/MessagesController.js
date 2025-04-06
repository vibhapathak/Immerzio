import Message from "../models/MessagesModel.js";

export const getMessages = async (request, response, next) => {
    try {
        const user1 = request.userId;
        const user2 = request.body.id;

        if (!user1 || !user2) { // Changed to check if either user is missing
            return response.status(400).json({ error: "Both user IDs are required" });
        }

        const messages = await Message.find({
            $or: [ // Changed to $or since we want messages in either direction
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        }).sort({ timestamp: 1 });

        return response.status(200).json({ messages });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: "Internal server error" });
    }
};