import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying WarrantyTracker contract...\n");

  const WarrantyTracker = await hre.ethers.getContractFactory("WarrantyTracker");
  const warrantyTracker = await WarrantyTracker.deploy();
  await warrantyTracker.waitForDeployment();

  const address = await warrantyTracker.getAddress();
  console.log("✅ WarrantyTracker deployed to:", address);
  console.log("\n📋 Copy this address into frontend/app.js → CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
