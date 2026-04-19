import hre from "hardhat";

async function main() {
  console.log("🧪 Testing Generic Voting contract...");
  
  // Replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const voting = await hre.ethers.getContractAt("Voting", contractAddress);
  
  const ELECTION_ID = 1;
  const CANDIDATE_ALICE_ID = 101;
  const CANDIDATE_BOB_ID = 102;
  
  // Get signers for testing
  const [owner, voter1, voter2] = await hre.ethers.getSigners();
  
  console.log("🗳️ Casting votes...");
  await voting.connect(voter1).vote(ELECTION_ID, CANDIDATE_ALICE_ID); // Vote for Alice
  await voting.connect(voter2).vote(ELECTION_ID, CANDIDATE_BOB_ID);   // Vote for Bob
  
  console.log("📈 Fetching results...");
  const aliceVotes = await voting.getVotes(ELECTION_ID, CANDIDATE_ALICE_ID);
  const bobVotes = await voting.getVotes(ELECTION_ID, CANDIDATE_BOB_ID);

  console.log(`Candidate 101 (Alice) Votes: ${aliceVotes}`);
  console.log(`Candidate 102 (Bob) Votes: ${bobVotes}`);
  
  console.log("✅ Test completed successfully!");
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exitCode = 1;
});
