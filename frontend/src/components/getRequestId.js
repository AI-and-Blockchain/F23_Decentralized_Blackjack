import { ethers } from 'ethers';
import gameABI from './../pages/api/gameABI.json';

export async function getRequestId(){
    const contractAddressGame = "0xda7a42dE9a58EDa74DCa4366b951786dd675bBd4";
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddressGame, gameABI, signer);

        const response = await contract.lastRequestId();
        console.log('Response from contract:', response);
        console.log(response.hex)
        return response.toString()
    } catch (error) {
        console.error('Error:', error);
    }
}
