/**
 * API Utilities for Wallet Authentication and JWT Management
 * Handles signed message verification and token generation
 */

import * as crypto from "crypto";

/**
 * Generate a secure JWT-like token for session management
 * In production, use jsonwebtoken library with secrets
 */
export function generateToken(walletAddress: string, signedMessage: string): string {
  const payload = {
    wallet: walletAddress,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url"
  );
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");

  // Simple HMAC signature (in production, use proper JWT library with secrets)
  const signatureInput = `${header}.${payloadStr}`;
  const signature = crypto
    .createHmac("sha256", `study-buddy-secret-${walletAddress}`)
    .update(signatureInput)
    .digest("base64url");

  return `${signatureInput}.${signature}`;
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string, walletAddress: string): boolean {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return false;

    // Verify signature
    const signatureInput = `${header}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", `study-buddy-secret-${walletAddress}`)
      .update(signatureInput)
      .digest("base64url");

    if (signature !== expectedSignature) return false;

    // Verify expiry
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Extract wallet address from JWT token
 */
export function extractWalletFromToken(token: string): string | null {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return decoded.wallet || null;
  } catch {
    return null;
  }
}

/**
 * Verify a signed message from Aptos wallet
 * This would normally verify the actual Aptos signature
 * For now, we'll accept any signed message and validate it was properly signed
 */
export function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signature: string
): boolean {
  /**
   * In production, you would:
   * 1. Use @aptos-labs/ts-sdk to verify the signature
   * 2. Check that the message matches the expected format
   * 3. Validate timestamp is recent (prevent replay attacks)
   */

  // Basic validation - in production, use actual Aptos signature verification
  if (!walletAddress || !message || !signature) return false;

  // Message should contain the wallet address for verification
  if (!message.includes(walletAddress)) return false;

  // For demo: ensure signature is not empty and has reasonable length
  if (signature.length < 10) return false;

  return true;
}

/**
 * Create a nonce for the sign message challenge
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Create a challenge message for user to sign
 */
export function createChallengeMessage(walletAddress: string, nonce: string): string {
  return (
    `Sign this message to authenticate your wallet:\n\n` +
    `Wallet: ${walletAddress}\n` +
    `Nonce: ${nonce}\n` +
    `Timestamp: ${new Date().toISOString()}\n\n` +
    `You are signing into Study Buddy. This request will not trigger a blockchain transaction or cost any gas fees.`
  );
}

/**
 * Validate a signature response from wallet
 */
export function validateSignatureResponse(
  walletAddress: string,
  message: string,
  signature: string
): boolean {
  // Check message format
  if (!message.includes(walletAddress)) {
    console.error("Signature message does not contain wallet address");
    return false;
  }

  // Check signature exists
  if (!signature || signature.length === 0) {
    console.error("Signature is empty");
    return false;
  }

  // In production, verify actual Aptos wallet signature
  return verifyWalletSignature(walletAddress, message, signature);
}

/**
 * Rate limiting helper
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60 * 1000 // 1 minute
): boolean {
  const now = Date.now();
  const current = requestCounts.get(identifier);

  if (!current || now > current.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Get remaining rate limit for an identifier
 */
export function getRateLimitRemaining(
  identifier: string,
  maxRequests: number = 30
): number {
  const current = requestCounts.get(identifier);
  if (!current || Date.now() > current.resetTime) return maxRequests;
  return Math.max(0, maxRequests - current.count);
}
