import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
import InfoAccordion from './infoaccordion';
import { useAuth } from './authprovider';
import { useEffect } from 'react';

const HistoryPanel = () => {

  const { gameHist, setGameHist } = useAuth();
  const playTextStyle = {
    fontFamily: 'Agbalumo',
    color: '#dfe4dc'
  };

  const titleStyle = {
    fontFamily: 'Agbalumo',
    color: '#fdd7a6'
  }

  const hRule = {
    width: '90%',
    height: '2px',
    background: 'rgb(39,47,77)',
    background: 'linear-gradient(90deg, rgba(39,47,77,1) 0%, rgba(255,215,182,1) 45%, rgba(251,212,180,1) 55%, rgba(39,47,77,1) 100%)'
  }

  


  useEffect(() => {
    console.log("Game history:");
    console.log(gameHist);
    if (gameHist.length != 0) {
      console.log(JSON.parse(gameHist));
    }
  }, [gameHist]);

  return (
    <Paper sx={{
      display: 'flex', flexDirection: 'column', width: '20%', height: '90%', alignItems: 'center', mt: 5, mr: 5, background: 'rgb(4,83,102)',
      background: 'radial-gradient(ellipse at center right, rgba(4,83,102,1) 0%, rgba(1,48,68,1) 50%)',
      overflow: 'hidden',
      overflowY: 'scroll',
      borderStyle: 'solid',
      borderWidth: 'thin',
      borderRadius: '10px',
      borderColor: '#354158'
    }} >
      <Typography variant="h2" style={titleStyle} sx={{ align: 'center' }}>History</Typography>
      <Box style={hRule} sx={{ mt: 2, mb: 2 }}></Box>
      
      {gameHist && gameHist.length != 0 ? <>
        {JSON.parse(gameHist).reverse().map((game, index) => (
            <InfoAccordion sx={{ width: '100%' }}
              gameId={(JSON.parse(gameHist).length - index)}
              bet={JSON.parse(game).betAmount}
              outcome={JSON.parse(game).outcome.status}
              payout={JSON.parse(game).outcome.payout}
              dealerHand={JSON.parse(game).dealerHand}
              playerHand={JSON.parse(game).playerHand}
              actions={JSON.parse(game).actions}
              key={index}
            />
        ))}</> : <></>}
    </Paper>
  );
}

export default HistoryPanel;