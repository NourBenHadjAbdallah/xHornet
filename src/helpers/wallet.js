import { ethers, formatEther, parseEther, Wallet } from "ethers";
import { connectProvider } from './blockchain.js';

const TEST_PRIVATE_KEY = "79fe3fa380c3b5e244c5cba7a6ef0f503f9adf9e486b562eb804ddc761a16c7d";

export const connectWalletWithPrivateKey = async (privateKey = TEST_PRIVATE_KEY) => {
  try {
    if (!privateKey) {
      throw new Error("❌ Private key is required");
    }

    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }

    if (privateKey.length !== 66) {
      throw new Error("❌ Invalid private key format. Should be 64 characters (32 bytes)");
    }

    const provider = connectProvider();
    const wallet = new Wallet(privateKey, provider);

    return {
      provider,
      wallet,
      signer: wallet,
      address: wallet.address
    };

  } catch (error) {
    throw error;
  }
};

export const getWalletBalance = async (walletConnection) => {
  try {
    const balance = await walletConnection.provider.getBalance(walletConnection.address);
    const balanceInEth = formatEther(balance);
    console.log(`💰 Balance: ${balanceInEth} ETH`);
    return balanceInEth;
  } catch (error) {
    console.error("❌ Failed to get balance:", error.message);
    throw error;
  }
};

export const sendTransaction = async (walletConnection, toAddress, amountInEth) => {
  try {
    const tx = {
      to: toAddress,
      value: parseEther(amountInEth.toString()),
      gasLimit: 21000,
    };

    console.log("📤 Sending transaction...");
    const txResponse = await walletConnection.wallet.sendTransaction(tx);
    console.log("🔗 Transaction hash:", txResponse.hash);

    const receipt = await txResponse.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    return receipt;
  } catch (error) {
    console.error("❌ Transaction failed:", error.message);
    throw error;
  }
};

export const signMessage = async (walletConnection, message) => {
  try {
    const signature = await walletConnection.wallet.signMessage(message);
    console.log("✍️ Message signed:", signature);
    return signature;
  } catch (error) {
    console.error("❌ Message signing failed:", error.message);
    throw error;
  }
};