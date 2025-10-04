import { ethers, JsonRpcProvider } from "ethers";

const infuraApiKey = "76741657767d47deb1a4a9722e477d6f";
const infuraApiKeyBSC = "724123a9ab2545eaa5de9fa3ceea3055";
const bscTestnetRpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const amoyRpcUrl = `https://polygon-amoy.infura.io/v3/${infuraApiKey}`;

export const connectProvider = () => {
  try {
    const provider = new JsonRpcProvider(bscTestnetRpcUrl);
    console.log("🔗 Provider initialized for BSC Testnet");
    return provider;
  } catch (error) {
    console.error("❌ Provider initialization failed:", error.message);
    throw error;
  }
};