const express = require('express');
const router = express.Router();

const {
  createBoard, getBoardsForUser, getBoardById, addMemberToBoard,
  deleteBoard, editBoard, archiveBoard, removeMemberFromBoard,
} = require('./board.controller');
const { protect, hasAdminPrivileges } = require('../../middleware/auth');
const columnRoutes = require('../columns/column.routes');

router.post('/', protect, hasAdminPrivileges, createBoard);
router.get('/', protect, getBoardsForUser);
router.get('/:id', protect, getBoardById);

router.use('/:boardId/columns', columnRoutes);

router.patch('/:boardId/add-member', protect, hasAdminPrivileges, addMemberToBoard);
router.patch('/:boardId/archive', protect, hasAdminPrivileges, archiveBoard); // body: { archived: true | false }
router.delete('/:boardId', protect, hasAdminPrivileges, deleteBoard);
router.put('/:boardId', protect, hasAdminPrivileges, editBoard);
router.delete('/:boardId/members/:memberId', protect, hasAdminPrivileges, removeMemberFromBoard);

module.exports = router;
