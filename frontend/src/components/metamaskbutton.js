import { createContext, useState } from 'react';
import { ethers } from 'ethers';
import { useAuth } from './authprovider';
import Button from '@mui/material/Button';


const MetaMaskButton = () => {
  const { userAddress, signIn, updateChainId } = useAuth();

  const desiredChainId = '0x89';


  const addMaticChain = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC', 
              decimals: 18,
            },
            rpcUrls: ['https://polygon-rpc.com/'], 
            blockExplorerUrls: ['https://polygonscan.com/'], 
            iconUrls: ['https://polygon.technology/media-kit/matic-token-icon.png']
          }],
        });
        console.log('Matic chain added to the wallet!');
        return true;
      } catch (error) {
        console.error('Error adding Matic chain:', error);
        alert('Error adding Matic chain: ' + error.message);
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
        
        success = await addMaticChain();
        
      }
      if (success){
        signIn(addr);
        updateChainId(desiredChainId);
      }
      
    } catch (error) {
      console.log('Error switching network:', error);
      // Handle errors, e.g., user denied the request
    }
    
  };

  async function signInWithMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access if needed
        const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await checkAndSwitchNetwork(address);
      } catch (error) {
        console.error('Error signing in with MetaMask', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  }

  return (
    <div>
      <Button variant="contained" onClick={signInWithMetaMask}>Sign in with MetaMask</Button>
      {userAddress && <p>Address: {userAddress}</p>}
    </div>
  );
}

export default MetaMaskButton;