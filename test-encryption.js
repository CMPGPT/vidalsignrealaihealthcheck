require('dotenv').config();

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

// Use the keys you provided
const ENCRYPTION_KEY1 = '1f4d3e8a7c9b2a4d5f6e7c9a1b3d5f7a';
const IV_KEY1 = '9f8d7b6a5c4e3d2f';
const ENCRYPTION_KEY2 = 'abcdef0123456789fedcba9876543210';
const IV_KEY2 = '0123456789abcdef';

console.log('🔍 Testing encryption keys...');
console.log('ENCRYPTION_KEY1 length:', ENCRYPTION_KEY1.length);
console.log('IV_KEY1 length:', IV_KEY1.length);
console.log('ENCRYPTION_KEY2 length:', ENCRYPTION_KEY2.length);
console.log('IV_KEY2 length:', IV_KEY2.length);

function encryptOnce(text, key, iv) {
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), Buffer.from(iv));
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptOnce(encrypted, key, iv) {
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function doubleEncrypt(text) {
  const first = encryptOnce(text, ENCRYPTION_KEY1, IV_KEY1);
  const second = encryptOnce(first, ENCRYPTION_KEY2, IV_KEY2);
  return second;
}

function doubleDecrypt(encrypted) {
  const first = decryptOnce(encrypted, ENCRYPTION_KEY2, IV_KEY2);
  const second = decryptOnce(first, ENCRYPTION_KEY1, IV_KEY1);
  return second;
}

// Test the encryption
const testEmail = 'test@example.com';
console.log('📧 Original email:', testEmail);

try {
  const encrypted = doubleEncrypt(testEmail);
  console.log('🔒 Encrypted:', encrypted);
  
  const decrypted = doubleDecrypt(encrypted);
  console.log('🔓 Decrypted:', decrypted);
  
  if (decrypted === testEmail) {
    console.log('✅ Encryption/Decryption working correctly!');
  } else {
    console.log('❌ Encryption/Decryption failed!');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
} 