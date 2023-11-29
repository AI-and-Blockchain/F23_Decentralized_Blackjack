// SPDX-License-Identifier: MIT
// The Age Verification Module
// ------------------------
// The authenticator module keeps track of which address
// is authorized to play the game, by default all accounts 
// are blacklisted, unless verified by the age verfication 
// module. The owner has full control of the whitelist.
// The AI cheat detection module will be able to auto-ban a
// player via this contract suspicious activity is found.
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