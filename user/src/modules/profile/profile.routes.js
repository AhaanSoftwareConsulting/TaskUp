/**
 * profile.routes.js
 * Mounted at /profile in app.js.
 */
const express = require('express');
const controller = require('./profile.controller');
const { requireAuth } = require('../../middleware/auth');
const avatarUpload = require('../../middleware/avatarUpload');
const router = express.Router();

router.get('/me', requireAuth, controller.getMyProfile);
router.patch('/me', requireAuth, controller.saveMyProfile);                          
router.post('/me/avatar', requireAuth, avatarUpload, controller.uploadAvatar);
router.post('/', requireAuth, controller.createProfile);
router.get('/', requireAuth, controller.listProfiles);                               
router.get('/:profileId', requireAuth, controller.getProfile);                       
router.patch('/:profileId/review', requireAuth, controller.reviewProfile);
router.delete('/:profileId', requireAuth, controller.deleteProfile);

module.exports = router;
