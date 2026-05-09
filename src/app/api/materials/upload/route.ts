/**
 * POST /api/materials/upload
 * Upload a file to Shelby Protocol with ownership verification
 * 
 * Request: FormData
 * - file: File object
 * - category: "lectures" | "notes" | "assignments" | "links" | "general"
 * - tags: JSON array of strings (optional)
 * - folder: string (optional)
 * 
 * Response:
 * {
 *   "material": { material object with shelby details }
 * }
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db/storage";
import { uploadToShelby } from "@/lib/shelby";
import {
  successResponse,
  errorResponse,
  withAuth,
} from "@/lib/api/middleware";

export async function POST(request: NextRequest) {
  return withAuth(request, async (walletAddress) => {
    try {
      // Parse FormData
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const category = formData.get("category") as string;
      const tagsStr = formData.get("tags") as string;
      const folder = formData.get("folder") as string;

      // Validate inputs
      if (!file) {
        return errorResponse("No file provided", "NO_FILE", 400);
      }

      if (!category) {
        return errorResponse("Category is required", "NO_CATEGORY", 400);
      }

      const validCategories = ["lectures", "notes", "assignments", "links", "general"];
      if (!validCategories.includes(category)) {
        return errorResponse("Invalid category", "INVALID_CATEGORY", 400);
      }

      let tags: string[] = [];
      if (tagsStr) {
        try {
          tags = JSON.parse(tagsStr);
          if (!Array.isArray(tags)) tags = [];
        } catch {
          // Ignore invalid tags JSON
        }
      }

      // Upload to Shelby Protocol
      const shelbyResult = await uploadToShelby(file, walletAddress);

      // Create material record in database
      const material = await db.createMaterial(walletAddress, {
        fileName: file.name,
        fileType: file.type,
        category: category as any,
        shelbyId: shelbyResult.fileId,
        contentHash: shelbyResult.contentHash,
        txHash: shelbyResult.txHash,
        fileSize: file.size,
        tags,
        folder: folder || undefined,
      });

      await db.logAccess({
        walletAddress,
        resourceType: "material",
        resourceId: material.id,
        action: "upload",
        success: true,
      });

      return successResponse(
        {
          material: {
            id: material.id,
            fileName: material.fileName,
            fileType: material.fileType,
            category: material.category,
            shelbyId: material.shelbyId,
            contentHash: material.contentHash,
            txHash: material.txHash,
            fileSize: material.fileSize,
            tags: material.tags,
            folder: material.folder,
            uploadedAt: material.uploadedAt,
          },
        },
        201
      );
    } catch (error) {
      console.error("Upload error:", error);
      return errorResponse("Failed to upload file", "UPLOAD_ERROR", 500);
    }
  });
}
