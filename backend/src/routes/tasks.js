const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const redis = require('../utils/redis');
const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// Create and run task
router.post('/', auth, async (req, res) => {
  try {
    const { title, inputText, operation } = req.body;
    const task = new Task({ userId: req.userId, title, inputText, operation });
    await task.save();

    // Push to Redis queue
    await redis.lpush('task_queue', JSON.stringify({ taskId: task._id.toString(), inputText, operation }));
    
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;