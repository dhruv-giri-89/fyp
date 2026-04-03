import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Voting contract...");
  
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  const address = await voting.getAddress();

  console.log("✅ Contract deployed to:", address);
  console.log("📝 Save this address for frontend integration");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
