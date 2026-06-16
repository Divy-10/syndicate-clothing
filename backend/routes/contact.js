const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// @route   POST api/contact/send
// @desc    Send a message
// @access  Public
router.post('/send', async (req, res) => {
  try {
    console.log("Message received in backend:", req.body); // DEBUG LOG
    
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    
    res.status(200).json({ success: true, message: 'Message saved to database!' });
  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// @route   GET api/contact/messages
// @desc    Get all messages (Admin)
// @access  Private
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// @route   DELETE api/contact/messages/:id
// @desc    Delete a message (Admin)
// @access  Private
router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: 'Error deleting message' });
  }
});

module.exports = router;
