// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Đổi "ConfidentialVoting" đúng tên contract của bạn trong contracts/*.sol
  const Contract = await hre.ethers.getContractFactory("ConfidentialVoting");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("Deployed at:", addr);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});