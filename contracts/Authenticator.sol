// SPDX-License-Identifier: MIT
// The Authenticator Module
// ------------------------
// The authenticator module keeps track of which address
// is authorized to play the game, by default all accounts 
// are blacklisted, unless verified by the age verfication 
// module. The owner has full control of the whitelist.
// The AI cheat detection module will be able to auto-ban a
// player via this contract suspicious activity is found.
pragma solidity ^0.8.0;

contract Authenticator {
    mapping(address => bool) public verifiedList;   // list of verified account
    // three potential interactor of the contract, each with different privileges
    address public owner;       // full control of the whitelist
    address public ageVerifier; // can only append to the whitelist
    address public cheatBot;    // can only blacklist accounts

    constructor(address ageVerifierAddr, address cheatBotAddr) {
        // set owner, who has full control of the whitelist
        owner = msg.sender;
        // set other privileged accounts
        ageVerifier = ageVerifierAddr;
        cheatBot = cheatBotAddr;
    }

    // check if account is verified
    function isVerified(address account) public view returns (bool) {
        return verifiedList[account];
    }

    // white list an account
    function whiteList(address account) public {
        // only privileged account can perform this action
        require(msg.sender == owner || msg.sender == ageVerifier, "unauthorized");
        verifiedList[account] = true;
    }

    // black list an account
    function blackList(address account) public {
        // only privileged accounts can perform this action
        require(msg.sender == owner || msg.sender == cheatBot, "unauthorized");
        verifiedList[account] = false;
    }
}