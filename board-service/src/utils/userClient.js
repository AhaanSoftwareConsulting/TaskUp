const axios = require('axios');
const config = require('../config/config');

const userCache = new Map();

async function getUserById(id) {
  if (!id) return null;

  const key = String(id);

  if (userCache.has(key)) {
    return userCache.get(key);
  }

  try {
    const { data } = await axios.get(
      `${config.services.userServiceUrl}/internal/users/${key}`,
      {
        timeout: 3000,
      }
    );

    const user = {
      id: key,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
    };

    userCache.set(key, user);

    return user;
  } catch (error) {
    console.error(
      `userClient: failed to fetch user ${key}:`,
      error.message
    );

    return {
      id: key,
      full_name: null,
      email: null,
      role: null,
    };
  }
}

async function getUsersByIds(ids = []) {
  const uniqueIds = [
    ...new Set(
      ids
        .filter(Boolean)
        .map(String)
    ),
  ];

  const results = await Promise.all(
    uniqueIds.map(getUserById)
  );

  const byId = {};

  results.forEach((user) => {
    if (user) {
      byId[user.id] = user;
    }
  });

  return byId;
}

module.exports = {
  getUserById,
  getUsersByIds,
};