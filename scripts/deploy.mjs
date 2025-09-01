import { readFileSync } from "fs";
import { join } from "path";
import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const artifactPath = join(process.cwd(), "artifacts/contracts/ConfidentialVoting.sol/ConfidentialVoting.json");
const { abi, bytecode } = JSON.parse(readFileSync(artifactPath, "utf8"));

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log("ConfidentialVoting deployed to:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });