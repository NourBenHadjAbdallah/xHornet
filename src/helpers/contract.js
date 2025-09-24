import { ethers } from "ethers";
import { connectWalletWithPrivateKey } from './wallet.js';
import { checkBalanceForTx } from './LimitAlert.js';
import CONTRACT_ABI from './ABI.json';


//const CONTRACT_ADDRESS = "0x7Dba8948a8d6E5CABF907fA4cAd498d4e49d069d";
//const CONTRACT_ADDRESS = "0x732aDB73A60D3f2dED37517b34b599787d640f53";
// const CONTRACT_ADDRESS = "0xe97a27B2ec34852333dD96a8927a11fE2d4ce912";
//const CONTRACT_ADDRESS = "0xa0F54a6d385aBdCa20c12A80d4d12072C4E8590b";
// const CONTRACT_ADDRESS = "0xCcdd3740eA3bFb31c5a9DC01fcb9647e5AF6edCe"; //ETH
const CONTRACT_ADDRESS = "0xf647Cb668D021210c7bE40Eefa8A511f8C27966D"; //BSC
// const CONTRACT_ADDRESS = "0xc1Fbcba0163Bef2882Ff3F622144e07006F33Ede"; //POL
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
      directorName,
      diplomaHash
    } = Diploma;

    console.log("📋 Diploma data:", { fullName, degree, specialty, mention, idNumber, academicYear, juryMeetingDate, diplomaHash, directorName });

    // Check balance before issuing
    const txArgs = [
      diplomaHash,
      fullName,
      degree,
      specialty,
      mention,
      idNumber,
      academicYear,
      juryMeetingDate,
      directorName
    ];
    await checkBalanceForTx(contractConnection, 'issueDiploma', txArgs);

    const tx = await contractConnection.contract.issueDiploma(
      diplomaHash,
      fullName,
      degree,
      specialty,
      mention,
      idNumber,
      academicYear,
      juryMeetingDate,
      directorName
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
        !d.juryMeetingDate ||
        !d.directorName
      ) {
        throw new Error("Each diploma input must have all required fields.");
      }
    }

    // Check balance before batch issuance
    await checkBalanceForTx(contractConnection, 'storeDiplomasBatch', [diplomaInputs]);

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
    if (error.code === 'CALL_EXCEPTION') {
      console.error("💥 Contract reverted:", error.reason || "Unknown reason");
      if (error.reason?.includes("Duplicate diploma")) {
        console.error("🚫 One or more diplomas in the batch already exist.");
      }
    }
    console.error("❌ Failed to batch issue diplomas:", error.message);
    throw error;
  }
};