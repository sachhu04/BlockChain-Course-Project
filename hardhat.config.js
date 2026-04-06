import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Uncomment below to deploy to Sepolia testnet
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    //   accounts: ["YOUR_PRIVATE_KEY"],
    // },
  },
};
