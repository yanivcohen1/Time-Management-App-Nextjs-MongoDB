import { expect, describe, it } from '@jest/globals';
import { hashPassword, comparePassword } from './password';

describe('Password Utils', () => {
  it('should hash a password and verify it', async () => {
    const password = 'mySecretPassword';
    const hash = await hashPassword(password);
    
    expect(hash).not.toBe(password);
    
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await comparePassword('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});
