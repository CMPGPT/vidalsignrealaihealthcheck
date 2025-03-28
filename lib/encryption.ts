import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

const ENCRYPTION_KEY1 = process.env.ENCRYPTION_KEY1!;
const IV_KEY1 = process.env.IV_KEY1!;
const ENCRYPTION_KEY2 = process.env.ENCRYPTION_KEY2!;
const IV_KEY2 = process.env.IV_KEY2!;

function encryptOnce(text: string, key: string, iv: string): string {
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), Buffer.from(iv));
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptOnce(encrypted: string, key: string, iv: string): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function doubleEncrypt(text: string): string {
  const first = encryptOnce(text, ENCRYPTION_KEY1, IV_KEY1);
  const second = encryptOnce(first, ENCRYPTION_KEY2, IV_KEY2);
  return second;
}

export function doubleDecrypt(encrypted: string): string {
  const first = decryptOnce(encrypted, ENCRYPTION_KEY2, IV_KEY2);
  const second = decryptOnce(first, ENCRYPTION_KEY1, IV_KEY1);
  return second;
}
