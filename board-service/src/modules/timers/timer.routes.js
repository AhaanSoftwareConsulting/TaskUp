const express=require('express');
const router=express.Router();
const { protect } = require("../../middleware/auth");
const { toggleTimer, getMyActiveTimer, getTaskHours } = require("./timer.controller");

router.post('/:taskId/timer', protect, toggleTimer);
router.get('/timers/active', protect, getMyActiveTimer);   
router.get('/:taskId/hours', protect, getTaskHours);   
module.exports=router;