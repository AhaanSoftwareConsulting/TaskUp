const express = require('express');
const router = express.Router();
const { uploadFiles } = require('../../middleware/upload');
const {
  moveTask,
  updateTask,
  deleteTask,
  addTaskComment,
  toggleTimer,
  getTasks,
  uploadtaskFile,
  deleteTaskFile,
  toggleFavorite
} = require('./task.controller');
const { protect } = require('../../middleware/auth');



router.patch('/:taskId/move', protect, moveTask);
router.patch('/:taskId', protect, updateTask);
router.delete('/:taskId', protect, deleteTask);
router.post('/:taskId/timer', protect, toggleTimer);
router.get('/', protect, getTasks);
router.delete('/:taskId/upload/:fileId', protect, deleteTaskFile);
router.post('/:taskId/favorite', protect, toggleFavorite);
router.post('/:taskId/comments', protect, uploadFiles, addTaskComment);
router.post('/:taskId/upload', protect, uploadFiles, uploadtaskFile);

module.exports = router;
