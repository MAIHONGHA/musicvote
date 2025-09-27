// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhevm/solidity/lib/FHE.sol";

contract VoteFHE {
    euint32 private optionA;
    euint32 private optionB;

    constructor() {
        optionA = FHE.asEuint32(0);
        optionB = FHE.asEuint32(0);
    }

    function vote(euint32 choice) external {
        ebool isA = FHE.eq(choice, FHE.asEuint32(0));
        ebool isB = FHE.eq(choice, FHE.asEuint32(1));

        euint32 incA = FHE.select(isA, FHE.asEuint32(1), FHE.asEuint32(0));
        euint32 incB = FHE.select(isB, FHE.asEuint32(1), FHE.asEuint32(0));

        optionA = FHE.add(optionA, incA);
        optionB = FHE.add(optionB, incB);
    }
}