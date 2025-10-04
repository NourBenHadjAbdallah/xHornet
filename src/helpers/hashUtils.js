import { solidityPackedKeccak256 } from "ethers";

const crypto = window.require ? window.require("crypto") : null;

// This is a 256-bit key (32 bytes = 64 hex characters)
const AES_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

export const encryptAES = (text) => {
  if (!crypto) {
    throw new Error("Crypto module not available. Ensure running in an Electron environment.");
  }
  
  try {
    // Generate a random IV (Initialization Vector) for each encryption
    const ivRaw = crypto.randomBytes(16); // 128 bits = 16 bytes
    const iv = Buffer.from(ivRaw); // Ensure it's a Buffer
    
    // Convert hex key to Buffer
    const key = Buffer.from(AES_KEY, 'hex');
    
    if (key.length !== 32) {
      throw new Error(`Invalid AES key length: expected 32 bytes, got ${key.length}`);
    }
    
    // Create cipher and encrypt
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    // Get encrypted data as hex, then convert to Buffer
    let encryptedHex = cipher.update(text, 'utf8', 'hex');
    encryptedHex += cipher.final('hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    // Combine IV and ciphertext as raw bytes using hex concatenation
    const combinedHex = iv.toString('hex') + encrypted.toString('hex');
    const combined = Buffer.from(combinedHex, 'hex');
    
    // Convert to base64
    const base64Output = combined.toString('base64');
    
    return base64Output;
  } catch (error) {
    throw new Error(`AES encryption failed: ${error.message}`);
  }
};

export const encryptedToBytes = (encryptedBase64) => {
  try {
    // Convert base64 to Buffer
    const buffer = Buffer.from(encryptedBase64, 'base64');
    
    // Convert to hex with 0x prefix
    const hexOutput = "0x" + buffer.toString('hex');
    
    return hexOutput;
  } catch (error) {
    throw new Error(`Base64 to bytes conversion failed: ${error.message}`);
  }
};

export function generateDiplomaHash(diplomaData) {
  const { 
    fullName, 
    degree, 
    specialty, 
    mention, 
    idNumber, 
    academicYear, 
    juryMeetingDate, 
    directorName 
  } = diplomaData;

  // Generate hash using plaintext data
  const diplomaHash = solidityPackedKeccak256(
    ['string', 'string', 'string', 'string', 'string', 'string', 'string', 'string'],
    [fullName, degree, specialty, mention, idNumber, academicYear, juryMeetingDate, directorName]
  );
  
  return diplomaHash;
}