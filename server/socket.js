import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessagesModel.js";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  const tempMessageMap = new Map();
  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`client disconnected ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    try {
      if (!message.content && message.original && message.messageType === "text") {
        message.content = message.original;
      }

      const tempId = message._tempId;
      delete message._tempId;

      const createdMessage = await Message.create(message);

      if (tempId) {
        tempMessageMap.set(tempId, createdMessage._id.toString());
        setTimeout(() => {
          tempMessageMap.delete(tempId);
        }, 1000 * 60 * 30);
      }

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      const senderSocketId = userSocketMap.get(message.sender.toString());
      const recipientSocketId = userSocketMap.get(message.recipient.toString());

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }

      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const senderSocketId = userSocketMap.get(message.sender.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageError", {
          error: error.message,
          originalMessage: message
        });
      }
    }
  };

  const updateTranslations = async (data) => {
    try {
      const { messageId, translations } = data;

      let realMessageId = messageId;
      if (tempMessageMap.has(messageId)) {
        realMessageId = tempMessageMap.get(messageId);
      }

      const updatedMessage = await Message.findByIdAndUpdate(
        realMessageId,
        { translations },
        { new: true }
      )
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      const recipientSocketId = userSocketMap.get(updatedMessage.recipient.id.toString());
      const senderSocketId = userSocketMap.get(updatedMessage.sender.id.toString());

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("updateTranslations", updatedMessage);
      }

      if (senderSocketId) {
        io.to(senderSocketId).emit("updateTranslations", updatedMessage);
      }

    } catch (error) {
      console.error("Error updating translations:", error);
    }
  };

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("init", (userId) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
      }
    });

    socket.on("sendMessage", sendMessage);
    socket.on("updateTranslations", updateTranslations);
    socket.on("disconnect", () => disconnect(socket));
  });

  return io;
};

export default setupSocket;
