/**
 * GET /api/materials
 * List all materials for the authenticated user
 * Only returns materials owned by the wallet
 * 
 * Response:
 * {
 *   "materials": [{ material objects }]
 * }
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db/storage";
import {
  successResponse,
  errorResponse,
  withAuth,
} from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  return withAuth(request, async (walletAddress) => {
    try {
      const materials = await db.getUserMaterials(walletAddress);

      await db.logAccess({
        walletAddress,
        resourceType: "material",
        resourceId: "list",
        action: "view",
        success: true,
      });

      return successResponse({
        materials: materials.map((m) => ({
          id: m.id,
          fileName: m.fileName,
          fileType: m.fileType,
          category: m.category,
          shelbyId: m.shelbyId,
          contentHash: m.contentHash,
          fileSize: m.fileSize,
          tags: m.tags,
          folder: m.folder,
          uploadedAt: m.uploadedAt,
          updatedAt: m.updatedAt,
        })),
      });
    } catch (error) {
      console.error("Get materials error:", error);
      return errorResponse("Failed to get materials", "SERVER_ERROR", 500);
    }
  });
}
