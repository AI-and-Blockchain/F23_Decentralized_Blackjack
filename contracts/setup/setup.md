# Blackjack Smart Contract Guide

This guide provides step-by-step instructions on how to set up and play the Blackjack game using smart contracts on Remix.

## Setup

### Prerequisites

1. **Install Remix dGit Plugin**:
   - You can download the dGit plugin in Remix or manually add the contract to Remix.

### Contract Addresses

- **BJT Token**: `0x6AF1a909Fdc2BbEdF8727D7482fa66607f6F464B`
- **AGE Verify**: `0xB04bB44A685589EcCbC3Fc3215d4BD5F924c8dFe`
- **Auth Contract**: `0x13Be49565C126AD6aFe76dBd22b2Aa75670240C0`
- **Cage Contract**: `0xeD6a34A78bdEb71E33D9cD829917d34BF318C90a`
- **Blackjack Contract**: `0x2C389764F41b03e35bCbC1Bb5E6D5Ef74df4084d`

### Initial Setup

1. **Compile Contracts**:
   - Compile all contracts in Remix and change line 33 to your VRF subscription ID.

2. **Metamask Accounts**:
   - You will need two MetaMask accounts: one for the house and one for the player.

3. **Run `deploy.js`**:
   - Use the house account to run `deploy.js`. This script helps deploy Auth, BJT, Cage, and Blackjack contracts.

4. **Verify Player Account**:
   - With the player account, call `AgeVerifier.verifyAage(<age>)` to verify the player account. Only verified account will be able to interact with the gameplay contract.

6. **Deposit to Cage**:
   - The house needs to deposit money to the Cage. You can deposit, for example, 100 wei to ensure sufficient funds for swapping BJT tokens.

## Playing the Game

1. **Swap to Player Account**:
   - In MetaMask (icon at the top right corner), switch to the player's account. You can also use remix to switch but I think this is more convenient
   - ![](https://github.com/AI-and-Blockchain/F23_Decentralized_Blackjack/blob/main/media/account.png)

2. **Exchange BJT Token**:
   - Exchange ETH for BJT tokens. For instance, type 50 wei and press "Exchange ETH to BJT Token".

3. **Approve Blackjack Contract**:
   - Copy the Blackjack contract address.
   - Go to the BJT token contract and fill out the `approve` function.
   - In `spender`, enter the Blackjack contract address.
   - For `value`, enter any number below 50 or use `balanceOf` to check the player's BJT token amount.

4. **Start Playing**:
   - Use the `placeBet` function to place your bet, e.g., type 1.
   - Press `requestId` to check the game state. If the VRF is running, player and dealer cards will show as 0, 0.
   - Once there are random numbers, request the game state.
   - Choose to `hit`, `stand`, or `surrender`. Input the request ID and 0 (as split is not available).
   - ![](https://github.com/AI-and-Blockchain/F23_Decentralized_Blackjack/blob/main/media/gmaeplay-2.png)

5. **Dealer's Turn**:
   - If you press `stand`, the dealer will deal its own cards.
6. **Check History**:
   - Enter player's address to check history
   -  ![](https://github.com/AI-and-Blockchain/F23_Decentralized_Blackjack/blob/main/media/gameplay-1.png)

Note: 
1. Ensure you have enough ETH for gas fees and BJT tokens for betting.
2. Ensure you have 12 LINK or above in VRF subscription
