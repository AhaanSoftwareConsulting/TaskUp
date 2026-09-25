const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const accountsRepository = require('./accounts.repository');

const router = express.Router();

router.get('/search', requireAuth, async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) return res.status(200).json([]);

    const users = await accountsRepository.searchByNameOrEmail(query.trim());

   
    const results = users.map(({ id, email, full_name, role }) => ({
      id,
      email,
      full_name,
      role,
    }));

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});
// user-service accounts.routes.js — add (manager/ceo only)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    if (!['manager', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await accountsRepository.listAll(); // needs a simple SELECT id, full_name, email, role, created_at FROM users
    res.json(users);
  } catch (err) { next(err); }
});


module.exports = router;