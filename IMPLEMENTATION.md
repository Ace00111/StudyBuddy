# Implementation Guide - Secure Wallet Ownership System

## Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install @aptos-labs/ts-sdk @aptos-labs/wallet-adapter-react
```

### 2. Updated Components

#### ConnectWallet Component
The component now has 3 states:

**State 1: Disconnected** (No wallet)
```
[Connect Aptos Wallet Button]
```

**State 2: Connected but Not Authenticated** (Wallet connected, needs to sign)
```
[Connected Wallet] → Click to open menu
  ├─ View Activity
  └─ [Authenticate Wallet] (triggers sign message flow)
  └─ Disconnect Wallet
```

**State 3: Authenticated** (Full access to secure features)
```
[Username] → Click to open menu
  ├─ View Activity  
  ├─ [Secure Session]
  └─ Disconnect & Logout
```

### 3. Using the Authentication Hook

```typescript
"use client";

import { useWalletAuth, fetchWithAuth } from "@/lib/hooks/useWalletAuth";

export function YourComponent() {
  const { user, login, logout, isAuthenticated, isLoading, error } = useWalletAuth();

  if (!isAuthenticated) {
    return (
      <button onClick={login} disabled={isLoading}>
        {isLoading ? "Signing..." : "Authenticate Wallet"}
      </button>
    );
  }

  // User is authenticated
  return (
    <div>
      <p>Welcome, {user.profile.username}</p>
      <p>Wallet: {user.walletAddress}</p>
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4. Uploading Files

```typescript
"use client";

import { useState } from "react";
import { useWalletAuth, fetchWithAuth } from "@/lib/hooks/useWalletAuth";

export function UploadMaterial() {
  const { user, isAuthenticated } = useWalletAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File, category: string) => {
    if (!isAuthenticated || !user) {
      setError("Please authenticate first");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("tags", JSON.stringify(["math", "algebra"]));

      const response = await fetch("/api/materials/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Upload successful:", data.data.material);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input 
        type="file" 
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUpload(e.target.files[0], "lectures");
          }
        }}
        disabled={!isAuthenticated || isUploading}
      />
    </div>
  );
}
```

### 5. Downloading Files

```typescript
"use client";

import { useWalletAuth } from "@/lib/hooks/useWalletAuth";

export function DownloadMaterial({ materialId, fileName }: { materialId: string; fileName: string }) {
  const { user, isAuthenticated } = useWalletAuth();

  const handleDownload = async () => {
    if (!isAuthenticated || !user) {
      alert("Please authenticate first");
      return;
    }

    try {
      const response = await fetch(`/api/materials/${materialId}/download`, {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed");
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={!isAuthenticated}
    >
      Download {fileName}
    </button>
  );
}
```

### 6. Managing Notes

```typescript
"use client";

import { useState } from "react";
import { useWalletAuth, fetchWithAuth } from "@/lib/hooks/useWalletAuth";

export function NoteManager() {
  const { user, isAuthenticated } = useWalletAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Get all notes
  const loadNotes = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const data = await fetchWithAuth(
        user.token,
        "/api/notes"
      );
      setNotes(data.data.notes);
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  // Create new note
  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;

    try {
      const data = await fetchWithAuth(
        user.token,
        "/api/notes",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            content,
            tags: ["math"],
            color: "blue"
          })
        }
      );

      setNotes([...notes, data.data.note]);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  // Update note
  const updateNote = async (noteId: string, updates: any) => {
    if (!isAuthenticated || !user) return;

    try {
      const data = await fetchWithAuth(
        user.token,
        `/api/notes/${noteId}`,
        {
          method: "PUT",
          body: JSON.stringify(updates)
        }
      );

      setNotes(notes.map(n => n.id === noteId ? data.data.note : n));
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      await fetchWithAuth(
        user.token,
        `/api/notes/${noteId}`,
        { method: "DELETE" }
      );

      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return (
    <div>
      <form onSubmit={createNote}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={!isAuthenticated}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={!isAuthenticated}
        />
        <button type="submit" disabled={!isAuthenticated}>
          Create Note
        </button>
      </form>

      <button onClick={loadNotes} disabled={!isAuthenticated}>
        Load Notes
      </button>

      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => updateNote(note.id, { title: "Updated" })}>
              Update
            </button>
            <button onClick={() => deleteNote(note.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 7. Managing User Profile

```typescript
"use client";

import { useState, useEffect } from "react";
import { useWalletAuth, fetchWithAuth } from "@/lib/hooks/useWalletAuth";

export function ProfileManager() {
  const { user, isAuthenticated } = useWalletAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load current profile
  useEffect(() => {
    if (isAuthenticated && user) {
      setUsername(user.profile.username);
      setBio(user.profile.bio || "");
    }
  }, [isAuthenticated, user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;

    setIsSaving(true);
    try {
      const data = await fetchWithAuth(
        user.token,
        "/api/user/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            username,
            bio,
            avatar: user.profile.avatar
          })
        }
      );

      console.log("Profile updated:", data.data.profile);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <p>Please authenticate first</p>;
  }

  return (
    <form onSubmit={saveProfile}>
      <div>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
        />
      </div>

      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
```

## API Response Examples

### Successful Upload
```json
{
  "success": true,
  "data": {
    "material": {
      "id": "mat_1704067200000_0.123",
      "fileName": "lecture.pdf",
      "fileType": "application/pdf",
      "category": "lectures",
      "shelbyId": "shelby_a1b2c3d4e5",
      "contentHash": "sha256hash...",
      "txHash": "0x...",
      "fileSize": 1024000,
      "tags": ["math"],
      "uploadedAt": "2024-01-01T12:00:00Z"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Forbidden: You do not have permission to access this resource",
  "code": "FORBIDDEN",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Wallet Connection Errors - Solutions

### "Failed to load resource: net::ERR_CONNECTION_CLOSED"
- **Cause**: Shelby Protocol API temporary disconnect
- **Solution**: Check internet, system falls back to mock responses
- **User Impact**: File upload/download still works in development

### "Transaction failed: User has rejected the request"
- **Cause**: User clicked "Reject" in wallet signature dialog
- **Solution**: Normal wallet behavior, not an error
- **User Impact**: User must approve the signature to continue
- **Note**: No blockchain transaction or gas fees involved

### "Invalid signature"
- **Cause**: Signature doesn't match challenge or challenge expired
- **Solution**: Get new challenge and re-sign (challenge expires in 10 minutes)
- **User Impact**: Authentication needs to be retried

## Key Points to Remember

1. **Token is JWT-based** - Contains wallet address and expiry
2. **Every request is verified** - Ownership checked server-side
3. **No public file URLs** - All downloads go through protected API
4. **Immutable fields** - walletAddress, createdAt cannot be changed
5. **Rate limiting** - 100 requests per minute per IP
6. **Session management** - Automatic logout on token expiry
7. **Error logging** - All access attempts logged for audit trail
8. **Shelby Protocol** - All files stored in decentralized storage

## Next Steps

1. Replace in-memory database with MongoDB/PostgreSQL
2. Implement proper JWT library with secret management
3. Add email verification for account recovery
4. Implement 2FA authentication
5. Add file encryption at rest
6. Implement proper monitoring and alerting
7. Set up automated backups
8. Deploy to production with HTTPS
