require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
      { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
    ],
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};