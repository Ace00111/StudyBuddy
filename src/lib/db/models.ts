/**
 * Database Models for Study Buddy
 * All data is stored with strict wallet-based ownership
 */

/**
 * User Profile - tied to wallet address (immutable)
 * One profile per wallet address
 */
export interface UserProfile {
  id: string;
  walletAddress: string; // immutable, unique identifier
  username: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Material/File - documents, lectures, assignments, links
 * Each file belongs exclusively to ONE wallet address
 */
export interface Material {
  id: string;
  ownerWallet: string; // immutable, must match connected wallet for access
  fileName: string;
  fileType: string;
  category: "lectures" | "notes" | "assignments" | "links" | "general";
  shelbyId: string; // Shelby Protocol file ID
  contentHash: string; // SHA-256 hash of file content
  txHash: string; // blockchain transaction hash
  fileSize: number; // in bytes
  tags?: string[];
  folder?: string;
  uploadedAt: Date;
  updatedAt: Date;
}

/**
 * Note - text-based notes
 * Each note belongs exclusively to ONE wallet address
 */
export interface Note {
  id: string;
  ownerWallet: string; // immutable
  title: string;
  content: string;
  color?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session Token - JWT or secure session identifier
 * Tied to wallet address and signed message
 */
export interface SessionToken {
  id: string;
  walletAddress: string;
  token: string; // JWT token
  signedMessage: string; // wallet signature
  tokenExpiry: Date;
  createdAt: Date;
  lastActivity: Date;
}

/**
 * Authentication Challenge - for signing flow
 * User receives a challenge message to sign with their wallet
 */
export interface AuthChallenge {
  id: string;
  walletAddress: string;
  challenge: string; // random message to sign
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

/**
 * Access Log - for audit trail
 * Track all access attempts for security
 */
export interface AccessLog {
  id: string;
  walletAddress: string;
  resourceType: "material" | "note" | "profile";
  resourceId: string;
  action: "view" | "download" | "edit" | "delete" | "upload";
  success: boolean;
  reason?: string; // if access denied
  ipAddress?: string;
  timestamp: Date;
}

/**
 * Type for API responses with ownership checks
 */
export interface OwnedResource<T> {
  resource: T;
  ownerWallet: string;
  accessGranted: boolean;
}
