/**
 * API Middleware and Response Helpers
 * Handles request/response formatting, error handling, and ownership verification
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "../db/storage";
import { extractWalletFromToken, verifyToken, checkRateLimit } from "./auth";

/**
 * Standard API Response Format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

/**
 * Success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>,
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(
  error: string,
  code: string = "ERROR",
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Extract and validate token from request headers
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/**
 * Verify wallet ownership from request
 * Returns wallet address if authenticated, null otherwise
 */
export async function verifyWalletOwnership(
  request: NextRequest
): Promise<string | null> {
  const token = getTokenFromRequest(request);
  if (!token) {
    console.error("No token provided");
    return null;
  }

  const walletAddress = extractWalletFromToken(token);
  if (!walletAddress) {
    console.error("Invalid token format");
    return null;
  }

  // Verify token is still valid
  if (!verifyToken(token, walletAddress)) {
    console.error("Token verification failed");
    return null;
  }

  // Update session activity
  try {
    await db.updateSessionActivity(token);
  } catch (error) {
    console.error("Failed to update session activity:", error);
  }

  return walletAddress;
}

/**
 * Verify ownership of a specific material
 */
export async function verifyMaterialOwnership(
  materialId: string,
  walletAddress: string
): Promise<boolean> {
  const material = await db.getMaterial(materialId);
  if (!material) return false;
  return material.ownerWallet === walletAddress;
}

/**
 * Verify ownership of a specific note
 */
export async function verifyNoteOwnership(
  noteId: string,
  walletAddress: string
): Promise<boolean> {
  const note = await db.getNote(noteId);
  if (!note) return false;
  return note.ownerWallet === walletAddress;
}

/**
 * Protected endpoint wrapper
 * Ensures user is authenticated before processing request
 */
export async function withAuth<T>(
  request: NextRequest,
  handler: (walletAddress: string) => Promise<NextResponse<ApiResponse<T>> | Response>
): Promise<NextResponse | Response> {
  try {
    // Check rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIP, 100, 60 * 1000)) {
      await db.logAccess({
        walletAddress: "unknown",
        resourceType: "profile",
        resourceId: "rate-limit",
        action: "view",
        success: false,
        reason: "Rate limit exceeded",
        ipAddress: clientIP,
      });
      return errorResponse(
        "Rate limit exceeded",
        "RATE_LIMIT",
        429
      );
    }

    // Verify wallet ownership
    const walletAddress = await verifyWalletOwnership(request);
    if (!walletAddress) {
      return errorResponse(
        "Unauthorized: Invalid or missing authentication token",
        "UNAUTHORIZED",
        401
      );
    }

    // Call handler with verified wallet
    return await handler(walletAddress);
  } catch (error) {
    console.error("Authentication error:", error);
    return errorResponse(
      "Internal server error",
      "SERVER_ERROR",
      500
    );
  }
}

/**
 * Protected resource wrapper
 * Ensures user owns the resource before allowing access
 */
export async function withOwnershipCheck<T>(
  request: NextRequest,
  resourceType: "material" | "note",
  resourceId: string,
  handler: (walletAddress: string) => Promise<NextResponse<ApiResponse<T>> | Response>
): Promise<NextResponse | Response> {
  return withAuth(request, async (walletAddress) => {
    try {
      // Verify ownership
      const isOwner =
        resourceType === "material"
          ? await verifyMaterialOwnership(resourceId, walletAddress)
          : await verifyNoteOwnership(resourceId, walletAddress);

      if (!isOwner) {
        await db.logAccess({
          walletAddress,
          resourceType,
          resourceId,
          action: "view",
          success: false,
          reason: "Ownership verification failed",
        });

        return errorResponse(
          "Forbidden: You do not have permission to access this resource",
          "FORBIDDEN",
          403
        );
      }

      return await handler(walletAddress);
    } catch (error) {
      console.error("Ownership check error:", error);
      return errorResponse(
        "Internal server error",
        "SERVER_ERROR",
        500
      );
    }
  });
}

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: (body: any) => boolean
): Promise<{ valid: boolean; data?: any; error?: string }> {
  try {
    const body = await request.json();

    if (!schema(body)) {
      return {
        valid: false,
        error: "Invalid request body",
      };
    }

    return { valid: true, data: body };
  } catch (error) {
    return {
      valid: false,
      error: "Failed to parse request body",
    };
  }
}
