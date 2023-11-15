// SPDX-License-Identifier: MIT
// BlackJack Chips ERC20 Token (BJT)
// ---------------------------------
// This is the equivalent of chips in a casino, all game 
// play interactions uses BJT instead of ETH.
// 
// Tokenomics
// ----------
// - BJT will have the same decimal places (-18) as ETH
// - The price of BJT to ETH 1:1, and will remain constant
// - All minted BJT will be backed by the equivalent amount of ETH
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract BlackJackToken is ERC20, ERC20Burnable, AccessControl, ERC20Permit {
    address owner;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor()
        ERC20("BlackJackToken", "BJT")
        ERC20Permit("BlackJackToken")
    {
        // default admin is the deployer
        owner = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
    }

    // allows admin role to grant access control
    function grantMinterRole(address to) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, to);
    }

    // only allow address with MINTER_ROLE to mint
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}