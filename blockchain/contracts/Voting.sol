// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public owner;
    uint public candidateCount;
    
    mapping(uint => uint) public votes;
    mapping(address => bool) public hasVoted;
    
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    
    mapping(uint => Candidate) public candidates;
    
    event CandidateAdded(uint id, string name);
    event VoteCast(address voter, uint candidateId);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin can perform this action");
        _;
    }
    
    function addCandidate(string memory _name) public onlyOwner {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
        emit CandidateAdded(candidateCount, _name);
    }
    
    function vote(uint _candidateId) public {
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        
        votes[_candidateId]++;
        candidates[_candidateId].voteCount++;
        hasVoted[msg.sender] = true;
        
        emit VoteCast(msg.sender, _candidateId);
    }
    
    function getVotes(uint _candidateId) public view returns (uint) {
        return votes[_candidateId];
    }
    
    function getCandidate(uint _candidateId) public view returns (Candidate memory) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        return candidates[_candidateId];
    }
    
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateCount);
        for (uint i = 1; i <= candidateCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        return allCandidates;
    }
    
    function hasUserVoted(address _user) public view returns (bool) {
        return hasVoted[_user];
    }
}
