import hre from "hardhat";

async function main() {
  console.log("🧪 Testing Voting contract...");
  
  // Replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const voting = await hre.ethers.getContractAt("Voting", contractAddress);
  
  console.log("📊 Adding candidates...");
  await voting.addCandidate("Alice");
  await voting.addCandidate("Bob");
  await voting.addCandidate("Charlie");
  
  console.log("👥 Getting all candidates:");
  const candidates = await voting.getAllCandidates();
  candidates.forEach((candidate, index) => {
    console.log(`${index + 1}. ${candidate.name} (Votes: ${candidate.voteCount})`);
  });
  
  // Get signers for testing
  const [owner, voter1, voter2] = await hre.ethers.getSigners();
  
  console.log("🗳️ Casting votes...");
  await voting.connect(voter1).vote(1); // Vote for Alice
  await voting.connect(voter2).vote(2); // Vote for Bob
  
  console.log("📈 Final results:");
  const finalCandidates = await voting.getAllCandidates();
  finalCandidates.forEach((candidate, index) => {
    console.log(`${index + 1}. ${candidate.name}: ${candidate.voteCount} votes`);
  });
  
  console.log("✅ Test completed successfully!");
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exitCode = 1;
});
