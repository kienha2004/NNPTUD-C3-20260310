var express = require('express');
var router = express.Router();
var Role = require('../schemas/role');
var User = require('../schemas/user');

// GET all roles (not deleted)
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false });
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET role by ID (not deleted)
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE a new role
router.post('/', async (req, res) => {
  try {
    const newRole = new Role(req.body);
    const savedRole = await newRole.save();
    res.status(201).json({ success: true, data: savedRole });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE a role by ID
router.put('/:id', async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE (soft delete) a role by ID
router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, message: 'Role soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4) GET /roles/:id/users - get all users that have this role
router.get('/:id/users', async (req, res) => {
  try {
    // Check if role exists
    const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Find users by role ID
    const users = await User.find({ role: req.params.id, isDeleted: false }).populate('role');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
