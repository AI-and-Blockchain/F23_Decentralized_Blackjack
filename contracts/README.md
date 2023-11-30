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


## Age Verifier Module

Verifies if user is over 21 years old and grant them authorization to play the game. 

**Public Functions**

```
verifyAge(uint8 age) public returns (bool)
```

User should call this address with their age as input to be verified. Returns if the user is verified or not.


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

see [setup](./setup/setup.md) for more info.


## AI Module

TBD
