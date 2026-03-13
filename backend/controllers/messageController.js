const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

// Retrieve conversation between current user and another user
exports.getConversation = async (req, res) => {
  try {
    const otherId = req.params.userId;
    if (!mongoose.isValidObjectId(otherId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Optional: verify the other user exists
    const other = await User.findById(otherId).select('name role');
    if (!other) {
      return res.status(404).json({ message: 'User not found' });
    }

    const messages = await Message.find({
      $or: [
        { sender_id: req.user._id, receiver_id: otherId },
        { sender_id: otherId, receiver_id: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Conversation error', err);
    res.status(500).json({ message: 'Error fetching conversation', error: err.message });
  }
};

// Send a new message to another user
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content || !content.trim()) {
      return res.status(400).json({ message: 'receiver_id and content are required' });
    }

    if (!mongoose.isValidObjectId(receiver_id)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // ensure receiver exists
    const recipient = await User.findById(receiver_id);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const message = await Message.create({
      sender_id: req.user._id,
      receiver_id,
      content: content.trim(),
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error', err);
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};
