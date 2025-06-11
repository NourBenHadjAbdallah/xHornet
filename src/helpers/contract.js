import { ethers } from "ethers";
import { connectWalletWithPrivateKey } from './wallet.js';
import CONTRACT_ABI from './ABI.json';

const CONTRACT_ADDRESS = "0x72bfB5c11483FfDAa613DAfF2345912Ad0596402";

export const connectToContract = async (privateKey) => {
  try {
    if (!ethers.utils.isAddress(CONTRACT_ADDRESS)) {
      throw new Error("❌ Invalid contract address");
    }

    const walletConnection = await connectWalletWithPrivateKey(privateKey);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      walletConnection.signer
    );

    console.log("📜 Connected to DiplomaRegistry contract");
    return { contract, walletConnection };
  } catch (error) {
    console.error("❌ Failed to connect to contract:", error.message);
    throw error;
  }
};

export const issueDiploma = async (contractConnection, diplomaData) => {
  try {
    const {
      fullName,
      studentId,
      speciality, 
      degree,
      academicFullYear,
      hash: diplomaHash
    } = diplomaData;

    console.log("📋 Diploma data:", { fullName, degree, speciality, academicFullYear, diplomaHash }); // Corrected

    const tx = await contractConnection.contract.issueDiploma(
      diplomaHash,
      fullName,
      studentId,
      degree,
      speciality, // Corrected
      academicFullYear
    );

    const receipt = await tx.wait();
    return {
      success: true,
      txHash: tx.hash,
      diplomaHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    if (error.code === 'CALL_EXCEPTION') {
      console.error("💥 Contract reverted:", error.reason || "Unknown reason");
      if (error.reason?.includes("DiplomaRegistry: Diploma hash already exists")) {
        console.error("🚫 This diploma has already been issued");
      } else if (error.reason?.includes("AccessControl")) {
        console.error("🚫 Access denied: Caller does not have the ISSUER role.");
      }
    }
    console.error("❌ Failed to issue diploma:", error.message);
    throw error;
  }
};