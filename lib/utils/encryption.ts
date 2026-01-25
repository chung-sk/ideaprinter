/**
 * Web Crypto API encryption utilities for securing API keys in localStorage
 * Uses AES-GCM encryption with a derived key from user session
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16;

/**
 * Generate a cryptographic key from a password/passphrase
 * Uses PBKDF2 for key derivation
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM key from password
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a master encryption key for the current session
 * Uses a combination of timestamp and random bytes
 */
function generateSessionPassword(): string {
  // In production, this could be tied to user authentication
  // For now, use a combination of stored/generated session ID
  const sessionId = sessionStorage.getItem('ideaPrinter_sessionId');

  if (sessionId) {
    return sessionId;
  }

  // Generate new session ID
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const newSessionId = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  sessionStorage.setItem('ideaPrinter_sessionId', newSessionId);
  return newSessionId;
}

/**
 * Encrypt a string using AES-GCM
 * Returns base64-encoded string containing: salt + iv + ciphertext
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);

    // Generate salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive encryption key
    const password = generateSessionPassword();
    const key = await deriveKey(password, salt);

    // Encrypt data
    const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, data);

    // Combine salt + iv + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt a string using AES-GCM
 * Takes base64-encoded string containing: salt + iv + ciphertext
 */
export async function decryptApiKey(encryptedData: string): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    // Extract salt, iv, and ciphertext
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

    // Derive decryption key
    const password = generateSessionPassword();
    const key = await deriveKey(password, salt);

    // Decrypt data
    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    'crypto' in window &&
    'subtle' in window.crypto &&
    'encrypt' in window.crypto.subtle &&
    'decrypt' in window.crypto.subtle
  );
}

/**
 * Validate Gemini API key format
 * Gemini keys start with "AIza" and are 39 characters long
 */
export function validateGeminiApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.startsWith('AIza') && apiKey.length === 39;
}

/**
 * Securely clear session encryption key
 * Call this on logout or session end
 */
export function clearSessionKey(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('ideaPrinter_sessionId');
  }
}
