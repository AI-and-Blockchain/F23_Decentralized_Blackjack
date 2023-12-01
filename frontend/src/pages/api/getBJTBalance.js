import contractABI from './bjtABI.json'

import { ethers } from 'ethers';


export default async function handler(req, res) {
  //console.log(req);
  try {
    // try {
      let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
      // Additional code to test the connection, like getting the latest block number
    } catch (error) {
      console.error("Error connecting to Sepolia RPC:", error);
      res.status(500).json({ success: false, error: error.message });
      return;
    }

    // Contract Information
    const contractAddress = "0x6AF1a909Fdc2BbEdF8727D7482fa66607f6F464B";

    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Call the verifyAge function from your contract
    const response = await contract.balanceOf(req.body.account);
    //let response = "wahoo";
    // Send back the response
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}