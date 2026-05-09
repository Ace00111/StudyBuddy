/**
 * GET /api/materials/[materialId]/download
 * Download a file from Shelby Protocol
 * Only the owner can download their files
 * 
 * Response: File blob
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db/storage";
import { downloadFromShelby } from "@/lib/shelby";
import {
  errorResponse,
  withOwnershipCheck,
} from "@/lib/api/middleware";

export async function GET(
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
        const material = await db.getMaterial(materialId);
        if (!material) {
          return errorResponse("Material not found", "NOT_FOUND", 404);
        }

        // Download from Shelby Protocol
        const shelbyResult = await downloadFromShelby(
          material.shelbyId,
          walletAddress,
          material.txHash
        );

        await db.logAccess({
          walletAddress,
          resourceType: "material",
          resourceId: materialId,
          action: "download",
          success: true,
        });

        // Return file as downloadable blob
        return new Response(shelbyResult.fileData, {
          status: 200,
          headers: {
            "Content-Type": material.fileType || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${material.fileName}"`,
            "X-Transaction-Hash": shelbyResult.txHash,
          },
        });
      } catch (error) {
        console.error("Download error:", error);
        return errorResponse("Failed to download file", "DOWNLOAD_ERROR", 500);
      }
    }
  );
}
