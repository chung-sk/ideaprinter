/**
 * Generates a unique 8-character alphanumeric ID (uppercase)
 * Format: NI4QMZ2B
 */
export function generateUniqueId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}

/**
 * Checks if a unique ID already exists in the database
 * Returns a new ID if collision detected
 */
export async function generateUniqueIdWithCollisionCheck(
  checkExists: (id: string) => Promise<boolean>
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const id = generateUniqueId();
    const exists = await checkExists(id);
    
    if (!exists) {
      return id;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique ID after max attempts');
}
