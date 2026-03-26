const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

const router = express.Router();

// all message routes require authentication
router.use(authMiddleware.protect);

// get conversation with another user
router.get('/:userId', messageController.getConversation);

// send new message
router.post('/', messageController.sendMessage);

module.exports = router;
