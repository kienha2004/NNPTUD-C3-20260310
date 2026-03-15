var express = require('express');
var router = express.Router();
var User = require('../schemas/user');

// GET all users (not deleted)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).populate('role');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE a new user
router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json({ success: true, data: savedUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE a user by ID
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE (soft delete) a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2) POST /enable - enable user if email and username match
router.post('/enable', async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ success: false, message: 'Email and username are required' });
    }

    const user = await User.findOne({ email, username, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid credentials or user not found' });
    }

    user.status = true;
    await user.save();
    
    res.json({ success: true, message: 'User status changed to true' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3) POST /disable - disable user if email and username match
router.post('/disable', async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ success: false, message: 'Email and username are required' });
    }

    const user = await User.findOne({ email, username, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid credentials or user not found' });
    }

    user.status = false;
    await user.save();
    
    res.json({ success: true, message: 'User status changed to false' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
