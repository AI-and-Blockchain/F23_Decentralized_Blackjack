# Smart Contracts

High level desription of what each module does, and how should frontend applications utilizes it.

## Authenticator Module

The authenticator module keeps track of which address is authorized to play the game, by default all accounts are blacklisted,
 unless verified by the age verfication module. The owner has full control of the whitelist.
The AI cheat detection module will be able to auto-ban players via this contract suspicious activity is found.

**Public Functions**

```
isVerified(address account) public view returns (bool)
```
Returns boolean indicating if the given address is verified to play the game. 
Frontend applications should check this before redirecting the user from the login page to the actual gameplay.

```
function whiteList(address account) public
```
Privileged accounts (house, age verifier) can call this to authorize other address for gameplay.


```
isVerified(address account)
```
Privileged accounts (house, cheat bot) can call this to ban certain address.


## BJT Module
This is the equivalent of chips in a casino, all game 
play interactions uses BJT instead of ETH.

**Tokenomics**

- BJT will have the same decimal places (-18) as ETH
- The price of BJT to ETH 1:1, and will remain constant via minting and burning
- All minted BJT will be backed by the equivalent amount of ETH

Tokenomics logic are implemented in the Cage Module.

**Public Functions**

```
balanceOf(address account) public view virtual returns (uint256)
```
Frontend applications can call this on the player's address to check their current BJT balance.

```
approve(address spender, uint256 value) public virtual returns (bool)
```
Frontend applications needs to call this on-behalf of the player before the smart contracts can use their BJT token. 


## Cage Module

This is where the house deposits their funds and players swapping
eth for chips or the other way around.

To make sure that the every single BJT is backed up by a single ETH,
BJT is only minted when the house deposits funds. User will be able to swap
their ETH for the equivalent amount of BJT from the house. When the user
wants to swap BJT back to ETH, they'll have to first send the BJT to the house,
the house than burns the BJT and release the equivalent amount of ETH back to the user.

This Cage contract address holds all the available funds (ETH) in the gameplay circulation. 

**Public Functions**

```
deposit() public payable
```
House can call this to deposit ETH into the Cage. 
This will mint the equivalent amount of BJT into circulation.

```
withdraw(address payable _to, uint256 amount) public
```
House can call this to withdraw ETH from the Cage.
This will burn the equivalent amount of BJT out of circulation.

```
exchangeETHforBJT() public payable
```
Frontend applications can call this before gameplay to allow user to exchange ETH for the in-game token BJT (cash-in).

```
exchangeBJTforETH(address payable _to, uint256 amount) public payable
```
Frontend applications can call this after gameplay to allow user to exchange BJT back to ETH (cash-out).

> frontend applications must call BlackJackToken.approve(<cage_address>, <bjt_amount>) on-behalf of the user before calling this function.

## BlackJack (core gameplay) Module

# BlackjackWithVRFv2

`BlackjackWithVRFv2` is a blockchain-based blackjack game implemented in Solidity, using Chainlink's VRF (Verifiable Random Function) for random number generation. This project integrates the use of a custom token, BlackJackToken (BJT), for betting and payouts.

## Features

- Implementing blackjack game rules including split, hit, stand, and dealer play.
- Integration with Chainlink VRF for fair random number generation.
- Support for multiple hands and players.
- Utilizes BJT tokens for betting and rewards.

## Setup Instructions

### Prerequisites

- [MetaMask](https://metamask.io) installed and set up in your browser.
- Access to a testnet (like sepoliaETH) with test ETH and [LINK tokens](https://faucets.chain.link/sepolia).
- [Remix IDE](http://remix.ethereum.org) for deploying and interacting with smart contracts.

### Using Remix with MetaMask

1. **Open Remix IDE**
   Go to [Remix IDE](http://remix.ethereum.org) in your web browser.

2. **Load Your Contract**
   In Remix, create a new file and paste your smart contract code into it.

3. **Compile the Contract**
   - Go to the Solidity compiler tab in Remix.
   - Select the correct compiler version (^0.8.20).
   - Click on "Compile".

4. **Deploy the Contract**
   - Switch to the "Deploy & Run Transactions" tab.
   - Connect to your MetaMask wallet.
   - Select the appropriate testnet where you have test ETH.
   - Deploy the contract by clicking on "Deploy".

### Configuring the Blackjack Contract

1. **BJT Token Address**
   Deploy the `BJT` token contract first and copy its deployed address.

2. **Chainlink VRF Subscription**
   Ensure you have a Chainlink VRF subscription ID ready (e.g., `6941`).

3. **Initialize the Blackjack Contract**
   Once the Blackjack contract is deployed, call its constructor or an initialization function with the BJT token address and Chainlink VRF subscription ID.

### Interaction with the Contract

Use Remix's deployed contract interface to interact with your contract's functions:

- `placeBet`: To place a bet.
- `hit`: To draw another card.
- `stand`: To stand on the current hand.
- `split`: To split the hand, if applicable.

### Public View Functions

These functions can be used to check the current game status:

- `getGameState`: Returns the current state of the game.
- `getGameRequest`: Returns details of a specific game request.
- `getPlayerCards`: Returns the player's cards.
- `getDealerCards`: Returns the dealer's cards.
- `getGameHistory`: Returns the game history for a specific player.



## AI Module

TBD
