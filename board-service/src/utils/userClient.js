const axios = require('axios');
const config = require('../config/config');

const userCache = new Map();

async function getUserById(id) {
  if (!id) return null;

  const key = String(id);

  if (userCache.has(key)) {
    return userCache.get(key);
  }

  const url =
    `${config.services.userServiceUrl}/internal/users/${key}`;

  console.log("========== USER SERVICE CALL ==========");
  console.log("BASE URL:", config.services.userServiceUrl);
  console.log("FULL URL:", url);
  console.log("USER ID:", key);

  try {
    const { data } = await axios.get(url, {
      timeout: 5000,
    });

    console.log("USER SERVICE STATUS: 200");
    console.log("USER SERVICE DATA:", {
      id: data.id,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
    });

    const user = {
      id: key,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
    };

    userCache.set(key, user);

    return user;
  } catch (error) {
    console.error("========== USER SERVICE ERROR ==========");
    console.error({
      url,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      response: error.response?.data,
    });

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