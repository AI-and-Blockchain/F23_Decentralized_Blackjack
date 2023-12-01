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
        playerCardsTemp, setPlayerCardsTemp
    } = useAuth();

    const [hasStood, setHasStood] = useState(false);
    const [playerStatus, setPlayerStatus] = useState("");
    const [dealerStatus, setDealerStatus] = useState("");
    const [gameOutcomeTemp, setGameOutcomeTemp] = useState("");
    const [payoutAmount, setPayoutAmount] = useState(0);
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');
    const [age, setAge] = useState(null);
    const [buyingBJT, setBuyingBJT] = useState(1);
    const [sellingBJT, setSellingBJT] = useState(0);
    const [dealerCards, setDealerCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);

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
        const faceCards = ['Jack', 'Queen', 'King'];

        let usedCombinations = new Set(); // Track used combinations

        // Function to generate a unique combination for a card
        function generateUniqueCombination(card) {
            let shuffledSuits = suits.sort(() => Math.random() - 0.5);
            if (card == -1) {
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
                let cardLabel = card === 10 ? '10' : card;
                let combination = `${cardLabel} of ${suit}`;

                if (!usedCombinations.has(combination)) {
                    usedCombinations.add(combination);
                    return combination;
                }
            }

            // If 10, try Jack, Queen, King
            if (card === 10) {
                for (let face of faceCards) {
                    for (let suit of shuffledSuits) {
                        let combination = `${face} of ${suit}`;
                        if (!usedCombinations.has(combination)) {
                            usedCombinations.add(combination);
                            return combination;
                        }
                    }
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
        const playerVal = calculateHandValue(updatedPlayerCards);
        if (playerVal > 21) {
            setPlayerStatus("Bust");
        }
        return updatedPlayerCards;
    };

    const addCardsToDealer = async (cardNames) => {
        let updatedDealerCards = [...dealerCards];
        for (let i = 0; i < cardNames.length; i++) {
            const cardName = cardNames[i];
            const imageName = cardName.toLowerCase().replace(/\s+/g, '_') + '.png';

            if (cardName !== "Hidden" || updatedDealerCards.length == 1) {
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

                setDealerCards(prevDealerCards => prevDealerCards.map((card, index) =>
                    index === prevDealerCards.length - 1 ? { ...card, animating: false } : card
                ));
            }
        }
        setAwaitingContract(false);
        const dealerVal = calculateHandValue(updatedDealerCards);
        if (dealerVal > 21) {
            setDealerStatus("Bust");
        }
        return updatedDealerCards;
    };

    // Runs when loading a new game
    useEffect(() => {
        const getValue = async () => {
            const newPlayerCards = await addCardsToPlayer(generateCardSets(playerCardsTemp));
            const newDealerCards = await addCardsToDealer(generateCardSets(dealerCardsTemp));
            console.log(playerCardsTemp);
            console.log("New player + dealer cards");
            console.log(newPlayerCards);
            console.log(newDealerCards);
            setPlayerValue(calculateHandValue(newPlayerCards));
            setDealerValue(calculateHandValue(newDealerCards));
        }
        if (gameInProgress && playerCardsTemp.length != 0) {
            console.log("UseEffect");
            console.log("Player Cards");
            console.log(playerCardsTemp);
            console.log("Dealer Cards:");
            console.log(dealerCardsTemp);
            if (playerCardsTemp) {
                console.log(generateCardSets(playerCardsTemp))
                console.log(generateCardSets(dealerCardsTemp))
                getValue();
                setPlayerCardsTemp([]);
                setDealerCardsTemp([]);
            }
        }

    }, [playerCardsTemp, dealerCardsTemp])


    const convertCardName = (cardName) => {
        return cardName.toLowerCase().replace(/\s+/g, '_');
    }

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
        const contractAddressGame = "0xda7a42dE9a58EDa74DCa4366b951786dd675bBd4";
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
            console.log(requestId);
            const response = await contract.hit(requestId, 0);
            console.log('Response from contract:', response);

            const receipt = await response.wait();
            console.log("GC request id:");
            console.log(requestId);
            const gameState = await checkGameState([requestId]);
            console.log("Game State:");
            console.log(JSON.stringify(gameState));
            if (gameState) {
                const playerHand = gameState[0][0];
                console.log([playerHand[playerHand.length - 1]]);
                console.log("New Card: ");
                console.log("Generating card out of: ");
                console.log([playerHand[playerHand.length - 1]][0]);
                console.log(generateCardSets(hexArrayToIntArray([playerHand[playerHand.length - 1]])));
                const newCard = await addCardsToPlayer(generateCardSets(hexArrayToIntArray([playerHand[playerHand.length - 1]])));
                console.log(gameState[2][0]);
                console.log(gameState[3][0]);
                console.log("Bet Amount:", parseInt(gameState[3][0].hex, 16));
                setBetAmount(parseInt(gameState[3][0].hex, 16));
                setPlayerValue(calculateHandValue(newCard));
                // console.log(gameState[0][0]);
                // console.log(hexArrayToIntArray(gameState[0]));
                // console.log(gameState[1]);
                // console.log(hexArrayToIntArray(gameState[1]));
                // let dealerHand = hexArrayToIntArray(gameState[1]);
                // if (dealerHand.length == 1) {
                //     dealerHand.push(-1);
                // }
                // setPlayerCardsTemp(hexArrayToIntArray(gameState[0][0]));
                // setDealerCardsTemp(dealerHand);
            }

            // const gameState = await checkGameState(reqId);
            // const playerHand = gameState[0][0];
            // console.log([gameState[0][0][gameState[0][0].length - 1]]);
            // addCardsToPlayer(generateCardSets([gameState[0][0][gameState[0][0].length - 1]])[0])
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
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
            console.log('Response from contract:', response);
            setVerified(response);
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
    }


    async function buyBJT() {
        const contractAddress = "0xeD6a34A78bdEb71E33D9cD829917d34BF318C90a";
        setAwaitingContract(true);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, cageABI, signer);

            //const ethAmount = Math.round(buyingBJT*ethConversion*10000)/10000;
            //const amountInWei = ethers.utils.parseEther(String(buyingBJT));
            //console.log(amountInWei);
            //const response = await contract.deposit({value: amountInWei});
            let amountInWei = String(buyingBJT);
            const response = await contract.exchangeETHforBJT({ value: amountInWei });
            await response.wait();
            const balance = await checkBalance(userAddress);
            console.log('Response from contract:', response);
            console.log(parseInt(balance.hex, 16));
            setUserBalance(parseInt(balance.hex, 16));
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
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

            //const ethAmount = Math.round(buyingBJT*ethConversion*10000)/10000;
            //const amountInWei = ethers.utils.parseEther(String(buyingBJT));
            //console.log(amountInWei);
            //const response = await contract.deposit({value: amountInWei});
            // let amountInWei = String(sellingBJT);
            const allowance = await contractBJT.approve(contractAddressCage, sellingBJT);
            await allowance.wait();
            console.log(allowance);
            const response = await contract.exchangeBJTforETH(userAddress, sellingBJT);
            await response.wait();
            const balance = await checkBalance(userAddress);
            console.log('Response from contract:', response);
            console.log(parseInt(balance.hex, 16));
            setUserBalance(parseInt(balance.hex, 16));
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
    }



    async function placeBet() {
        const contractAddressGame = "0xda7a42dE9a58EDa74DCa4366b951786dd675bBd4";
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
            console.log("Starting Bet Contract");
            const allowance = await contractBJT.approve(contractAddressGame, sellingBJT);
            await allowance.wait();
            console.log("Approval Confirmed");

            const response = await contract.placeBet(betAmount);

            await response.wait();

            console.log('Response from contract:', response);
            let reqId = await getRequestId(userAddress);

            console.log("Request Id: ", reqId);
            console.log("Last Request Id: ", reqId[reqId.length - 1]);

            setRequestId(reqId[reqId.length - 1].hex);
            // console.log(parseInt(balance.hex, 16));
            const gameState = await checkGameState(reqId[reqId.length - 1].hex);
            console.log("Game State:");
            console.log(JSON.stringify(gameState));
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
            setUserBalance(userBalance - betAmount);
            setBetAmount(betAmount);
            setGameState(true);
        } catch (error) {
            console.error('Error:', error);
        }
        setAwaitingContract(false);
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
                                        key={card.img} // assuming each card image is unique
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
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' ? true : false} onClick={() => hit()}>Hit</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' ? true : false} onClick={() => {
                                setPlayerStatus("Stand")
                                setAwaitingContract(true);
                            }}>Stand</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' ? true : false}>Double-Down</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' ? true : false}>Insurance</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract || playerStatus == 'Bust' ? true : false} color="error" onClick={() => {
                                setGameState(false)
                                updateGameOutcome("Surrender")
                            }}>Surrender</ActionButton>
                        </Box>}

                </>
            ) : gameOutcome ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '80%', width: '100%', alignItems: 'center' }}>
                    <Typography variant="h2" style={titleStyle}>Decentralized Blackjack</Typography>
                    {gameOutcome == "Surrender" || gameOutcome == "Dealer Win" || gameOutcome == "Dealer Blackjack" ?
                        (<Typography variant="h2" style={outcomeStyle} sx={{ mt: 3, color: '#ff7961' }}>{gameOutcome}</Typography>)
                        : (gameOutcome == "Player Win") || gameOutcome == "Player Blackjack" ? <>
                            <Typography variant="h2" style={outcomeStyle} sx={{ mt: 3, color: '#4caf50' }}>{gameOutcome}</Typography>
                        </> :
                            <>
                                <Typography variant="h2" style={outcomeStyle} sx={{ mt: 3, color: '#fdd7a6' }}>{gameOutcome}</Typography>
                            </>}
                    <Typography variant="h4" style={playTextStyle} sx={{ mt: 3 }}>Bet: {betAmount} BJT</Typography>
                    <Typography variant="h4" style={playTextStyle} sx={{ mt: 3, mb: 3 }}>Payout: {payoutAmount} BJT</Typography>
                    <ActionButton variant="outlined" onClick={() => {
                        clearHistory()
                        updateGameOutcome("")
                        setGameOutcomeTemp("")

                        setAwaitingContract(false)
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
                                <ActionButton variant="outlined" disabled={betAmount == 0 && !awaitingContract ? false : true} onClick={() => setGameState(true)} >Play With AI Assistance</ActionButton>
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