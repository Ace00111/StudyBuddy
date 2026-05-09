/**
 * GET /api/notes
 * List all notes for the authenticated user
 * Only returns notes owned by the wallet
 * 
 * POST /api/notes
 * Create a new note
 * 
 * Request:
 * {
 *   "title": "note title",
 *   "content": "note content",
 *   "color": "blue" (optional),
 *   "tags": ["tag1", "tag2"] (optional)
 * }
 * 
 * Response (GET):
 * {
 *   "notes": [{ note objects }]
 * }
 * 
 * Response (POST):
 * {
 *   "note": { note object }
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
      const notes = await db.getUserNotes(walletAddress);

      await db.logAccess({
        walletAddress,
        resourceType: "note",
        resourceId: "list",
        action: "view",
        success: true,
      });

      return successResponse({
        notes: notes.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          color: n.color,
          tags: n.tags,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        })),
      });
    } catch (error) {
      console.error("Get notes error:", error);
      return errorResponse("Failed to get notes", "SERVER_ERROR", 500);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (walletAddress) => {
    try {
      // Validate request body
      const validation = await validateRequestBody(request, (body) => {
        return (
          typeof body.title === "string" &&
          typeof body.content === "string" &&
          body.title.length > 0 &&
          body.content.length > 0
        );
      });

      if (!validation.valid) {
        return errorResponse(validation.error || "Invalid request", "INVALID_REQUEST", 400);
      }

      const { title, content, color, tags } = validation.data;

      // Create note
      const note = await db.createNote(walletAddress, {
        title,
        content,
        color: color || undefined,
        tags: Array.isArray(tags) ? tags : undefined,
      });

      await db.logAccess({
        walletAddress,
        resourceType: "note",
        resourceId: note.id,
        action: "edit",
        success: true,
      });

      return successResponse(
        {
          note: {
            id: note.id,
            title: note.title,
            content: note.content,
            color: note.color,
            tags: note.tags,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          },
        },
        201
      );
    } catch (error) {
      console.error("Create note error:", error);
      return errorResponse("Failed to create note", "SERVER_ERROR", 500);
    }
  });
}
