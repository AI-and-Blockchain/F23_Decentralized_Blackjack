import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import contractABI from './../pages/api/setVerifiedABI.json';
import cageABI from './../pages/api/cageABI.json';
import bjtABI from './../pages/api/bjtABI.json';
import gameABI from './../pages/api/gameABI.json';

import { checkBalance } from './checkBalance';
import { ethers } from 'ethers';

import { styled } from '@mui/material/styles';
import NumberInputBasic from './numberinput';
import Divider from '@mui/material/Divider';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import gameHistoryData from './gamestate.json';
import { checkGameHistory } from './checkGameHistory';
import { useAuth } from './authprovider';
import { useState, useEffect } from 'react';
import { getRequestId } from './getRequestId';
import { mapOutcome } from './outcomeMapper';

const GameComponent = () => {

    const { gameInProgress, gameState, setGameState,
        userAddress, betAmount,
        setBetAmount, gameOutcome,
        updateGameOutcome,
        awaitingContract, setAwaitingContract,
        verified, setVerified,
        checkingVerified,
        userBalance, setUserBalance,
        requestId, setRequestId,
        dealerCardsTemp, setDealerCardsTemp,
        playerCardsTemp, setPlayerCardsTemp,
        gameOutcomeTemp, setGameOutcomeTemp,
        payoutAmount, setPayoutAmount,
        setAwaitingContractMessage, awaitingContractMessage,
        gameHist, setGameHist,
        playingWithAI, setPlayingWithAI,
        recommendation, setRecommendation
    } = useAuth();

    const [hasStood, setHasStood] = useState(false);
    const [playerStatus, setPlayerStatus] = useState("");
    const [dealerStatus, setDealerStatus] = useState("");
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');
    const [age, setAge] = useState(null);
    const [buyingBJT, setBuyingBJT] = useState(1);
    const [sellingBJT, setSellingBJT] = useState(0);
    const [dealerCards, setDealerCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [canInsure, setCanInsure] = useState([]);
    const contractAddressGame = "0x2C389764F41b03e35bCbC1Bb5E6D5Ef74df4084d";

    const calculateAge = () => {
        if (!year || !month || !day) return;
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        setAge(age);
    };

    const handleMonthChange = (event) => {
        setMonth(event.target.value)
        calculateAge()
    }
    const handleDayChange = (event) => {
        setDay(event.target.value)
        calculateAge()
    };
    const handleYearChange = (event) => {
        setYear(event.target.value)
    };

    useEffect(() => {
        calculateAge();
    }, [year, month, day])


    const containerStyle = {
        width: '100%',
        height: 'auto',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        // marginTop: '3%',
        // marginLeft: '3%'
    };

    const getCardStyle = (index, isAnimating) => ({
        width: 'auto',
        height: '90%',
        position: 'absolute',
        marginLeft: '3%',
        marginTop: '1.5%',
        left: `${index * 80}px`, // adjust the px to increase/decrease overlap
        top: 0,
        zIndex: index,
        transition: 'transform 1s ease', // Animation duration
        transform: isAnimating ? 'translateX(150%)' : 'translateX(0)', // Animate from right to left,

    });

    const playTextStyle = {
        fontFamily: 'Agbalumo',
        color: '#dfe4dc'
    };

    const titleStyle = {
        fontFamily: 'Agbalumo',
        color: '#fdd7a6'
    }

    const outcomeStyle = {
        fontFamily: 'Agbalumo',
    }

    const PlayerOverlay = styled('div')({
        display: playerStatus ? 'flex' : 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
        fontFamily: 'Agbalumo',
        color: '#fdd7a6',
        fontSize: '3em',
        zIndex: 1200
    });

    const DealerOverlay = styled('div')({
        display: dealerStatus ? 'flex' : 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
        fontFamily: 'Agbalumo',
        color: '#fdd7a6',
        fontSize: '3em',
        zIndex: 1200
    });

    const hRule = {
        width: '90%',
        height: '2px',
        background: 'rgb(39,47,77)',
        background: 'linear-gradient(90deg, rgba(39,47,77,1) 0%, rgba(255,215,182,1) 45%, rgba(251,212,180,1) 55%, rgba(39,47,77,1) 100%)'
    }

    const playField = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: "90%",
        height: '500px',
        background: "#eeeeee",
        background: 'rgb(33,81,93)',
        background: 'radial-gradient(ellipse at center bottom, rgba(33,81,93,1) 0%, rgba(120,153,160,1) 100%)',
        borderStyle: 'solid',
        borderWidth: 'thin',
        borderRadius: '10px',
        borderColor: '#354158',

    };

    const ActionButton = styled(Button)({
        // background: 'rgb(223,227,223)',
        // background: 'linear-gradient(0deg, rgba(223,227,223,1) 0%, rgba(252,254,236,1) 100%)',
        //color: '#ffffff',
        marginLeft: '5px',
        marginRight: '5px'
    });


    // const SurrenderButton = styled(Button)({
    //     background: '#ff7961',
    //     //background: 'linear-gradient(0deg, rgba(196,34,3,1) 0%, rgba(255,215,182,1) 100%)',
    //     color: '#000000',
    //     marginLeft: '5px',
    //     marginRight: '5px',
    //     disabled: awaitingContract ? 'true' : 'false'
    // });

    function generateCardSets(hand) {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const faceCardValues = { 11: 'Jack', 12: 'Queen', 13: 'King' };

        let usedCombinations = new Set(); // Track used combinations

        // Function to generate a unique combination for a card
        function generateUniqueCombination(card) {
            let shuffledSuits = suits.sort(() => Math.random() - 0.5);
            if (card == -1 || card == 0) {
                return 'Hidden';
            }

            if (card === 1) {
                for (let suit of shuffledSuits) {
                    let combination = `Ace of ${suit}`;
                    if (!usedCombinations.has(combination)) {
                        usedCombinations.add(combination);
                        return combination;
                    }
                }
            }

            for (let suit of shuffledSuits) {
                let cardLabel = card;
                // Check if the card is a face card and replace the number with the corresponding face
                if (faceCardValues[card]) {
                    cardLabel = faceCardValues[card];
                }
                let combination = `${cardLabel} of ${suit}`;

                if (!usedCombinations.has(combination)) {
                    usedCombinations.add(combination);
                    return combination;
                }
            }

            return null;
        }

        return hand.map(generateUniqueCombination).filter(Boolean);
    }


    const [dealerValue, setDealerValue] = useState(0);
    const [playerValue, setPlayerValue] = useState(0);

    const addCardsToPlayer = async (cardNames) => {
        let updatedPlayerCards = [...playerCards];

        for (let i = 0; i < cardNames.length; i++) {
            const cardName = cardNames[i];
            const imageName = cardName.toLowerCase().replace(/\s+/g, '_') + '.png';

            const newCard = {
                img: `/images/cards/${imageName}`,
                title: cardName,
                animating: true
            };

            setPlayerCards(prevPlayerCards => [...prevPlayerCards, newCard]);
            updatedPlayerCards.push(newCard);
            const cardTitles = [...playerCards, newCard].map(card => card.title);

            setAwaitingContract(true);

            // Wait for the animation to finish before continuing
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second for each card's animation

            setPlayerCards(prevPlayerCards => prevPlayerCards.map((card, index) =>
                index === prevPlayerCards.length - 1 ? { ...card, animating: false } : card
            ));
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
        const playerVal = calculateHandValue(updatedPlayerCards);
        if (playerVal > 21) {
            if (!gameOutcomeTemp) {
                setPlayerStatus("Bust");
                setAwaitingContract(true);
                setGameOutcomeTemp("Player Bust");
                setRecommendation("");
                setAwaitingContract(false);
                setAwaitingContractMessage("Awaiting Contract Response...");

            }
        }
        return updatedPlayerCards;
    };

    const addCardsToDealer = async (cardNames) => {
        let updatedDealerCards = [...dealerCards];
        for (let i = 0; i < cardNames.length; i++) {
            const cardName = cardNames[i];
            const imageName = cardName.toLowerCase().replace(/\s+/g, '_') + '.png';

            const newCard = {
                img: `/images/cards/${imageName}`,
                title: cardName,
                animating: true
            };

            setDealerCards(prevDealerCards => [...prevDealerCards, newCard]);
            updatedDealerCards.push(newCard);
            const cardTitles = [...dealerCards, newCard].map(card => card.title);

            setAwaitingContract(true);

            await new Promise(resolve => setTimeout(resolve, 500));

            setDealerCards(prevDealerCards => {

                let filteredCards;
                if (dealerCards.length == 2 && dealerCards[0] != 0) {
                    filteredCards = prevDealerCards.filter(card => card.title !== "Hidden");
                } else {
                    filteredCards = prevDealerCards;
                    if (dealerCards[0]==1 && dealerCards.length == 2){
                        setCanInsure(true);
                    } else {
                        setCanInsure(false);
                    }
                }
                return filteredCards.map((card, index) =>
                    index === filteredCards.length - 1 ? { ...card, animating: false } : card
                );
            });

        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
        const dealerVal = calculateHandValue(updatedDealerCards);
        setDealerValue(dealerVal);
        if (dealerVal > 21) {
            setDealerStatus("Bust");
        }
        return updatedDealerCards;
    };

    // Runs when loading a new game
    useEffect(() => {
        const getValue = async () => {
            console.log(dealerCardsTemp);
            const newPlayerCards = await addCardsToPlayer(generateCardSets(playerCardsTemp));
            const newDealerCards = await addCardsToDealer(generateCardSets(dealerCardsTemp));

            
            setPlayerValue(calculateHandValue(newPlayerCards));
            setDealerValue(calculateHandValue(newDealerCards));
            if(calculateHandValue(newPlayerCards) == 21){
                setGameOutcomeTemp("Player Blackjack");
                setRecommendation("");
            }
        }
        const checkAi = async() => {
            await getAiRecommendation();
        }
        if (gameInProgress && playerCardsTemp.length != 0) {

            
            if (playerCardsTemp) {
                getValue();
                setPlayerCardsTemp([]);
                setDealerCardsTemp([]);
                checkAi();
            }
        }

    }, [playerCardsTemp, dealerCardsTemp])


    const calculateHandValue = (hand) => {
        let totalValue = 0;
        let aceCount = 0;

        hand.forEach(card => {
            const cardName = card.title.split(" ")[0];
            if (!isNaN(cardName)) {
                // If the card is a number card, its value is the number itself
                totalValue += parseInt(cardName, 10);
            } else if (["King", "Queen", "Jack"].includes(cardName)) {
                // Face cards are worth 10
                totalValue += 10;
            } else if (cardName === "Ace") {
                // Count aces separately
                aceCount += 1;
            }
        });

        // Calculate the best value for aces (1 or 11)
        for (let i = 0; i < aceCount; i++) {
            if (totalValue + 11 <= 21) {
                totalValue += 11;
            } else {
                totalValue += 1;
            }
        }

        return totalValue;
    }


    const clearHistory = () => {
        setDealerStatus("")
        setPlayerStatus("")
        setDealerCards([])
        setPlayerCards([])
        setDealerValue(0);
        setPlayerValue(0);
    }

    function hexArrayToIntArray(array) {
        return array.map(item => parseInt(item.hex, 16));
    }

    async function getAiRecommendation(){
        if (playingWithAI){
            try {
                const response = await fetch('https://72fd-2603-7081-4e05-2cc4-00-1005.ngrok.io/get_optimal_action', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const result = await response.json();
                console.log(result);
                if (result) {
                    console.log('Response ai:', result);
                    setRecommendation(result.optimal_action);
                    console.log(result.optimal_action);
                } else {
                    console.error('Error in ai call:', result.error);
                }
            } catch (error) {
                console.error('Error calling the smart contract:', error);
            }
        } else {
            console.log("Not playing with ai");
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

    async function hit() {
        console.log("Hitting");
        setRecommendation("");
        setAwaitingContract(true);
        if (!requestId) {
            console.log("Invalid Request Id");
            return;
        }
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddressGame, gameABI, signer);
            setAwaitingContractMessage("Drawing New Card...");
            const response = await contract.hit(requestId, 0);
            const receipt = await response.wait();


            const gameState = await checkGameState([requestId]);
            console.log(JSON.stringify(gameState));
            if (gameState) {
                const playerHand = gameState[0][0];

                const newCard = await addCardsToPlayer(generateCardSets(hexArrayToIntArray([playerHand[playerHand.length - 1]])));

                setBetAmount(parseInt(gameState[3][0].hex, 16));
                setPlayerValue(calculateHandValue(newCard));

                if (calculateHandValue(newCard) == 21) {

                    stand();
                    setPlayingWithAI(false);
                } else {
                    if (playingWithAI){
                        await getAiRecommendation(); 
                    }
                }

            }
        } catch (error) {
            console.error('Error:', error);
        }

        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
    }

    async function stand() {
        console.log("Standing");
        setAwaitingContract(true);
        setPlayerStatus("Stand");
        if (!requestId) {
            console.log("Invalid Request Id");
            return;
        }
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddressGame, gameABI, signer);
            const response = await contract.stand(requestId, 0);

            const receipt = await response.wait();

            const gameState = await checkGameState([requestId]);

            const dealerHandFirstCard = gameState[1].shift();
            const newDealerCards = await addCardsToDealer(generateCardSets(hexArrayToIntArray(gameState[1])));
            const gameHist = await checkGameHistory(userAddress);
            setGameHist(JSON.stringify(gameHist));
            const lastGame = JSON.parse(gameHist[gameHist.length - 1]);
            const gameOutcome = lastGame.outcome.status;
            setGameOutcomeTemp(mapOutcome(gameOutcome));
            setRecommendation("");
            setPayoutAmount(lastGame.outcome.payout);
            setUserBalance(userBalance + lastGame.outcome.payout);

        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
    }


    async function enterAge() {
        const contractAddress = "0xB04bB44A685589EcCbC3Fc3215d4BD5F924c8dFe";
        setAwaitingContract(true);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const response = await contract.verifyAge(age);
            setVerified(response);
            if(response==false){
                alert("Could not verify. User must be 21 years or older, and cannot be banned");
            } else {
                const gameHist = await(checkGameHistory(userAddress));
                setGameHist(JSON.stringify(gameHist));
                const balance = await checkBalance(userAddress);
                setUserBalance(parseInt(balance.hex, 16));
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");

    }


    async function buyBJT() {
        const contractAddress = "0xeD6a34A78bdEb71E33D9cD829917d34BF318C90a";
        setAwaitingContract(true);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, cageABI, signer);

            let amountInWei = String(buyingBJT);
            setAwaitingContractMessage("Exchanging ETH for BJT...");
            const response = await contract.exchangeETHforBJT({ value: amountInWei });
            await response.wait();
            const balance = await checkBalance(userAddress);

            setUserBalance(parseInt(balance.hex, 16));
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
    }


    async function sellBJT() {
        const contractAddressCage = "0xeD6a34A78bdEb71E33D9cD829917d34BF318C90a";
        const contractAddressBJT = "0x6AF1a909Fdc2BbEdF8727D7482fa66607f6F464B";
        setAwaitingContract(true);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddressCage, cageABI, signer);

            const contractBJT = new ethers.Contract(contractAddressBJT, bjtABI, signer);

            setAwaitingContractMessage("Waiting For Allowance Permissions...");
            const allowance = await contractBJT.approve(contractAddressCage, sellingBJT);
            await allowance.wait();
            setAwaitingContractMessage("Exchanging BJT for ETH...");
            const response = await contract.exchangeBJTforETH(userAddress, sellingBJT);
            await response.wait();
            const balance = await checkBalance(userAddress);
            setUserBalance(parseInt(balance.hex, 16));
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");

    }


    async function checkAndProcessGameState(reqId) {
        const gameState = await checkGameState(reqId);
        let playerHand = hexArrayToIntArray(gameState[0][0]);
    
        // Check if player's hand is [0,0]
        if (playerHand.length === 2 && playerHand[0] === 0 && playerHand[1] === 0) {
            console.log("Player's hand is [0,0], waiting for 10 seconds...");
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
            return checkAndProcessGameState(reqId); // Call the function again
        }
    
        setGameState(true);
        setBetAmount(parseInt(gameState[3][0].hex, 16));

        let dealerHand = hexArrayToIntArray(gameState[1]);
        if (dealerHand.length == 1) {
            dealerHand.push(-1);
        }
        setPlayerCardsTemp(playerHand);
        setDealerCardsTemp(dealerHand);
        setUserBalance(userBalance - betAmount);
        setBetAmount(betAmount);
        setGameState(true);
    }

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

    async function insurance() {

        const contractAddressBJT = "0x6AF1a909Fdc2BbEdF8727D7482fa66607f6F464B";
        const contractAddressCage = "0xeD6a34A78bdEb71E33D9cD829917d34BF318C90a";

        setAwaitingContract(true);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            // Working as of 12:32pm nov 10
            const contract = new ethers.Contract(contractAddressGame, gameABI, signer);

            const contractBJT = new ethers.Contract(contractAddressBJT, bjtABI, signer);

            const response = await contract.takeInsurance(requestId);

            await response.wait();

            console.log('Response from contract:', response);
            
            await checkAndProcessGameState(reqId);
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
    }


    async function surrender() {
        console.log("Surrendering");
        setAwaitingContract(true);
        if (!requestId) {
            console.log("Invalid Request Id");
            return;
        }
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddressGame, gameABI, signer);
            const response = await contract.surrender(requestId);
            setGameOutcomeTemp("Surrender");
            setRecommendation("");
            setUserBalance(userBalance + Math.floor(betAmount/2));
            const gameHist = await checkGameHistory(userAddress);
            setGameHist(JSON.stringify(gameHist));
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
        setPlayingWithAI(false);
    }

    async function placeBet() {
        const contractAddressBJT = "0x6AF1a909Fdc2BbEdF8727D7482fa66607f6F464B";
        const contractAddressCage = "0xeD6a34A78bdEb71E33D9cD829917d34BF318C90a";

        setAwaitingContract(true);
        setPlayingWithAI(false);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            let verifiedData = await checkVerified(userAddress);
            if (!verifiedData){
                alert("User is no longer verified");
                return;
            }
            // Working as of 12:32pm nov 10
            const contract = new ethers.Contract(contractAddressGame, gameABI, signer);

            const contractBJT = new ethers.Contract(contractAddressBJT, bjtABI, signer);
            setAwaitingContractMessage("Waiting For Allowance Permissions...");
            const allowance = await contractBJT.approve(contractAddressGame, sellingBJT);
            await allowance.wait();

            setAwaitingContractMessage("Placing Bet...");
            const response = await contract.placeBet(betAmount);

            await response.wait();

            console.log('Response from contract:', response);
            setAwaitingContractMessage("Getting Random Seed (1/2)...");
            let reqId = await getRequestId(userAddress);

            console.log("Request Id: ", reqId);
            console.log("Last Request Id: ", reqId[reqId.length - 1]);

            setRequestId(reqId[reqId.length - 1].hex);
            // console.log(parseInt(balance.hex, 16));
            setAwaitingContractMessage("Getting Random Seed (2/2)...");
            await checkAndProcessGameState(reqId);
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
    }

    async function placeBetZero() {
        const contractAddressBJT = "0x6AF1a909Fdc2BbEdF8727D7482fa66607f6F464B";
        const contractAddressCage = "0xeD6a34A78bdEb71E33D9cD829917d34BF318C90a";
        setRecommendation("");
        setAwaitingContract(true);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            // Working as of 12:32pm nov 10
            const contract = new ethers.Contract(contractAddressGame, gameABI, signer);

            const contractBJT = new ethers.Contract(contractAddressBJT, bjtABI, signer);
            // setAwaitingContractMessage("Waiting For Allowance Permissions...");
            // const allowance = await contractBJT.approve(contractAddressGame, sellingBJT);
            // await allowance.wait();

            // setAwaitingContractMessage("Placing Bet...");
            const response = await contract.placeBet(0);

            await response.wait();

            console.log('Response from contract:', response);
            setAwaitingContractMessage("Getting Random Seed (1/2)...");
            let reqId = await getRequestId(userAddress);

            console.log("Request Id: ", reqId);
            console.log("Last Request Id: ", reqId[reqId.length - 1]);

            setRequestId(reqId[reqId.length - 1].hex);
            // console.log(parseInt(balance.hex, 16));
            setAwaitingContractMessage("Getting Random Seed (2/2)...");
            setPlayingWithAI(true);
            await checkAndProcessGameState(reqId);
            await getAiRecommendation();
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
        setAwaitingContractMessage("Awaiting Contract Response...");
    }

    return (
        <Paper sx={{
            display: 'flex', flexDirection: 'column', width: '50%', height: '90%', alignItems: 'center', mt: 5, background: 'rgb(4,83,102)',
            background: 'radial-gradient(ellipse at center top, rgba(4,83,102,1) 0%, rgba(1,48,68,1) 50%)',
            borderStyle: 'solid',
            borderWidth: 'thin',
            borderRadius: '10px',
            borderColor: '#354158'
        }} >
            {gameInProgress && userAddress ? (
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '40%', width: '100%', alignItems: 'center' }}>
                        <Typography variant="h2" style={playTextStyle} sx={{ mb: 1 }}>Dealer Hand</Typography>
                        <Box style={playField}>
                            <Box style={containerStyle}>
                                {dealerCards.map((card, index) => (
                                    <img
                                        key={card.img + index} // assuming each card image is unique
                                        src={card.img}
                                        alt={card.title}
                                        style={getCardStyle(index, card.animating)}
                                        title={card.title} // added title attribute for accessibility
                                    />
                                ))}
                                <DealerOverlay>{dealerStatus}</DealerOverlay> { }
                            </Box>
                        </Box>
                        <Typography variant="h4" style={playTextStyle}>Dealer Score: {dealerValue}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '40%', width: '100%', alignItems: 'center', mt: 5 }}>
                        <Typography variant="h2" style={playTextStyle} sx={{ mb: 1 }}>My Hand</Typography>
                        <Box style={playField}>
                            <Box style={containerStyle}>
                                {playerCards.map((card, index) => (
                                    <img
                                        key={index} // assuming each card image is unique
                                        src={card.img}
                                        alt={card.title}
                                        style={getCardStyle(index, card.animating)}
                                        title={card.title} // added title attribute for accessibility
                                    />
                                ))}
                                <PlayerOverlay>{playerStatus}</PlayerOverlay> { }
                            </Box>
                        </Box>
                        <Typography variant="h4" style={playTextStyle}>My Score: {playerValue}</Typography>
                    </Box>
                    {gameOutcomeTemp ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                            <ActionButton variant="outlined" onClick={() => updateGameOutcome(gameOutcomeTemp)}>Continue</ActionButton>
                        </Box> :
                        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' || playerStatus == 'Stand' ? true : false} onClick={() => hit()}>Hit</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' || playerStatus == 'Stand' ? true : false} onClick={() => {
                                stand();
                            }}>Stand</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' || playerStatus == 'Stand' || !canInsure ? true : false} onClick={()=>insurance()}>Insurance</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' || playerStatus == 'Stand' ? true : false} color="error" onClick={() => {
                                surrender()
                            }}>Surrender</ActionButton>
                        </Box>}

                </>
            ) : gameOutcome ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '80%', width: '100%', alignItems: 'center' }}>
                    <Typography variant="h2" style={titleStyle}>Decentralized Blackjack</Typography>
                    {gameOutcome == "Surrender" || gameOutcome == "Player Bust" || gameOutcome == "Dealer Win" || gameOutcome == "Dealer Blackjack" ?
                        (<Typography variant="h2" style={outcomeStyle} sx={{ mt: 3, color: '#ff7961' }}>{gameOutcome}</Typography>)
                        : (gameOutcome == "Player Win") || gameOutcome == "Player Blackjack" ? <>
                            <Typography variant="h2" style={outcomeStyle} sx={{ mt: 3, color: '#4caf50' }}>{gameOutcome}</Typography>
                        </> : gameOutcome == "Tie Game" ? <>
                            <Typography variant="h2" style={outcomeStyle} sx={{ mt: 3 }}>{gameOutcome}</Typography></> :
                            <>
                                <Typography variant="h2" style={outcomeStyle} sx={{ mt: 3, color: '#fdd7a6' }}>{gameOutcome}</Typography>
                            </>}
                    <Typography variant="h4" style={playTextStyle} sx={{ mt: 3 }}>Bet: {betAmount} BJT</Typography>
                    <Typography variant="h4" style={playTextStyle} sx={{ mt: 3, mb: 3 }}>Payout: {payoutAmount} BJT</Typography>
                    <ActionButton variant="outlined" onClick={() => {
                        clearHistory()
                        updateGameOutcome("")
                        setGameOutcomeTemp("")
                        setPayoutAmount(0);
                        setAwaitingContract(false)
                        setAwaitingContractMessage("Awaiting Contract Response...")
                        setRecommendation("");
                    }}>Return Home</ActionButton>
                </Box>
            ) :
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'center' }}>
                        <Typography variant="h2" style={titleStyle}>Decentralized Blackjack</Typography>
                        <Box style={hRule} sx={{ mt: 2 }}></Box>

                        {userAddress && verified ? (<>
                            <Typography variant="h3" style={playTextStyle} sx={{ mt: 5 }}>Start Game</Typography>
                            <Typography variant="h4" style={playTextStyle} sx={{ mt: 3, mb: 2 }}>Bet Amount: </Typography>
                            <NumberInputBasic
                                aria-label="Bet amount"
                                placeholder="Enter bet"
                                value={betAmount}
                                maxVal={userBalance}
                                onChange={(event, val) => setBetAmount(val)}
                            />

                            <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                                <ActionButton variant="outlined" onClick={() => placeBet()} disabled={awaitingContract ? true : false}>Play Blackjack</ActionButton>
                                <ActionButton variant="outlined" disabled={betAmount == 0 && !awaitingContract ? false : true} onClick={() => placeBetZero()} >Play With AI Assistance</ActionButton>
                            </Box>
                            <Typography variant="h3" style={playTextStyle} sx={{ mt: 5, mb: 3 }}>Exchange Blackjack Token (BJT)</Typography>
                            <Box sx={{ display: 'flex' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 3 }}>
                                    <Typography variant="h5" style={playTextStyle} sx={{ mb: 2 }}>Buy</Typography>
                                    <NumberInputBasic
                                        aria-label="Purchase BJT"
                                        placeholder="Enter Amount"
                                        value={buyingBJT}
                                        maxVal={50000}
                                        onChange={(event, val) => setBuyingBJT(val)}
                                    />
                                    <Typography variant="h5" style={playTextStyle} sx={{ mt: 2, }}>{buyingBJT} BJT = {buyingBJT} WEI</Typography>

                                    <ActionButton variant="outlined" sx={{ mt: 3 }} onClick={() => buyBJT()} disabled={awaitingContract || buyingBJT == 0 ? true : false}>Purchase</ActionButton>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 3 }}>
                                    <Typography variant="h5" style={playTextStyle} sx={{ mb: 2 }}>Sell</Typography>

                                    <NumberInputBasic
                                        aria-label="Exchange BJT"
                                        placeholder="Enter Amount"
                                        value={sellingBJT}
                                        maxVal={userBalance}
                                        onChange={(event, val) => setSellingBJT(val)}
                                    />
                                    <Typography variant="h5" style={playTextStyle} sx={{ mt: 2, }}>{sellingBJT} BJT = {sellingBJT} WEI</Typography>

                                    <ActionButton variant="outlined" sx={{ mt: 3 }} onClick={() => sellBJT()} disabled={awaitingContract || sellingBJT == 0 ? true : false}>Sell</ActionButton>
                                </Box>
                            </Box>


                        </>) : userAddress && !verified ? (checkingVerified ? <>
                            <Typography variant="h4" style={playTextStyle} sx={{ mt: 3 }}>Checking Verification Status...</Typography>
                            <Typography variant="h6" style={playTextStyle}>Awaiting Contract Response</Typography>
                            <Box sx={{ width: '90%', mt: 1 }}>
                                <LinearProgress />
                            </Box></> :
                            <>
                                <Typography variant="h4" style={playTextStyle} sx={{ mt: 3 }}>Please Enter Date of Birth:</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'row', width: "100%", justifyContent: "center", alignItems: 'center', mt: 2 }}>
                                    <FormControl variant="outlined" sx={{ width: "25%" }}>
                                        <InputLabel>Month</InputLabel>
                                        <Select label="Month" value={month} onChange={handleMonthChange}>
                                            {/* Generate Months */}
                                            {[...Array(12)].map((_, index) => (
                                                <MenuItem key={index + 1} value={index + 1}>
                                                    {index + 1}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl variant="outlined" sx={{ width: "25%" }}>
                                        <InputLabel>Day</InputLabel>
                                        <Select label="Day" value={day} onChange={handleDayChange}>
                                            {/* Generate Days */}
                                            {[...Array(31)].map((_, index) => (
                                                <MenuItem key={index + 1} value={index + 1}>
                                                    {index + 1}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl variant="outlined" sx={{ width: "25%" }}>
                                        <InputLabel>Year</InputLabel>
                                        <Select label="Year" value={year} onChange={handleYearChange}>
                                            {/* Generate Years */}
                                            {[...Array(70)].map((_, index) => {
                                                const year = new Date().getFullYear() - index;
                                                return (
                                                    <MenuItem key={year} value={year}>
                                                        {year}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <ActionButton variant="outlined" sx={{ mt: 2 }} disabled={age != null && age > 17 ? false : true} onClick={() => {
                                    enterAge()
                                }}>Submit</ActionButton>
                            </>) :
                            <Typography variant="h4" style={playTextStyle}>Please Sign In With Wallet</Typography>
                        }
                    </Box>
                </>
            }
        </Paper>
    );
}

export default GameComponent;