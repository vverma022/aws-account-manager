import type { AWSAccount, EncryptedField } from '@/types/account';

const CRYPTO_KEY_STORAGE = 'aws_crypto_key';

/**
 * Get or create the encryption key for this device.
 * The key is generated once and stored in chrome.storage.local (device-bound, not synced).
 */
async function getOrCreateKey(): Promise<CryptoKey> {
  try {
    const result = await chrome.storage.local.get(CRYPTO_KEY_STORAGE);
    const storedKey = result[CRYPTO_KEY_STORAGE];

    if (storedKey) {
      return await crypto.subtle.importKey(
        'jwk',
        storedKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    }

    // Generate a new key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Export and store as JWK
    const jwk = await crypto.subtle.exportKey('jwk', key);
    await chrome.storage.local.set({ [CRYPTO_KEY_STORAGE]: jwk });

    return key;
  } catch (error) {
    console.error('Error managing crypto key:', error);
    throw new Error('Failed to initialize encryption key');
  }
}

/**
 * Encrypt a plaintext password using AES-GCM.
 * Returns base64-encoded ciphertext and IV.
 */
export async function encryptPassword(plaintext: string): Promise<EncryptedField> {
  try {
    const key = await getOrCreateKey();
    
    // Generate a random IV (12 bytes is standard for AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encode the plaintext
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Encrypt
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Convert to base64 for storage
    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv.buffer),
    };
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw new Error('Failed to encrypt password');
  }
}

/**
 * Decrypt an encrypted password field back to plaintext.
 */
export async function decryptPassword(encrypted: EncryptedField): Promise<string> {
  try {
    const key = await getOrCreateKey();
    
    // Decode from base64
    const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);
    const iv = base64ToArrayBuffer(encrypted.iv);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    // Decode the plaintext
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Error decrypting password:', error);
    throw new Error('Failed to decrypt password');
  }
}

/**
 * Migrate an account with a plain-text password to encrypted format.
 * Modifies the account object in place.
 */
export async function migrateAccount(account: AWSAccount): Promise<void> {
  if (!account.password) {
    return;
  }
  
  // Check if already encrypted (has ciphertext property)
  if (typeof account.password === 'object' && 'ciphertext' in account.password) {
    return;
  }
  
  // Encrypt the plain-text password
  if (typeof account.password === 'string') {
    account.password = await encryptPassword(account.password);
  }
}

/**
 * Helper: Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper: Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
