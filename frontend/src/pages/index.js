import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
import { useState } from 'react';
import MetaMaskButton from "../components/metamaskbutton";
import GameComponent from '../components/gamecomponent';
import InfoPanel from '@/components/infopanel';
import HistoryPanel from '@/components/historypanel';
import { ContentCopy } from '@mui/icons-material';
import { useAuth } from '@/components/authprovider';

const GameLayout = () => {

  const playTextStyle = {
    fontFamily: 'Agbalumo', 
    color: '#dfe4dc'
  };

  const { userAddress } = useAuth();

  return (
    <Box>
      <Box sx={{display: 'flex', flexDirection: 'column', height: '2vh', alignItems: 'center'}}>
        <Typography variant="h6" style={playTextStyle}>User Address: {userAddress ? userAddress : "Not Connected To Wallet"} </Typography>
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '98vh'}}>
        <HistoryPanel />
        <GameComponent />
        <InfoPanel />
      </Box>
    </Box>
  );
};

export default GameLayout;