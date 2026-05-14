import { ShelbyClient } from "@shelby-protocol/sdk";
import { Network } from "@aptos-labs/ts-sdk";

// Initialize the Shelby Client with testnet configuration
// Note: In a production app, these should come from environment variables
export const shelbyClient = new ShelbyClient({
  network: Network.TESTNET,
});
