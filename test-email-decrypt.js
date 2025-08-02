require('dotenv').config();
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

const ENCRYPTION_KEY1 = process.env.ENCRYPTION_KEY1;
const IV_KEY1 = process.env.IV_KEY1;
const ENCRYPTION_KEY2 = process.env.ENCRYPTION_KEY2;
const IV_KEY2 = process.env.IV_KEY2;

console.log('🔍 Testing encryption keys...');
console.log('ENCRYPTION_KEY1 length:', ENCRYPTION_KEY1 ? ENCRYPTION_KEY1.length : 'undefined');
console.log('IV_KEY1 length:', IV_KEY1 ? IV_KEY1.length : 'undefined');
console.log('ENCRYPTION_KEY2 length:', ENCRYPTION_KEY2 ? ENCRYPTION_KEY2.length : 'undefined');
console.log('IV_KEY2 length:', IV_KEY2 ? IV_KEY2.length : 'undefined');

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

// Test the encryption/decryption
try {
  const testEmail = 'test@example.com';
  console.log('📧 Original email:', testEmail);
  
  const encrypted = doubleEncrypt(testEmail);
  console.log('🔒 Encrypted:', encrypted);
  
  const decrypted = doubleDecrypt(encrypted);
  console.log('🔓 Decrypted:', decrypted);
  
  console.log('✅ Test successful:', testEmail === decrypted);
} catch (error) {
  console.log('❌ Test failed:', error.message);
} 