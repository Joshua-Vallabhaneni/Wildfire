// server/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// Get all conversations for a user
router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all messages where user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: -1 });

    // Get unique conversation partners
    const conversationPartners = new Set();
    const conversations = [];
    const userCache = new Map();

    for (const message of messages) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.add(partnerId);
        
        // Get partner's user info (with caching)
        let partnerInfo;
        if (userCache.has(partnerId)) {
          partnerInfo = userCache.get(partnerId);
        } else {
          partnerInfo = await User.findById(partnerId).select('name email');
          userCache.set(partnerId, partnerInfo);
        }

        conversations.push({
          userId: partnerId,
          name: partnerInfo.name,
          email: partnerInfo.email,
          lastMessage: message.content,
          timestamp: message.timestamp
        });
      }
    }

    // Sort by most recent message
    conversations.sort((a, b) => b.timestamp - a.timestamp);

    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Error getting conversations" });
  }
});

// Get messages between two users
router.get("/:userId/:partnerId", async (req, res) => {
  try {
    const { userId, partnerId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Error getting messages" });
  }
});

// Send a new message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      timestamp: new Date()
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Error sending message" });
  }
});

// Add endpoint to search users
router.get("/search", async (req, res) => {
  try {
    const { term, type } = req.query;

    const users = await User.find({
      name: { $regex: term, $options: 'i' },
      isVolunteer: type === 'volunteer'
    }).select('name email');

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Error searching users" });
  }
});

module.exports = router;