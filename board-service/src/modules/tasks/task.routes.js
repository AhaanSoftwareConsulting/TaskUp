const express = require('express');
const router = express.Router();
const { moveTask, updateTask, deleteTask, getTasks} = require('./task.controller');
const { protect } = require('../../middleware/auth');
const { closeTask, reopenTask } = require('./task.lifecycle.controller');

router.patch('/:taskId/move', protect, moveTask);
router.patch('/:taskId', protect, updateTask);
router.delete('/:taskId', protect, deleteTask);
router.get('/', protect, getTasks);
router.post('/:taskId/close', protect, closeTask);
router.post('/:taskId/reopen', protect, reopenTask);

module.exports = router;
