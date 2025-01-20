// server/routes/messageRoutes.js

const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// @route POST /api/messages
// @desc  Send a message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const newMessage = new Message({ senderId, receiverId, content });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message", error);
    res.status(500).json({ error: "Error creating message" });
  }
});

// @route GET /api/messages/:userId
// @desc  Get all messages for a user (either as sender or receiver)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // All messages where the user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: 1 }); // sort by time
    res.json(messages);
  } catch (error) {
    console.error("Error getting messages", error);
    res.status(500).json({ error: "Error getting messages" });
  }
});

module.exports = router;
