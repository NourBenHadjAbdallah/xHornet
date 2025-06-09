import axios from 'axios'; 

const PINATA_API_KEY = '4f92f1410b7354d01bc3'; 
const PINATA_SECRET_API_KEY = 'fde1930d0f49a988195f78c580bfb97d537ea29e7c876c5cc05ac29548092a1b';


const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const uploadToIPFS = async (fileContent, fileName) => {
  if (!PINATA_API_KEY && !PINATA_SECRET_API_KEY) {
    throw new Error("Pinata API Key or Secret API Key is not configured. Please check your environment setup.");
  }

  const formData = new FormData();

  const blob = new Blob([fileContent], { type: 'application/pdf' });
  formData.append('file', blob, fileName);
  const metadata = JSON.stringify({
    name: fileName, 
  });
  formData.append('pinataMetadata', metadata);



  try {
    const response = await axios.post(PINATA_PIN_FILE_URL, formData, {
      maxBodyLength: "Infinity", 
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
    });

    console.log('Successfully pinned to Pinata:', response.data);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ Failed to upload to Pinata:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data && error.response.data.error) {
        throw new Error(`Pinata API Error: ${error.response.data.error.reason || error.response.data.error}`);
    }
    throw new Error(`Failed to upload to Pinata: ${error.message}`);
  }
};

export const getIPFSUrl = (cid, fileNameHint) => {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;

};