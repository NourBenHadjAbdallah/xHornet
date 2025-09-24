import { ethers } from "ethers";

   const crypto = window.require ? window.require("crypto") : null;

   const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY || "blsABb0VaMpiG0YqztZAJRiiZPsiuRON+cuDsXTYG3s=", "base64");

   // Validate key length
   if (SECRET_KEY.length !== 32) {
     throw new Error(`Invalid ENCRYPTION_KEY length: ${SECRET_KEY.length} bytes, expected 32 bytes`);
   }

   // Encryption function (AES-256-CBC with random IV, base64 output)
   export const encrypt = (text) => {
     if (!crypto) throw new Error("Crypto module not available. Ensure running in an Electron environment or provide a browser-compatible crypto library.");
     const iv = crypto.randomBytes(16);
     const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
     let encrypted = cipher.update(text, "utf8", "hex");
     encrypted += cipher.final("hex");
     const ivHex = iv.toString("hex");
     return Buffer.from(ivHex + encrypted).toString("base64");
   };

   // Helper to convert encrypted base64 to 32-byte hex for bytes32 (padded or truncated)
   export const toBytes32Hex = (encryptedBase64) => {
     if (!crypto) throw new Error("Crypto module not available. Ensure running in an Electron environment or provide a browser-compatible crypto library.");
     const binaryData = Buffer.from(encryptedBase64, 'base64');
     const hex = `0x${binaryData.toString('hex')}`;
     if (hex.length > 66) return hex.substring(0, 66); // Truncate to 32 bytes + 0x
     if (hex.length < 66) return ethers.utils.hexZeroPad(hex, 32); // Pad to 32 bytes
     return hex;
   };

   export function generateDiplomaHash(diplomaData) {
     const { fullName, degree, specialty, mention, idNumber, academicYear, juryMeetingDate, directorName } = diplomaData;

     // Encrypt fullName and idNumber
     const encryptedFullName = toBytes32Hex(encrypt(fullName));
     const encryptedIdNumber = toBytes32Hex(encrypt(idNumber));

     const diplomaHash = ethers.utils.solidityKeccak256(
       ['string', 'string', 'string', 'string', 'string', 'string', 'string', 'string'],
       [encryptedFullName, degree, specialty, mention, encryptedIdNumber, academicYear, juryMeetingDate, directorName]
     );

     return diplomaHash;
   }