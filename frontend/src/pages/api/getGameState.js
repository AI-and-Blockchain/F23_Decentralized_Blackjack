import gameABI from './gameABI.json'

import { ethers } from 'ethers';


export default async function handler(req, res) {
    try {
        let provider;
        try {
            provider = new ethers.providers.JsonRpcProvider("https://ethereum-sepolia.publicnode.com");
            // Additional code to test the connection, like getting the latest block number
        } catch (error) {
            console.error("Error connecting to Sepolia RPC:", error);
            res.status(500).json({ success: false, error: error.message });
            return;
        }

        // Contract Information
        const contractAddress = "0x2C389764F41b03e35bCbC1Bb5E6D5Ef74df4084d";

        // // Create a contract instance
        const contract = new ethers.Contract(contractAddress, gameABI, provider);

        // // Call the verifyAge function from your contract
        console.log("GameState request");
        console.log(String(req.body.requestId));
        const requestIdBigNumber = ethers.BigNumber.from(req.body.requestId[req.body.requestId.length-1]);
        const response = await contract.getGameState(requestIdBigNumber);
        // Send back the response
        res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
}