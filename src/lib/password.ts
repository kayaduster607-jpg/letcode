import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  try {
    const testHash = scryptSync(password, salt, 64).toString('hex');
    const storedBuffer = Buffer.from(hash, 'hex');
    const testBuffer = Buffer.from(testHash, 'hex');
    if (storedBuffer.length !== testBuffer.length) return false;
    return timingSafeEqual(storedBuffer, testBuffer);
  } catch {
    return false;
  }
}
