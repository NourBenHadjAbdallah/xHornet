import { ethers } from "ethers";

const infuraApiKey = "76741657767d47deb1a4a9722e477d6f";

export const connectProvider = () => {
  if (!infuraApiKey) {
    throw new Error("❌ API key not found. Check your environment setup.");
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraApiKey}`);
    console.log("🔗 Provider initialized for Sepolia via Infura");
    return provider;
  } catch (error) {
    console.error("❌ Provider initialization failed:", error.message);
    throw error;
  }
};




