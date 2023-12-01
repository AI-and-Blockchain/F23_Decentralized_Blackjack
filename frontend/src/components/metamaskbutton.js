import { createContext, useState } from 'react';
import { ethers } from 'ethers';
import nextConnect from 'next-connect';

import { useAuth } from './authprovider';
import Button from '@mui/material/Button';
import { checkBalance } from './checkBalance';
import { checkGameHistory } from './checkGameHistory';
import gameABI from './../pages/api/gameABI.json';
import requestIdsForUser from './../pages/api/requestIdsForUser';

const MetaMaskButton = () => {
  const { userAddress, signIn,
    betAmount, setBetAmount,
    updateChainId, awaitingContract,
    setGameState, setAwaitingContract,
    checkingVerified, setCheckingVerified,
    verified, setVerified, setUserBalance,
    requestId, setRequestId,
    dealerCardsTemp, setDealerCardsTemp,
    playerCardsTemp, setPlayerCardsTemp } = useAuth();

  const desiredChainId = '0xAA36A7';
  const verifyAddr = '0xB04bB44A685589EcCbC3Fc3215d4BD5F924c8dFe';
  const authContract = '0x13Be49565C126AD6aFe76dBd22b2Aa75670240C0';

  const addSepoliaChain = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xAA36A7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            iconUrls: ['<URL_to_Sepolia_icon>']
          }],
        });
        console.log('Sepolia testnet added to the wallet!');
        return true;
      } catch (error) {
        console.error('Error adding Sepolia testnet:', error);
        alert('Error adding Sepolia testnet: ' + error.message);
        return false;
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
      return false;
    }
  }

  const checkAndSwitchNetwork = async (addr) => {
    let success = true;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== desiredChainId) {

        success = await addSepoliaChain();

      }
      if (success) {
        signIn(addr);
        updateChainId(desiredChainId);
      }

    } catch (error) {
      console.log('Error switching network:', error);
      // Handle errors, e.g., user denied the request
    }

  };

  async function checkVerified(accountVal) {
    try {
      const response = await fetch('/api/checkVerified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: accountVal })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log('Response from contract:', result.data);
        return result.data;
      } else {
        console.error('Error in contract call:', result.error);
      }
    } catch (error) {
      console.error('Error calling the smart contract:', error);
    }
  }

  async function checkGameState(requestId) {
    try {
      const response = await fetch('/api/getGameState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: requestId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log('Response from contract:', result.data);
        return result.data;
      } else {
        console.error('Error in contract call:', result.error);
      }
    } catch (error) {
      console.error('Error calling the smart contract:', error);
    }
  }


  async function getRequestId(account) {
    try {
      const response = await fetch('/api/requestIdsForUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: account })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log('Response from contract:', result.data);
        return result.data;
      } else {
        console.error('Error in contract call:', result.error);
      }
    } catch (error) {
      console.error('Error calling the smart contract:', error);
    }
  }

  function hexArrayToIntArray(array) {
    return array.map(item => parseInt(item.hex, 16));
  }

  async function signInWithMetaMask() {
    setAwaitingContract(true);
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access if needed
        const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await checkAndSwitchNetwork(address);
        setCheckingVerified(true);
        let verifiedData = await checkVerified(address);
        let balance = await checkBalance(address);
        console.log(verifiedData);
        setVerified(verifiedData);
        console.log(balance);
        if (verifiedData) {
          console.log("User is verified, fetching the game state");
          let reqId = await getRequestId(address);

          //console.log("Request Id: ", reqId);
          if(reqId.length!=0){
            console.log("Last Request Id: ", reqId[reqId.length - 1]);
          
            setRequestId(reqId[reqId.length - 1].hex);
            const gameState = await checkGameState(reqId);
            console.log("Game State:");
            console.log(JSON.stringify(gameState));
            if (gameState) {
              console.log(gameState[2][0]);
              if (gameState[2][0] == "Game in progress" || gameState[2][0] == "Player bust") {
                setGameState(true);
                console.log(gameState[3][0]);
                console.log("Bet Amount:", parseInt(gameState[3][0].hex, 16));
                setBetAmount(parseInt(gameState[3][0].hex, 16));
                console.log(gameState[0][0]);
                console.log(hexArrayToIntArray(gameState[0]));
                console.log(gameState[1]);
                console.log(hexArrayToIntArray(gameState[1]));
                let dealerHand = hexArrayToIntArray(gameState[1]);
                if (dealerHand.length == 1) {
                  dealerHand.push(-1);
                }
                setPlayerCardsTemp(hexArrayToIntArray(gameState[0][0]));
                setDealerCardsTemp(dealerHand);
              }
            }
          }
        }
        setUserBalance(parseInt(balance.hex, 16));
      } catch (error) {
        console.error('Error signing in with MetaMask', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
    setAwaitingContract(false);
    setCheckingVerified(false);
  }

  return (
    <div>
      <Button variant="contained" onClick={signInWithMetaMask}>Sign in with MetaMask</Button>
      {userAddress && <p>Address: {userAddress}</p>}
    </div>
  );
}

export default MetaMaskButton;