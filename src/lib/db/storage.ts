/**
 * In-Memory Database Layer for Development
 * In production, replace with MongoDB, PostgreSQL, or Supabase
 */

import {
  UserProfile,
  Material,
  Note,
  SessionToken,
  AuthChallenge,
  AccessLog,
} from "./models";

// In-memory storage
const users = new Map<string, UserProfile>();
const materials = new Map<string, Material>();
const notes = new Map<string, Note>();
const sessions = new Map<string, SessionToken>();
const challenges = new Map<string, AuthChallenge>();
const accessLogs: AccessLog[] = [];

// User operations
export const db = {
  // USERS
  async getUser(walletAddress: string): Promise<UserProfile | null> {
    return users.get(walletAddress) || null;
  },

  async createUser(
    walletAddress: string,
    username: string
  ): Promise<UserProfile> {
    const user: UserProfile = {
      id: `user_${Date.now()}_${Math.random()}`,
      walletAddress,
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`,
      bio: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(walletAddress, user);
    return user;
  },

  async updateUser(
    walletAddress: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const user = users.get(walletAddress);
    if (!user) return null;

    const updated = {
      ...user,
      ...updates,
      walletAddress: user.walletAddress, // immutable
      createdAt: user.createdAt, // immutable
      updatedAt: new Date(),
    };
    users.set(walletAddress, updated);
    return updated;
  },

  // MATERIALS
  async getMaterial(materialId: string): Promise<Material | null> {
    return materials.get(materialId) || null;
  },

  async getUserMaterials(walletAddress: string): Promise<Material[]> {
    return Array.from(materials.values()).filter(
      (m) => m.ownerWallet === walletAddress
    );
  },

  async createMaterial(
    walletAddress: string,
    data: Omit<Material, "id" | "ownerWallet" | "uploadedAt" | "updatedAt">
  ): Promise<Material> {
    const material: Material = {
      id: `mat_${Date.now()}_${Math.random()}`,
      ownerWallet: walletAddress,
      ...data,
      uploadedAt: new Date(),
      updatedAt: new Date(),
    };
    materials.set(material.id, material);
    return material;
  },

  async updateMaterial(
    materialId: string,
    walletAddress: string,
    updates: Partial<Material>
  ): Promise<Material | null> {
    const material = materials.get(materialId);
    if (!material || material.ownerWallet !== walletAddress) return null;

    const updated = {
      ...material,
      ...updates,
      id: material.id, // immutable
      ownerWallet: material.ownerWallet, // immutable
      uploadedAt: material.uploadedAt, // immutable
      updatedAt: new Date(),
    };
    materials.set(materialId, updated);
    return updated;
  },

  async deleteMaterial(
    materialId: string,
    walletAddress: string
  ): Promise<boolean> {
    const material = materials.get(materialId);
    if (!material || material.ownerWallet !== walletAddress) return false;
    materials.delete(materialId);
    return true;
  },

  // NOTES
  async getNote(noteId: string): Promise<Note | null> {
    return notes.get(noteId) || null;
  },

  async getUserNotes(walletAddress: string): Promise<Note[]> {
    return Array.from(notes.values()).filter(
      (n) => n.ownerWallet === walletAddress
    );
  },

  async createNote(
    walletAddress: string,
    data: Omit<Note, "id" | "ownerWallet" | "createdAt" | "updatedAt">
  ): Promise<Note> {
    const note: Note = {
      id: `note_${Date.now()}_${Math.random()}`,
      ownerWallet: walletAddress,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    notes.set(note.id, note);
    return note;
  },

  async updateNote(
    noteId: string,
    walletAddress: string,
    updates: Partial<Note>
  ): Promise<Note | null> {
    const note = notes.get(noteId);
    if (!note || note.ownerWallet !== walletAddress) return null;

    const updated = {
      ...note,
      ...updates,
      id: note.id, // immutable
      ownerWallet: note.ownerWallet, // immutable
      createdAt: note.createdAt, // immutable
      updatedAt: new Date(),
    };
    notes.set(noteId, updated);
    return updated;
  },

  async deleteNote(
    noteId: string,
    walletAddress: string
  ): Promise<boolean> {
    const note = notes.get(noteId);
    if (!note || note.ownerWallet !== walletAddress) return false;
    notes.delete(noteId);
    return true;
  },

  // SESSIONS
  async createSession(
    walletAddress: string,
    token: string,
    signedMessage: string
  ): Promise<SessionToken> {
    const session: SessionToken = {
      id: `sess_${Date.now()}_${Math.random()}`,
      walletAddress,
      token,
      signedMessage,
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    sessions.set(token, session);
    return session;
  },

  async getSession(token: string): Promise<SessionToken | null> {
    return sessions.get(token) || null;
  },

  async updateSessionActivity(token: string): Promise<SessionToken | null> {
    const session = sessions.get(token);
    if (!session) return null;

    const updated = { ...session, lastActivity: new Date() };
    sessions.set(token, updated);
    return updated;
  },

  async deleteSession(token: string): Promise<boolean> {
    return sessions.delete(token);
  },

  // CHALLENGES
  async createChallenge(walletAddress: string): Promise<AuthChallenge> {
    const challenge: AuthChallenge = {
      id: `challenge_${Date.now()}_${Math.random()}`,
      walletAddress,
      challenge: `Sign this message to authenticate:\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}\nNonce: ${Math.random()}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      used: false,
    };
    challenges.set(challenge.id, challenge);
    return challenge;
  },

  async getChallenge(
    challengeId: string
  ): Promise<AuthChallenge | null> {
    return challenges.get(challengeId) || null;
  },

  async useChallenge(challengeId: string): Promise<boolean> {
    const challenge = challenges.get(challengeId);
    if (!challenge) return false;

    challenge.used = true;
    challenges.set(challengeId, challenge);
    return true;
  },

  // ACCESS LOGS
  async logAccess(log: Omit<AccessLog, "id" | "timestamp">): Promise<void> {
    accessLogs.push({
      id: `log_${Date.now()}_${Math.random()}`,
      ...log,
      timestamp: new Date(),
    });
  },

  async getAccessLogs(
    walletAddress: string,
    limit: number = 100
  ): Promise<AccessLog[]> {
    return accessLogs
      .filter((log) => log.walletAddress === walletAddress)
      .slice(-limit);
  },
};
