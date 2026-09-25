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


module.exports = router;