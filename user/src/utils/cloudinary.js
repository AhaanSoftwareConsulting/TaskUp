const { v2: cloudinary } = require('cloudinary');
const config = require('../config/config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

const FOLDER = 'taskup/avatars';

function uploadAvatar(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: FOLDER, resource_type: 'image' }, (err, res) => (err ? reject(err) : resolve(res)))
      .end(buffer);
  });
}

// Only ever resolves ids inside our own avatar folder, so a URL can't make us delete anything else.
function publicIdFromUrl(url) {
  const m = /\/upload\/(?:v\d+\/)?(taskup\/avatars\/[^./]+)\.[a-z0-9]+$/i.exec(url || '');
  return m ? m[1] : null;
}
async function destroyByUrl(url) {
  const id = publicIdFromUrl(url);
  if (!id) return;
  try { await cloudinary.uploader.destroy(id, { resource_type: 'image', invalidate: true }); }
  catch (e) { console.error('cloudinary avatar delete failed:', e.message); }
}
module.exports = { uploadAvatar, destroyByUrl };