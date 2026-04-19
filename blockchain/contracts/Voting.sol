// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public owner;
    
    // electionId => (candidateId => voteCount)
    mapping(uint => mapping(uint => uint)) public votes;
    
    // electionId => (address => bool)
    mapping(uint => mapping(address => bool)) public hasVoted;
    
    event VoteCast(address voter, uint electionId, uint candidateId);
    
    constructor() {
        owner = msg.sender;
    }
    
    function vote(uint _electionId, uint _candidateId) public {
        require(!hasVoted[_electionId][msg.sender], "You have already voted in this election");
        
        votes[_electionId][_candidateId]++;
        hasVoted[_electionId][msg.sender] = true;
        
        emit VoteCast(msg.sender, _electionId, _candidateId);
    }
    
    function getVotes(uint _electionId, uint _candidateId) public view returns (uint) {
        return votes[_electionId][_candidateId];
    }
    
    function hasUserVoted(uint _electionId, address _user) public view returns (bool) {
        return hasVoted[_electionId][_user];
    }
}
