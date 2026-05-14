import { ShelbyClient } from "@shelby-protocol/sdk/browser";

import { Network } from "@aptos-labs/ts-sdk";

const nodeUrl = process.env.NEXT_PUBLIC_APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com";
const envNetwork = process.env.NEXT_PUBLIC_NETWORK?.toLowerCase();

let network: Network;
if (envNetwork === "mainnet") {
  network = Network.MAINNET;
} else if (envNetwork === "testnet") {
  network = Network.TESTNET;
} else {
  network = nodeUrl.includes("mainnet") ? Network.MAINNET : Network.TESTNET;
}

// Initialize the Shelby Client with configuration from environment variables
export const shelbyClient = new ShelbyClient({
  network,
  fullnode: nodeUrl,
} as any);


