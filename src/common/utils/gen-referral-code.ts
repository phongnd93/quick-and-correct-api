import { randomBytes } from 'crypto';

export const generateReferralCode = (): string => {
  return randomBytes(5).toString('hex');
};
