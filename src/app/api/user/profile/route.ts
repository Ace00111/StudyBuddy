/**
 * GET /api/user/profile
 * Get current user profile
 * 
 * Response:
 * {
 *   "profile": { user profile data }
 * }
 * 
 * PUT /api/user/profile
 * Update current user profile
 * 
 * Request:
 * {
 *   "username": "new_username",
 *   "avatar": "avatar_url",
 *   "bio": "user bio"
 * }
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db/storage";
import {
  successResponse,
  errorResponse,
  validateRequestBody,
  withAuth,
} from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  return withAuth(request, async (walletAddress) => {
    try {
      const profile = await db.getUser(walletAddress);

      if (!profile) {
        return errorResponse("Profile not found", "NOT_FOUND", 404);
      }

      await db.logAccess({
        walletAddress,
        resourceType: "profile",
        resourceId: profile.id,
        action: "view",
        success: true,
      });

      return successResponse({
        profile: {
          id: profile.id,
          walletAddress: profile.walletAddress,
          username: profile.username,
          avatar: profile.avatar,
          bio: profile.bio,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return errorResponse("Failed to get profile", "SERVER_ERROR", 500);
    }
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (walletAddress) => {
    try {
      // Validate request body
      const validation = await validateRequestBody(request, (body) => {
        return (
          typeof body === "object" &&
          (body.username === undefined || typeof body.username === "string") &&
          (body.avatar === undefined || typeof body.avatar === "string") &&
          (body.bio === undefined || typeof body.bio === "string")
        );
      });

      if (!validation.valid) {
        return errorResponse(validation.error || "Invalid request", "INVALID_REQUEST", 400);
      }

      const { username, avatar, bio } = validation.data;

      // Update profile
      const updated = await db.updateUser(walletAddress, {
        ...(username && { username }),
        ...(avatar && { avatar }),
        ...(bio !== undefined && { bio }),
      });

      if (!updated) {
        return errorResponse("Profile not found", "NOT_FOUND", 404);
      }

      await db.logAccess({
        walletAddress,
        resourceType: "profile",
        resourceId: updated.id,
        action: "edit",
        success: true,
      });

      return successResponse({
        profile: {
          id: updated.id,
          walletAddress: updated.walletAddress,
          username: updated.username,
          avatar: updated.avatar,
          bio: updated.bio,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return errorResponse("Failed to update profile", "SERVER_ERROR", 500);
    }
  });
}
