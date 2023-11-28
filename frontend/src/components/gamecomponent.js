import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import NumberInputBasic from './numberinput';
import Divider from '@mui/material/Divider';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import gameHistoryData from './gamestate.json';
import { useAuth } from './authprovider';
import { useState, useEffect } from 'react';

const GameComponent = () => {

    const { gameInProgress, setGameState, 
        userAddress, betAmount, 
        updateBetAmount, gameOutcome, 
        updateGameOutcome, 
        awaitingContract, setAwaitingContract } = useAuth();

    const [hasStood, setHasStood] = useState(false);
    const [playerStatus, setPlayerStatus] = useState("");
    const [dealerStatus, setDealerStatus] = useState("");
    const [gameOutcomeTemp, setGameOutcomeTemp] = useState("");
    const [payoutAmount, setPayoutAmount] = useState(0);

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
        background: 'rgb(223,227,223)',
        background: 'linear-gradient(0deg, rgba(223,227,223,1) 0%, rgba(252,254,236,1) 100%)',
        color: '#1e2c3e',
        marginLeft: '5px',
        marginRight: '5px'
    });


    const SurrenderButton = styled(Button)({
        background: 'rgb(196,34,3)',
        background: 'linear-gradient(0deg, rgba(196,34,3,1) 0%, rgba(255,215,182,1) 100%)',
        color: '#fdfee7',
        marginLeft: '5px',
        marginRight: '5px',
        disabled: awaitingContract ? 'true' : 'false'
    });


    const [dealerCards, setDealerCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerValue, setDealerValue] = useState(0);
    const [playerValue, setPlayerValue] = useState(0);

    const addCardToPlayer = (cardName) => { //addCardToPlayer({ img: '/images/cards/ace_of_clubs.png', title: 'Ace of Clubs', val: 1});
        const imageName = cardName.toLowerCase().replace(/\s+/g, '_') + '.png';

        const newCard = {
            img: `/images/cards/${imageName}`, // Adjust the path as necessary
            title: cardName,
            animating: true
        };
        const updatedPlayerCards = [...playerCards, { ...newCard, animating: true }];

        setPlayerCards(updatedPlayerCards);
        const cardTitles = updatedPlayerCards.map(card => card.title);
        setPlayerValue(calculateHandValue(cardTitles));

        setAwaitingContract(true);
        // After animation duration, remove the 'animating' property
        setTimeout(() => {
            setPlayerCards(prevPlayerCards => prevPlayerCards.map((card, index) => 
                index === prevPlayerCards.length - 1 ? { ...card, animating: false } : card
            ));
        }, 500); // 0.5 second
    };

    const convertCardName = (cardName) => {
        return cardName.toLowerCase().replace(/\s+/g, '_');
    }

    const calculateHandValue = (hand) => {
        let totalValue = 0;
        let aceCount = 0;
    
        hand.forEach(card => {
            const cardName = card.split(" ")[0];
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

    const loadGameHistory = () => {

        // const history = {
        //     "betAmount": "10eth",
        //     "gameHistory": [
              
        //     ]
        //   }
        const history = gameHistoryData;
        const latestRound = history.gameHistory[history.gameHistory.length - 1];

        if (latestRound && history.gameHistory.length > 0) {
            setPlayerCards(latestRound.playerHand.map(card => ({ img: `/images/cards/${convertCardName(card)}.png`, title: card })));
            setDealerCards(latestRound.dealerHand.map(card => ({ img: card !== "Hidden" ? `/images/cards/${convertCardName(card)}.png` : '/path/to/hidden.png', title: card })));
            setDealerValue(calculateHandValue(latestRound.dealerHand));
            setPlayerValue(calculateHandValue(latestRound.playerHand));

            if (latestRound.actions.includes("Stand")){
                setPlayerStatus("Stand");
            } else if (latestRound.actions.includes("Bust")){
                setPlayerStatus("Bust");
            }
            if (latestRound.actions.includes("Dealer Stand")){
                setDealerStatus("Stand");
            } else if (latestRound.actions.includes("Dealer Bust")){
                setDealerStatus("Bust");
            }
            if (latestRound.outcome){
                setGameOutcomeTemp(latestRound.outcome.status);
                setPayoutAmount(latestRound.outcome.payout);
            }
            if (!latestRound.outcome && latestRound.gameHistory.length > 0){
                setGameState(true);
            }
        }
    };
    useEffect(() => {
        loadGameHistory();
    }, []);

    return(
        <Paper  sx={{display: 'flex', flexDirection: 'column', width: '50%', height: '90%', alignItems: 'center', mt: 5,background: 'rgb(4,83,102)',
        background: 'radial-gradient(ellipse at center top, rgba(4,83,102,1) 0%, rgba(1,48,68,1) 50%)',
        borderStyle: 'solid',
        borderWidth: 'thin',
        borderRadius: '10px',
        borderColor: '#354158'}} >
            {gameInProgress && userAddress ? (
            <>
                <Box sx={{display: 'flex', flexDirection: 'column', height: '40%', width: '100%', alignItems: 'center'}}>
                    <Typography variant="h2" style={playTextStyle} sx={{mb:1}}>Dealer Hand</Typography>
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
                        <DealerOverlay>{dealerStatus}</DealerOverlay> {}
                        </Box>
                    </Box>
                    <Typography variant="h4" style={playTextStyle}>Dealer Score: {dealerValue}</Typography>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'column', height: '40%', width: '100%', alignItems: 'center', mt: 5}}>
                    <Typography variant="h2" style={playTextStyle} sx={{mb:1}}>My Hand</Typography>
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
                        <PlayerOverlay>{playerStatus}</PlayerOverlay> {}
                        </Box>
                    </Box>
                    <Typography variant="h4" style={playTextStyle}>My Score: {playerValue}</Typography>
                </Box>
                {gameOutcomeTemp? 
                <Box sx={{display: 'flex', flexDirection: 'row', mt:3}}>
                    <ActionButton variant="contained" onClick={() => updateGameOutcome(gameOutcomeTemp)}>Continue</ActionButton>
                </Box>: 
                <Box sx={{display: 'flex', flexDirection: 'row', mt:3}}>
                    <ActionButton variant="contained" disabled={awaitingContract ? true : false} onClick={() => addCardToPlayer("Ace of Hearts")}>Hit</ActionButton>
                    <ActionButton variant="contained" disabled={awaitingContract ? true : false} onClick={()=>setPlayerStatus("Stand")}>Stand</ActionButton>
                    <ActionButton variant="contained" disabled={awaitingContract ? true : false}>Double-Down</ActionButton>
                    <ActionButton variant="contained" disabled={awaitingContract ? true : false}>Insurance</ActionButton>
                    <SurrenderButton variant="contained" disabled={awaitingContract ? true : false} onClick={() => {
                        setGameState(false)
                        updateGameOutcome("Surrender")
                    }}>Surrender</SurrenderButton>
                </Box>}
                
            </>
            ) : gameOutcome? (
                <Box sx={{display: 'flex', flexDirection: 'column', height: '80%', width: '100%', alignItems: 'center'}}>
                    <Typography variant="h2" style={titleStyle}>Decentralized Blackjack</Typography>
                    {gameOutcome == "Surrender" || gameOutcome == "Dealer Win" || gameOutcome == "Dealer Blackjack" ? 
                    (<Typography variant="h2" style={outcomeStyle} sx={{mt: 3, color: '#ff7961'}}>{gameOutcome}</Typography>) 
                    : (gameOutcome == "Player Win") || gameOutcome == "Player Blackjack" ? <>
                    <Typography variant="h2" style={outcomeStyle} sx={{mt: 3, color: '#4caf50'}}>{gameOutcome}</Typography>
                    </> :
                    <>
                    <Typography variant="h2" style={outcomeStyle} sx={{mt: 3, color: '#fdd7a6'}}>{gameOutcome}</Typography>
                    </>}
                    <Typography variant="h4" style={playTextStyle} sx={{mt: 3}}>Bet: {betAmount} wei</Typography>
                    <Typography variant="h4" style={playTextStyle} sx={{mt: 3, mb: 3}}>Payout: {payoutAmount} wei</Typography>
                    <ActionButton variant="contained" onClick={() =>{
                        clearHistory()
                        updateGameOutcome("")
                        setGameOutcomeTemp("")
                         
                        setAwaitingContract(false)
                    }}>Return Home</ActionButton>
                </Box>
            ) :
                    <>
                    <Box sx={{display: 'flex', flexDirection: 'column', height: '80%', width: '100%', alignItems: 'center'}}>
                        <Typography variant="h2" style={titleStyle}>Decentralized Blackjack</Typography>
                        <Box style={hRule} sx={{mt: 2}}></Box>

                        {userAddress ? <>
                            <Typography variant="h3" style={playTextStyle} sx={{mt: 5}}>Start Game</Typography>
                            <Typography variant="h4" style={playTextStyle} sx={{mt: 3, mb: 2}}>Bet Amount: </Typography>
                                <NumberInputBasic
                                    aria-label="Bet amount"
                                    placeholder="Enter bet"
                                    value={betAmount}
                                    onChange={(event, val) => updateBetAmount(event, val)}
                                />
                            
                                <Box sx={{display: 'flex', flexDirection: 'row', mt:3}}>
                                    <ActionButton variant="contained" onClick={() => setGameState(true)}>Play Blackjack</ActionButton>
                                    <ActionButton variant="contained" disabled={betAmount == 0 ? false : true} onClick={() => setGameState(true)}>Play With AI Assistance</ActionButton>
                                </Box>
                        </> :
                            <Typography variant="h4" style={playTextStyle}>Please Sign In With Wallet</Typography>
                        }
                    </Box>
                </>
                }
        </Paper>
    );
}

export default GameComponent;