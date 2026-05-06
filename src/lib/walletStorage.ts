import { Material } from "./materials";

/** Build a namespaced localStorage key scoped to a wallet address (or "guest"). */
export function getStorageKey(
  scope: "materials" | "notes" | "profile" | "settings",
  walletAddress: string | null
): string {
  const owner = walletAddress ? walletAddress : "guest";
  return `studybuddy_${scope}_${owner}`;
}

export interface WalletData {
  materials: Material[];
  notes: any[];
}

/** Load materials + notes that belong to this wallet (or guest). */
export function loadWalletData(walletAddress: string | null): WalletData {
  if (typeof window === "undefined") return { materials: [], notes: [] };

  let materials: Material[] = [];
  let notes: any[] = [];

  try {
    const rawMats = localStorage.getItem(getStorageKey("materials", walletAddress));
    if (rawMats) materials = JSON.parse(rawMats);
  } catch {}

  try {
    const rawNotes = localStorage.getItem(getStorageKey("notes", walletAddress));
    if (rawNotes) {
      notes = JSON.parse(rawNotes);
    } else {
      // Default sample note for every new user (guest or any wallet)
      notes = [
        {
          id: 1,
          title: "Quantum Physics Summary",
          excerpt: "The main principles of quantum mechanics include...",
          content:
            "The main principles of quantum mechanics include superposition, entanglement, and the uncertainty principle.",
          date: "2 hours ago",
          color: "blue",
          tags: ["Physics", "Exams"],
        },
      ];
    }
  } catch {}

  return { materials, notes };
}

/** Persist materials + notes for a wallet (or guest). */
export function saveWalletMaterials(
  walletAddress: string | null,
  materials: Material[]
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    getStorageKey("materials", walletAddress),
    JSON.stringify(materials)
  );
}

export function saveWalletNotes(
  walletAddress: string | null,
  notes: any[]
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    getStorageKey("notes", walletAddress),
    JSON.stringify(notes)
  );
}

/** Load profile for a wallet (or guest). */
export function loadWalletProfile(walletAddress: string | null) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getStorageKey("profile", walletAddress));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persist profile for a wallet. */
export function saveWalletProfile(
  walletAddress: string | null,
  profile: { name: string; email: string; avatar: string }
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    getStorageKey("profile", walletAddress),
    JSON.stringify(profile)
  );
}

/** Load settings for a wallet. */
export function loadWalletSettings(walletAddress: string | null) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getStorageKey("settings", walletAddress));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persist settings for a wallet. */
export function saveWalletSettings(walletAddress: string | null, settings: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    getStorageKey("settings", walletAddress),
    JSON.stringify(settings)
  );
}
