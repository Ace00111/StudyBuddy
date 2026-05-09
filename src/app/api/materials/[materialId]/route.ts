/**
 * DELETE /api/materials/[materialId]
 * Delete a material record
 * Only the owner can delete their materials
 * 
 * Response:
 * {
 *   "success": true
 * }
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db/storage";
import {
  successResponse,
  errorResponse,
  withOwnershipCheck,
} from "@/lib/api/middleware";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const { materialId } = await params;

  return withOwnershipCheck(
    request,
    "material",
    materialId,
    async (walletAddress) => {
      try {
        const deleted = await db.deleteMaterial(materialId, walletAddress);

        if (!deleted) {
          return errorResponse("Failed to delete material", "DELETE_ERROR", 500);
        }

        await db.logAccess({
          walletAddress,
          resourceType: "material",
          resourceId: materialId,
          action: "delete",
          success: true,
        });

        return successResponse({ success: true });
      } catch (error) {
        console.error("Delete error:", error);
        return errorResponse("Failed to delete material", "SERVER_ERROR", 500);
      }
    }
  );
}
