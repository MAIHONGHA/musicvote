// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ConfidentialVoting is Ownable {
    mapping(address => bool) public hasVoted;
    uint256 public yesCount;
    uint256 public noCount;

    constructor() Ownable(msg.sender) {}

    function vote(bool yes) external {
        require(!hasVoted[msg.sender], "already voted");
        hasVoted[msg.sender] = true;
        if (yes) {
            yesCount += 1;
        } else {
            noCount += 1;
        }
    }
}