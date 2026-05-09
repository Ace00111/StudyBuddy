import { Material } from "./materials";

/** Build a namespaced localStorage key scoped to a specific wallet address only. */
export function getStorageKey(
  scope: "materials" | "notes" | "profile" | "settings",
  walletAddress: string
): string {
  // Only create keys for valid wallet addresses - no guest fallback
  if (!walletAddress || walletAddress === "guest") {
    throw new Error("Wallet address required for storage operations");
  }
  return `studybuddy_wallet_${walletAddress}_${scope}`;
}

export interface WalletData {
  materials: Material[];
  notes: any[];
}

/** Load materials + notes that belong to this specific wallet address only. */
export function loadWalletData(walletAddress: string): WalletData {
  if (typeof window === "undefined" || !walletAddress || walletAddress === "guest") {
    return { materials: [], notes: [] };
  }

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
      // Default sample note for this specific wallet only
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

/** Persist materials + notes for a specific wallet address only. */
export function saveWalletMaterials(
  walletAddress: string,
  materials: Material[]
): void {
  if (typeof window === "undefined" || !walletAddress || walletAddress === "guest") return;
  localStorage.setItem(
    getStorageKey("materials", walletAddress),
    JSON.stringify(materials)
  );
}

export function saveWalletNotes(
  walletAddress: string,
  notes: any[]
): void {
  if (typeof window === "undefined" || !walletAddress || walletAddress === "guest") return;
  localStorage.setItem(
    getStorageKey("notes", walletAddress),
    JSON.stringify(notes)
  );
}

/** Load profile for a specific wallet address only. */
export function loadWalletProfile(walletAddress: string) {
  if (typeof window === "undefined" || !walletAddress || walletAddress === "guest") return null;
  try {
    const raw = localStorage.getItem(getStorageKey("profile", walletAddress));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persist profile for a specific wallet address only. */
export function saveWalletProfile(
  walletAddress: string,
  profile: { name: string; email: string; avatar: string }
): void {
  if (typeof window === "undefined" || !walletAddress || walletAddress === "guest") return;
  localStorage.setItem(
    getStorageKey("profile", walletAddress),
    JSON.stringify(profile)
  );
}

/** Load settings for a specific wallet address only. */
export function loadWalletSettings(walletAddress: string) {
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
  if (typeof window === "undefined" || !walletAddress) return;
  localStorage.setItem(
    getStorageKey("settings", walletAddress),
    JSON.stringify(settings)
  );
}
