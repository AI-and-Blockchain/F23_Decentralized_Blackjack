// SPDX-License-Identifier: MIT
// The Age Verification Module
// ------------------------
// age verification module to player's to authenticate themselves.
// placeholder for the zk age verification that we failed to implement
pragma solidity ^0.8.0;

import "contracts/Authenticator.sol";

contract AgeVerifier {
    
    Authenticator public auth;
    uint8 minAge = 21;

    constructor(address authAddr) {
        // intialize Authenticator
        auth = Authenticator(authAddr);
    }

    // user call this to verify their age
    function verifyAge(uint8 age) public returns (bool) {
        // check if age is over threshold
        if (age >= minAge) {
            auth.whiteList(msg.sender);
            return true;
        }
        return false;
    }

}