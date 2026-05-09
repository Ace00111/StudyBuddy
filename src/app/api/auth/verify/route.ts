/**
 * POST /api/auth/verify
 * Verify signed message and create authenticated session
 * 
 * Request:
 * {
 *   "challengeId": "challenge_123",
 *   "walletAddress": "0x1234...",
 *   "signature": "signed_message_hex",
 *   "username": "john_doe" (optional, for profile creation)
 * }
 * 
 * Response:
 * {
 *   "token": "jwt_token",
 *   "walletAddress": "0x1234...",
 *   "profile": { user profile data }
 * }
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db/storage";
import {
  successResponse,
  errorResponse,
  validateRequestBody,
} from "@/lib/api/middleware";
import { generateToken, validateSignatureResponse } from "@/lib/api/auth";

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequestBody(request, (body) => {
      return (
        typeof body.challengeId === "string" &&
        typeof body.walletAddress === "string" &&
        typeof body.signature === "string"
      );
    });

    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid request", "INVALID_REQUEST", 400);
    }

    const { challengeId, walletAddress, signature, username } = validation.data;

    // Get and validate challenge
    const challenge = await db.getChallenge(challengeId);
    if (!challenge) {
      return errorResponse("Challenge not found or expired", "INVALID_CHALLENGE", 400);
    }

    if (challenge.walletAddress !== walletAddress) {
      return errorResponse(
        "Challenge wallet mismatch",
        "WALLET_MISMATCH",
        400
      );
    }

    if (challenge.used) {
      return errorResponse("Challenge already used", "CHALLENGE_USED", 400);
    }

    if (new Date() > challenge.expiresAt) {
      return errorResponse("Challenge expired", "CHALLENGE_EXPIRED", 400);
    }

    // Verify signature
    if (!validateSignatureResponse(walletAddress, challenge.challenge, signature)) {
      await db.logAccess({
        walletAddress,
        resourceType: "profile",
        resourceId: challengeId,
        action: "view",
        success: false,
        reason: "Invalid signature",
      });

      return errorResponse("Invalid signature", "INVALID_SIGNATURE", 400);
    }

    // Mark challenge as used
    await db.useChallenge(challengeId);

    // Get or create user profile
    let profile = await db.getUser(walletAddress);
    if (!profile) {
      // Auto-create profile on first login
      const displayName = username || `User_${walletAddress.slice(0, 6)}`;
      profile = await db.createUser(walletAddress, displayName);
    }

    // Generate session token
    const token = generateToken(walletAddress, signature);

    // Create session in database
    await db.createSession(walletAddress, token, signature);

    // Log successful authentication
    await db.logAccess({
      walletAddress,
      resourceType: "profile",
      resourceId: profile.id,
      action: "view",
      success: true,
    });

    return successResponse(
      {
        token,
        walletAddress,
        profile: {
          id: profile.id,
          username: profile.username,
          avatar: profile.avatar,
          bio: profile.bio,
          createdAt: profile.createdAt,
        },
      },
      200
    );
  } catch (error) {
    console.error("Authentication error:", error);
    return errorResponse("Authentication failed", "SERVER_ERROR", 500);
  }
}
