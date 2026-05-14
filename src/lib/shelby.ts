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
      fileData: new Blob([blob.data]),
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
  const baseUrl = shelbyClient.config.shelby.rpc.baseUrl.replace("-api", "-gateway");
  if (ownerAddress) {
    return `${baseUrl}/${ownerAddress}/${blobName}`;
  }
  return `${baseUrl}/${blobName}`;
}

export function getShelbyTestnetInfo() {
  return {
    apiUrl: shelbyClient.config.shelby.rpc.baseUrl,
    network: shelbyClient.config.aptos.network,
  };
}
