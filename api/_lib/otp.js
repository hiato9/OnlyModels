// api/_lib/otp.js — geração, hash e validação do código de 6 dígitos.

import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';

const PEPPER = process.env.OTP_PEPPER || '';
const TTL_SECONDS = 5 * 60;
const MAX_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 10;

export function generateOtpCode() {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export async function hashOtp(code) {
    return await bcrypt.hash(code + PEPPER, BCRYPT_ROUNDS);
}

export async function compareOtp(code, hash) {
    return await bcrypt.compare(code + PEPPER, hash);
}

export function otpExpiresAt() {
    return new Date(Date.now() + TTL_SECONDS * 1000).toISOString();
}

export const OTP_TTL_SECONDS = TTL_SECONDS;
export const OTP_MAX_ATTEMPTS = MAX_ATTEMPTS;
