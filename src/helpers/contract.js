import { ethers } from "ethers";
import { connectWalletWithPrivateKey } from './wallet.js';
import CONTRACT_ABI from './ABI.json';


const CONTRACT_ADDRESS = "0x0Da41983E13521EcE6598D1D9B7867793A0217F8"; 

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

    console.log("📜 Connected to Verif contract");
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
      degree,
      academicFullYear,
      hash: diplomaHash 
    } = diplomaData;
    
    console.log("📋 Diploma data:", { fullName, degree, academicFullYear, diplomaHash });
    
    const tx = await contractConnection.contract.issueDiploma(
      diplomaHash,
      fullName,
      degree,
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
      if (error.reason?.includes("Diploma already exists")) {
        console.error("🚫 This diploma has already been issued");
      } else if (error.reason?.includes("AccessControl")) {
        console.error("🚫 Access denied: Only authorized issuers can issue diplomas");
      }
    }
    console.error("❌ Failed to issue diploma:", error.message);
    throw error;
  }
};

export const verifyDiploma = async (contractConnection, diplomaHash) => {
  try {
    console.log("🔍 Verifying diploma with hash:", diplomaHash);
    const diploma = await contractConnection.contract.verifyDiploma(diplomaHash);
    console.log("📋 Verification result:", {
      fullName: diploma.fullName,
      degree: diploma.degree,
      academicFullYear: diploma.academicFullYear,
      issuer: diploma.issuer,
      timestamp: new Date(diploma.timestamp.toNumber() * 1000).toISOString(),
      isValid: diploma.isValid
    });
    return {
      isValid: diploma.isValid,
      fullName: diploma.fullName,
      degree: diploma.degree,
      academicFullYear: diploma.academicFullYear,
      issuer: diploma.issuer,
      timestamp: diploma.timestamp.toNumber(),
      issuedDate: new Date(diploma.timestamp.toNumber() * 1000).toISOString()
    };
  } catch (error) {
    if (error.reason?.includes("Diploma not found or invalid")) {
      console.error("🚫 Diploma not found or invalid");
      return {
        isValid: false,
        error: "Diploma not found or invalid"
      };
    }
    console.error("❌ Failed to verify diploma:", error.message);
    throw error;
  }
};