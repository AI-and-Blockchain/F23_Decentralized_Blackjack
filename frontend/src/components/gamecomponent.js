import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import NumberInputBasic from './numberinput';
import Divider from '@mui/material/Divider';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import { useAuth } from './authprovider';
import { useState } from 'react';

const GameComponent = () => {

    const { gameInProgress, setGameState, userAddress, betAmount, updateBetAmount, gameOutcome, updateGameOutcome } = useAuth();

    const containerStyle = {
        width: '100%',
        height: 'auto', // make sure the height adjusts to the content
        position: 'relative', // allows absolute positioning of children
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        marginTop: '3%',
        marginLeft: '3%'
      };
    
      const cardStyle = index => ({
        width: 'auto',
        height: '90%',
        position: 'absolute',
        left: `${index * 80}px`, // adjust the px to increase/decrease overlap
        top: 0,
        zIndex: index,
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
        borderColor: '#354158'
      };

      const ActionButton = styled(Button)({
        background: 'rgb(223,227,223)',
        background: 'linear-gradient(0deg, rgba(223,227,223,1) 0%, rgba(252,254,236,1) 100%)',
        color: '#1e2c3e',
        marginLeft: '5px',
        marginRight: '5px',
      });

      
      const SurrenderButton = styled(Button)({
        background: 'rgb(196,34,3)',
        background: 'linear-gradient(0deg, rgba(196,34,3,1) 0%, rgba(255,215,182,1) 100%)',
        color: '#fdfee7',
        marginLeft: '5px',
        marginRight: '5px',
      });



    const dealerCards = [
        {
        img: "/images/cards/2_of_clubs.png",
        title: '2 of Clubs',
        },
        {
        img: '/images/cards/10_of_hearts.png',
        title: '10 of Hearts',
        },
        {
        img: '/images/cards/4_of_clubs.png',
        title: '4 of Clubs',
        },
        {
        img: '/images/cards/4_of_spades.png',
        title: '4 of Spades',
        }
    ];

    const playerCards = [
        {
        img: '/images/cards/ace_of_clubs.png',
        title: 'Breakfast',
        },
        {
        img: '/images/cards/10_of_clubs.png',
        title: 'Burger',
        },
    ];

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
                    <Typography variant="h2" style={playTextStyle}>Dealer Hand</Typography>
                    <Box style={playField}>
                        <Box style={containerStyle}>
                        {dealerCards.map((card, index) => (
                            <img
                            key={card.img} // assuming each card image is unique
                            src={card.img}
                            alt={card.title}
                            style={cardStyle(index)}
                            title={card.title} // added title attribute for accessibility
                            />
                        ))}
                        </Box>
                    </Box>
                    <Typography variant="h4" style={playTextStyle}>Dealer Score: 20</Typography>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'column', height: '40%', width: '100%', alignItems: 'center', mt: 5}}>
                    <Typography variant="h2" style={playTextStyle}>My Hand</Typography>
                    <Box style={playField}>
                    <Box style={containerStyle}>
                        {playerCards.map((card, index) => (
                            <img
                            key={card.img} // assuming each card image is unique
                            src={card.img}
                            alt={card.title}
                            style={cardStyle(index)}
                            title={card.title} // added title attribute for accessibility
                            />
                        ))}
                        </Box>
                </Box>
                    <Typography variant="h4" style={playTextStyle}>My Score: 21</Typography>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'row', mt:3}}>
                    <ActionButton variant="contained">Hit</ActionButton>
                    <ActionButton variant="contained">Stand</ActionButton>
                    <ActionButton variant="contained">Split</ActionButton>
                    <ActionButton variant="contained">Double-Down</ActionButton>
                    <ActionButton variant="contained">Insurance</ActionButton>
                    <SurrenderButton variant="contained" onClick={() => {
                        setGameState(false)
                        updateGameOutcome("Surrender")
                    }}>Surrender</SurrenderButton>
                </Box>
            </>
            ) : gameOutcome? (
                <Box sx={{display: 'flex', flexDirection: 'column', height: '80%', width: '100%', alignItems: 'center'}}>
                    <Typography variant="h2" style={titleStyle}>Decentralized Blackjack</Typography>
                    {gameOutcome == "Surrender" ? 
                    (<Typography variant="h2" style={outcomeStyle} sx={{mt: 3, color: '#ff7961'}}>Surrendered</Typography>) 
                    : (gameOutcome == "Victory") ? <></> :
                    <>
                    </>}
                    <Typography variant="h4" style={playTextStyle} sx={{mt: 3}}>Bet: 10 wei</Typography>
                    <Typography variant="h4" style={playTextStyle} sx={{mt: 3, mb: 3}}>Payout: 5 wei</Typography>
                    <ActionButton variant="contained" onClick={() => updateGameOutcome("")}>Return Home</ActionButton>
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