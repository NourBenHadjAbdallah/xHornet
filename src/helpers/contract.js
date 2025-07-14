import { ethers } from "ethers";
import { connectWalletWithPrivateKey } from './wallet.js';
import CONTRACT_ABI from './ABI.json';

const CONTRACT_ADDRESS = "0x77F39e6ef68CFd1271209D75b12025e94E99B109";

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

export const issueDiploma = async (contractConnection, Diploma) => {
  try {
    const {
      fullName,
      degree,
      specialty,
      mention,
      idNumber,
      academicYear,
      juryMeetingDate,
      diplomaHash
    } = Diploma;

    console.log("📋 Diploma data:", { fullName, degree, specialty, mention, idNumber, academicYear, juryMeetingDate, diplomaHash });

    const tx = await contractConnection.contract.issueDiploma(
      diplomaHash,
      fullName,
      degree,
      specialty,
      mention,
      idNumber,
      academicYear,
      juryMeetingDate
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

export const storeDiplomasBatch = async (contractConnection, diplomaInputs) => {
  try {
    // Validate input is an array of objects with correct fields
    if (!Array.isArray(diplomaInputs) || diplomaInputs.length === 0) {
      throw new Error("Diploma batch must be a non-empty array.");
    }
    // Each object must have all required fields
    for (const d of diplomaInputs) {
      if (
        !d.diplomaHash ||
        !d.fullName ||
        !d.degree ||
        !d.specialty ||
        !d.mention ||
        !d.idNumber ||
        !d.academicYear ||
        !d.juryMeetingDate
      ) {
        throw new Error("Each diploma input must have all required fields.");
      }
    }

    // Call the contract with the array
    const tx = await contractConnection.contract.storeDiplomasBatch(diplomaInputs);
    const receipt = await tx.wait();
    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    if(error.code === 'CALL_EXCEPTION') {
      console.error("💥 Contract reverted:", error.reason || "Unknown reason");
      if (error.reason?.includes("Duplicate diploma")){
        console.error("🚫 One or more diplomas in the batch already exist.");
      }
    }
    console.error("❌ Failed to batch issue diplomas:", error.message);
    throw error;
  }
};