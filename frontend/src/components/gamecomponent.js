import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

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
        awaitingContract, setAwaitingContract,
        verified, setVerified } = useAuth();

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

            if (latestRound.actions.includes("Stand")) {
                setPlayerStatus("Stand");
            } else if (latestRound.actions.includes("Bust")) {
                setPlayerStatus("Bust");
            }
            if (latestRound.actions.includes("Dealer Stand")) {
                setDealerStatus("Stand");
            } else if (latestRound.actions.includes("Dealer Bust")) {
                setDealerStatus("Bust");
            }
            if (latestRound.outcome) {
                setGameOutcomeTemp(latestRound.outcome.status);
                setPayoutAmount(latestRound.outcome.payout);
            }
            if (!latestRound.outcome && latestRound.gameHistory.length > 0) {
                setGameState(true);
            }
        }
    };
    useEffect(() => {
        loadGameHistory();
    }, []);

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
                            <ActionButton variant="outlined" disabled={awaitingContract ? true : false} onClick={() => addCardToPlayer("Ace of Hearts")}>Hit</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract ? true : false} onClick={() => {
                                setPlayerStatus("Stand")
                                setAwaitingContract(true);
                            }}>Stand</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract ? true : false}>Double-Down</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract ? true : false}>Insurance</ActionButton>
                            <ActionButton variant="outlined" disabled={awaitingContract ? true : false} color="error" onClick={() => {
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
                                onChange={(event, val) => updateBetAmount(event, val)}
                            />

                            <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                                <ActionButton variant="outlined" onClick={() => setGameState(true)} disabled={awaitingContract ? true : false}>Play Blackjack</ActionButton>
                                <ActionButton variant="outlined" disabled={betAmount == 0 && awaitingContract != 0 ? false : true} onClick={() => setGameState(true)} >Play With AI Assistance</ActionButton>
                            </Box>
                            <Typography variant="h3" style={playTextStyle} sx={{ mt: 5, mb: 3 }}>Exchange Blackjack Token (BJT)</Typography>
                            <Box sx={{display: 'flex'}}>
                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 3}}>
                                <Typography variant="h5" style={playTextStyle} sx={{mb:2}}>Buy</Typography>
                                    <NumberInputBasic
                                        aria-label="Purchase BJT"
                                        placeholder="Enter Amount"
                                        value={buyingBJT}
                                        onChange={(event, val) => setBuyingBJT(val)}
                                    />
                                    <Typography variant="h5" style={playTextStyle} sx={{ mt: 2, }}>{buyingBJT} BJT = {(buyingBJT * 0.0001).toFixed(4)} ETH</Typography>

                                    <ActionButton variant="outlined" sx={{ mt: 3 }} onClick={() => setAwaitingContract(true)} disabled={awaitingContract || buyingBJT == 0 ? true : false}>Purchase</ActionButton>
                                </Box>
                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 3}}>
                                <Typography variant="h5" style={playTextStyle} sx={{mb:2}}>Sell</Typography>

                                    <NumberInputBasic
                                        aria-label="Exchange BJT"
                                        placeholder="Enter Amount"
                                        value={sellingBJT}
                                        onChange={(event, val) => setSellingBJT(val)}
                                    />
                                    <Typography variant="h5" style={playTextStyle} sx={{ mt: 2, }}>{sellingBJT} BJT = {(sellingBJT * 0.0001).toFixed(4)} ETH</Typography>

                                    <ActionButton variant="outlined" sx={{ mt: 3 }} onClick={() => setAwaitingContract(true)} disabled={awaitingContract || sellingBJT == 0 ? true : false}>Sell</ActionButton>
                                </Box>
                            </Box>


                        </>) : userAddress && !verified ? <>
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
                                if (age > 17) {
                                    setVerified(true);
                                }
                            }}>Submit</ActionButton>
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