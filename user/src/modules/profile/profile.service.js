/**
 * profile.service.js
 * Business logic for creating and managing tutor/institute profiles.
 */
const repo = require('./profile.repository');
const accountsRepository = require('../accounts/accounts.repository');
const { AppError, UserNotFoundError } = require('../../utils/errors');
const { isValidEmailFormat } = require('../../utils/validators');
const { uploadAvatar, destroyByUrl } = require('../../utils/cloudinary');

const PROFILE_TYPES = ['private_tutor', 'coaching_center', 'small_institute'];
const APPROVER_ROLES = ['manager', 'ceo', 'admin', 'super-admin'];
const DEFAULT_TYPE = 'employee';
const LIMITS = { location: 150, experience: 100, description: 1000, contactPhone: 30, contactEmail: 255 };
const LABELS = { location: 'Location', experience: 'Experience', description: 'Bio', contactPhone: 'Phone', contactEmail: 'Contact email' };
const EMPTY = { id: null, location: null, experience: null, description: null, contact_phone: null, contact_email: null, profile_image: null };

function canReview(user) {
  return APPROVER_ROLES.includes(user.role);
}

async function createProfile(userId, data) {
  const user = await accountsRepository.getById(userId);
  if (!user) throw new UserNotFoundError();

  if (!PROFILE_TYPES.includes(data.type)) {
    throw new AppError(`type must be one of: ${PROFILE_TYPES.join(', ')}`, 422, 'VALIDATION_ERROR');
  }

  const existing = await repo.getByUserId(userId);
  if (existing) {
    throw new AppError('This user already has a profile', 409, 'PROFILE_ALREADY_EXISTS');
  }

  return repo.create(userId, data);
}

async function getProfile(profileId) {
  const profile = await repo.getById(profileId);
  if (!profile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
  return profile;
}

async function listProfiles(filters) {
  return repo.getAll(filters);
}

/** Owner can edit their own profile's content fields (not status/rating). */
async function updateMyProfile(userId, fields) {
  const profile = await repo.getByUserId(userId);
  if (!profile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
  return repo.update(profile.id, fields);
}

/** Admin/manager/CEO reviews a submitted profile. */
async function reviewProfile(profileId, reviewerUser, status) {
  if (!canReview(reviewerUser)) {
    throw new AppError('Only an admin/manager/CEO can review profiles', 403, 'FORBIDDEN');
  }
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('status must be "approved" or "rejected"', 422, 'VALIDATION_ERROR');
  }

  const profile = await repo.getById(profileId);
  if (!profile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');

  return repo.updateStatus(profileId, status);
}

async function deleteProfile(userId, profileId, requester) {
  const profile = await repo.getById(profileId);
  if (!profile) throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');

  const isOwner = profile.user_id === requester.id;
  if (!isOwner && !canReview(requester)) {
    throw new AppError('Not authorized to delete this profile', 403, 'FORBIDDEN');
  }

  await repo.remove(profileId);
}

function cleanFields(input) {
  const out = {};
  for (const key of Object.keys(LIMITS)) {
    if (input[key] === undefined) continue;
    const v = input[key] === null ? '' : String(input[key]).trim();
    if (v.length > LIMITS[key]) throw new AppError(`${LABELS[key]} must be ${LIMITS[key]} characters or fewer`, 422, 'VALIDATION_ERROR');
    out[key] = v || null;
  }
  if (out.contactEmail && !isValidEmailFormat(out.contactEmail)) throw new AppError('Contact email is not valid', 422, 'VALIDATION_ERROR');
  if (out.contactPhone && !/^[+()\d\s-]{7,20}$/.test(out.contactPhone)) throw new AppError('Phone number is not valid', 422, 'VALIDATION_ERROR');
  return out;
}

async function upsert(userId, data) {
  const existing = await repo.getByUserId(userId);
  if (existing) return { profile: await repo.update(existing.id, data), previous: existing };
  return { profile: await repo.create(userId, { type: DEFAULT_TYPE, ...data }), previous: null };
}

async function getMyProfile(userId) {
  const p = await repo.getByUserId(userId);
  return p ? { ...p, exists: true } : { ...EMPTY, user_id: userId, exists: false };
}

async function saveMyProfile(userId, input) {
  const { profile } = await upsert(userId, cleanFields(input));
  return { ...profile, exists: true };
}

async function setAvatar(userId, file) {
  const result = await uploadAvatar(file.buffer);
  try {
    const { profile, previous } = await upsert(userId, { profileImage: result.secure_url });
    if (previous?.profile_image) destroyByUrl(previous.profile_image); // best effort, not awaited
    return { ...profile, exists: true };
  } catch (err) {
    await destroyByUrl(result.secure_url);   // don't leave an orphan if the DB write failed
    throw err;
  }
}

module.exports = {
  PROFILE_TYPES,
  createProfile,
  getMyProfile,
  getProfile,
  listProfiles,
  updateMyProfile,
  reviewProfile,
  deleteProfile,
  saveMyProfile,
  setAvatar
};
