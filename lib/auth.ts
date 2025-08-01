// Authentication utilities for secure user authentication

import { createHash, randomBytes } from "crypto"

/**
 * Generate a secure random token
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString("hex")
}

/**
 * Hash a password with a salt
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  // Generate a salt if not provided
  const passwordSalt = salt || randomBytes(16).toString("hex")

  // Create hash using SHA-256
  const hash = createHash("sha256")
    .update(password + passwordSalt)
    .digest("hex")

  return { hash, salt: passwordSalt }
}

/**
 * Verify a password against a stored hash and salt
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt)
  return hash === storedHash
}

/**
 * Generate a remember me token (selector and validator)
 */
export function generateRememberMeToken(): { selector: string; validator: string; hashedValidator: string } {
  const selector = generateToken(12)
  const validator = generateToken(24)

  // Hash the validator for storage
  const hashedValidator = createHash("sha256").update(validator).digest("hex")

  return { selector, validator, hashedValidator }
}

/**
 * Create a secure HTTP-only cookie for authentication
 */
export function createAuthCookie(token: string, expiresIn: number): string {
  const expires = new Date(Date.now() + expiresIn)
  return `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=${expires.toUTCString()}`
}

/**
 * Parse a remember me cookie value
 */
export function parseRememberMeCookie(cookieValue: string): { selector: string; validator: string } | null {
  try {
    const [selector, validator] = cookieValue.split(":")
    if (!selector || !validator) return null
    return { selector, validator }
  } catch (error) {
    return null
  }
}
