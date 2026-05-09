/**
 * POST /api/auth/challenge
 * Get a challenge message to sign with wallet
 * 
 * Request:
 * {
 *   "walletAddress": "0x1234..."
 * }
 * 
 * Response:
 * {
 *   "challengeId": "challenge_123",
 *   "message": "Sign this message...",
 *   "expiresAt": "2025-01-01T00:00:00Z"
 * }
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db/storage";
import { successResponse, errorResponse, validateRequestBody } from "@/lib/api/middleware";

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequestBody(request, (body) => {
      return typeof body.walletAddress === "string" && body.walletAddress.length > 0;
    });

    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid request", "INVALID_REQUEST", 400);
    }

    const { walletAddress } = validation.data;

    // Validate wallet address format (Aptos addresses are 0x prefix + hex)
    if (!walletAddress.match(/^0x[0-9a-fA-F]+$/)) {
      return errorResponse("Invalid wallet address format", "INVALID_WALLET", 400);
    }

    // Create challenge
    const challenge = await db.createChallenge(walletAddress);

    return successResponse({
      challengeId: challenge.id,
      message: challenge.challenge,
      expiresAt: challenge.expiresAt,
    });
  } catch (error) {
    console.error("Challenge creation error:", error);
    return errorResponse("Failed to create challenge", "SERVER_ERROR", 500);
  }
}
