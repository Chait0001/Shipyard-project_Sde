const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

const getKey = () => {
  const secret = process.env.GITHUB_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY or JWT_SECRET must be configured');
  }

  return crypto.createHash('sha256').update(secret).digest();
};

const encryptToken = (token) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map((part) => part.toString('base64')).join(':');
};

const decryptToken = (payload) => {
  const [ivValue, authTagValue, encryptedValue] = payload.split(':');

  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error('Invalid encrypted GitHub token payload');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivValue, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64')),
    decipher.final(),
  ]).toString('utf8');
};

module.exports = {
  encryptToken,
  decryptToken,
};
