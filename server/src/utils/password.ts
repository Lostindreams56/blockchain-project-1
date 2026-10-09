import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a candidate plaintext password with a stored bcrypt hash.
 */
export async function comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, hash);
}
