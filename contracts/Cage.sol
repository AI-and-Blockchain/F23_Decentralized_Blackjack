// SPDX-License-Identifier: MIT
// Cage Module
// -----------
// This is where the house deposits their funds and players swapping
// eth for chips or the other way around.
// 
// 
pragma solidity ^0.8.20;

import "contracts/BJT.sol";
import "contracts/Authenticator.sol";

contract Cage {
    address owner;  // assume to be the house address
    BlackJackToken token;
    Authenticator auth;

    constructor(address _token, address _auth) {
        owner = msg.sender;
        token = BlackJackToken(_token);
        auth = Authenticator(_auth);
    }

    // house deposit funds
    function deposit() public payable {
        require(msg.sender == owner, "unauthorized");
        // mint the tokens and transfer it to the house's wallet
        token.mint(owner, msg.value);
    }

    // user exchange ETH for chips
    function exchangeETHforBJT() public payable {
        require(auth.isVerified(msg.sender), "unauthorized");
        require(msg.sender != owner, "the house cannot exchange for chips");
        // make sure the house has enough balance
        require(token.balanceOf(owner) >= msg.value, "insufficient funds for the house");
        // transfer equivalent BJT from the house to the player
        token.transfer(msg.sender, msg.value);
    }

    // user exchange chips for ETH
    function exchangeBJTforETH(address payable _to, uint256 amount) public payable {
        require(auth.isVerified(msg.sender), "unauthorized");
        require(msg.sender != owner, "the house should use the withdraw() function");
        // make sure the user has enough balance
        require(token.balanceOf(msg.sender) >= amount, "insufficient funds");
        // player transfer BJT back to the house
        token.transferFrom(_to, owner, amount);
        // make sure the house has enough balance
        require(token.balanceOf(owner) >= amount, "insufficient funds for the house");
        // transfer equivalent ETH from the house to the player
        (bool sent, bytes memory data) = _to.call{value: amount}("");
        require(sent, "failed to redeem ether");
        // burn the token
        token.burnFrom(owner, amount);
    }

    // house withdraw funds
    function withdraw(address payable _to, uint256 amount) public {
        require(msg.sender == owner, "unauthorized");
        // make sure house has enough balance
        require(token.balanceOf(owner) >= amount);
        // withdraw ETH to other address
        (bool sent, bytes memory data) = _to.call{value: amount}("");
        require(sent, "failed to redeem ether");
        // burn the token
        token.burnFrom(owner, amount);
    }
}