import { ethers, formatEther } from "ethers";

export const checkBalanceForTx = async (contractConnection, txFunction, txArgs, bufferMultiplier = 1.2) => {
  const { contract, walletConnection } = contractConnection;
  const provider = walletConnection.signer.provider;
  const walletAddress = await walletConnection.signer.getAddress();

  try {
    // Estimate gas for the specific transaction
    const estimatedGas = await contract.estimateGas[txFunction](...txArgs);

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    // Calculate total estimated cost (with buffer for safety)
    const totalCost = estimatedGas.mul(gasPrice).mul(Math.round(bufferMultiplier * 100)).div(100); // Buffer as integer division

    // Get wallet balance
    const balance = await provider.getBalance(walletAddress);

    if (balance.lt(totalCost)) {
      throw new Error("Vous avez dépassé votre limite pour la génération de diplômes. Veuillez contacter CYBOTS pour recharger votre pack.");
    }

    console.log(`Balance check passed. Wallet balance: ${formatEther(balance)} BNB`);
    return true; // Sufficient balance
  } catch (error) {
    console.error("Gas estimation or balance check failed:", error.message);
    throw error; // Rethrow to handle in caller
  }
};