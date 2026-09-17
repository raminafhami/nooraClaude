import { NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';

const IV_LENGTH = 16; // AES block size

export function encrypt(data: string, cryptoKey: string): string {
  const key = Buffer.from(cryptoKey, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt
export function decrypt(encryptedData: string, cryptoKey: string): string {
  try {
    const key = Buffer.from(cryptoKey, 'hex');
    const [ivHex, encryptedText] = encryptedData.split(':'); // Extract IV
    if (!ivHex || !encryptedText) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new NotFoundException('Not found');
  }
}
