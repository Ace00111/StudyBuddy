/**
 * GET /api/notes/[noteId]
 * Get a specific note
 * 
 * PUT /api/notes/[noteId]
 * Update a note
 * 
 * DELETE /api/notes/[noteId]
 * Delete a note
 * 
 * Request (PUT):
 * {
 *   "title": "updated title" (optional),
 *   "content": "updated content" (optional),
 *   "color": "blue" (optional),
 *   "tags": ["tag1"] (optional)
 * }
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db/storage";
import {
  successResponse,
  errorResponse,
  validateRequestBody,
  withOwnershipCheck,
} from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  return withOwnershipCheck(
    request,
    "note",
    noteId,
    async (walletAddress) => {
      try {
        const note = await db.getNote(noteId);

        if (!note) {
          return errorResponse("Note not found", "NOT_FOUND", 404);
        }

        await db.logAccess({
          walletAddress,
          resourceType: "note",
          resourceId: noteId,
          action: "view",
          success: true,
        });

        return successResponse({
          note: {
            id: note.id,
            title: note.title,
            content: note.content,
            color: note.color,
            tags: note.tags,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          },
        });
      } catch (error) {
        console.error("Get note error:", error);
        return errorResponse("Failed to get note", "SERVER_ERROR", 500);
      }
    }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  return withOwnershipCheck(
    request,
    "note",
    noteId,
    async (walletAddress) => {
      try {
        // Validate request body
        const validation = await validateRequestBody(request, (body) => {
          return (
            typeof body === "object" &&
            (body.title === undefined || typeof body.title === "string") &&
            (body.content === undefined || typeof body.content === "string") &&
            (body.color === undefined || typeof body.color === "string") &&
            (body.tags === undefined || Array.isArray(body.tags))
          );
        });

        if (!validation.valid) {
          return errorResponse(
            validation.error || "Invalid request",
            "INVALID_REQUEST",
            400
          );
        }

        const { title, content, color, tags } = validation.data;

        // Update note
        const updated = await db.updateNote(noteId, walletAddress, {
          ...(title && { title }),
          ...(content && { content }),
          ...(color !== undefined && { color }),
          ...(tags !== undefined && { tags }),
        });

        if (!updated) {
          return errorResponse("Note not found", "NOT_FOUND", 404);
        }

        await db.logAccess({
          walletAddress,
          resourceType: "note",
          resourceId: noteId,
          action: "edit",
          success: true,
        });

        return successResponse({
          note: {
            id: updated.id,
            title: updated.title,
            content: updated.content,
            color: updated.color,
            tags: updated.tags,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          },
        });
      } catch (error) {
        console.error("Update note error:", error);
        return errorResponse("Failed to update note", "SERVER_ERROR", 500);
      }
    }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  return withOwnershipCheck(
    request,
    "note",
    noteId,
    async (walletAddress) => {
      try {
        const deleted = await db.deleteNote(noteId, walletAddress);

        if (!deleted) {
          return errorResponse("Note not found", "NOT_FOUND", 404);
        }

        await db.logAccess({
          walletAddress,
          resourceType: "note",
          resourceId: noteId,
          action: "delete",
          success: true,
        });

        return successResponse({ success: true });
      } catch (error) {
        console.error("Delete note error:", error);
        return errorResponse("Failed to delete note", "SERVER_ERROR", 500);
      }
    }
  );
}
