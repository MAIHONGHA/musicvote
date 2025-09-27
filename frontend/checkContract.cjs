// checkContract.cjs
const { ethers } = require("ethers");
require("dotenv").config();

// Contract address from .env
const contract = process.env.VITE_CONTRACT;

// Multiple Sepolia RPC endpoints as fallback
const RPCS = [
  "https://1rpc.io/sepolia",
  "https://rpc.ankr.com/eth_sepolia",
  "https://sepolia.gateway.tenderly.co",
  "https://ethereum-sepolia-rpc.publicnode.com"
];

// Function to check if the contract exists
async function check() {
  for (const url of RPCS) {
    try {
      console.log("Trying RPC: " + url);
      const provider = new ethers.JsonRpcProvider(url);
      const code = await provider.getCode(contract);

      if (code && code !== "0x") {
        console.log("Contract found at RPC: " + url);
        console.log("Code length: " + code.length);
        return;
      } else {
        console.log("No contract found at RPC: " + url);
      }
    } catch (err) {
      console.log("RPC error: " + url + " " + (err.code || err.message));
    }
  }
  console.log("Contract not found on any RPC.");
}

check();
