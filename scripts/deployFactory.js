const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Factory...");
  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  console.log("✅ Factory deployed:", await factory.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
