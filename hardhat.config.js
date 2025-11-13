import "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv";
dotenv.config();

export default {
  solidity: "0.8.20",

  networks: {
    base: {
      type: "http",
      url: process.env.BASE_RPC_URL,
      accounts: [process.env.PRIVATE_KEY_DEPLOYER],
      chainId: 8453, // ✅ WAJIB untuk api v2 
    },
  },

  etherscan: {
    apiKey: {
      base: process.env.ETHERSCAN_API_KEY, // ✅ format multi-chain
    },

    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=8453", // ✅ panggil dengan chainid=8453
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
};
