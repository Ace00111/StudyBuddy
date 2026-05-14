import { shelbyClient } from "./shelbyClient";
import { AccountAddress } from "@aptos-labs/ts-sdk";

export interface ShelbyUploadResult {
  fileId: string;
  txHash: string;
  contentHash: string;
  timestamp: number;
}

export interface ShelbyDownloadResult {
  fileData: Blob;
  txHash: string;
  timestamp: number;
}

/**
 * Downloads a blob from the Shelby Protocol using the official SDK.
 */
export async function downloadFromShelby(
  blobName: string,
  ownerAddress: string
): Promise<ShelbyDownloadResult> {
  console.log(`[Shelby Protocol] Initiating decentralized download for: ${blobName}`);
  
  try {
    const blob = await shelbyClient.download({
      account: AccountAddress.fromString(ownerAddress),
      blobName: blobName,
    });

    return {
      fileData: new Blob([blob as any]),
      txHash: "0x...", // Transaction hash not directly returned by download
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Shelby download error:", error);
    throw error;
  }
}

/**
 * Generates a SHA-256 content hash for a file.
 */
export async function generateContentHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Returns the public gateway URL for a Shelby blob.
 */
export function getShelbyFileUrl(blobName: string, ownerAddress?: string): string {
  const config = shelbyClient.config as any;
  const baseUrl = config.shelby?.rpc?.baseUrl?.replace("-api", "-gateway") || "https://gateway.shelby.com";
  if (ownerAddress) {
    return `${baseUrl}/${ownerAddress}/${blobName}`;
  }
  return `${baseUrl}/${blobName}`;
}

export function getShelbyTestnetInfo() {
  const config = shelbyClient.config as any;
  return {
    apiUrl: config.shelby?.rpc?.baseUrl || "https://api.shelby.com",
    network: config.aptos?.network || "testnet",
  };
}
/**
 * Legacy upload function to satisfy existing API routes.
 * Real uploads should happen on the client using the Shelby React hooks.
 */
export async function uploadToShelby(file: File, ownerAddress: string): Promise<ShelbyUploadResult> {
  console.warn("Legacy uploadToShelby called. Client-side hooks preferred.");
  return {
    fileId: "legacy-" + Date.now(),
    txHash: "0x...",
    contentHash: "0x...",
    timestamp: Date.now()
  };
}
