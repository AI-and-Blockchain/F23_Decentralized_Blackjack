import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

import { useAuth } from './authprovider';
import MetaMaskButton from './metamaskbutton';

const InfoPanel = () => {
    const { userAddress, signIn, betAmount, gameOutcome, gameInProgress, chainId, awaitingContract, setAwaitingContract, userBalance, requestId } = useAuth();

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

    return (
        <Paper sx={{
            display: 'flex', flexDirection: 'column', width: '20%', height: '90%', alignItems: 'center', mt: 5, ml: 5, background: 'rgb(4,83,102)',
            background: 'radial-gradient(ellipse at center left, rgba(4,83,102,1) 0%, rgba(1,48,68,1) 50%)',
            borderStyle: 'solid',
            borderWidth: 'thin',
            borderRadius: '10px',
            borderColor: '#354158'
        }} >
            <Typography variant="h2" style={titleStyle} sx={{ align: 'center' }}>Game Info</Typography>
            <Box style={hRule} sx={{ mt: 2 }}></Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'space-between', mb: 8, ml: 2, mt: 3 }}>
                {userAddress ?
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'left', }}>
                        <Typography variant="h6" style={playTextStyle}>User Balance: {userBalance} BJT</Typography>
                        <Typography variant="h6" style={playTextStyle}>Bet: </Typography>
                        {/* <Typography variant="h6" style={playTextStyle} sx={{ml:5}}>{betAmount} BJT</Typography> */}
                        <Typography variant="h6" style={playTextStyle} noWrap sx={{width: '90%'}}>Latest Request ID: {requestId}</Typography>
                        <Typography variant="h6" style={playTextStyle}>Chain ID: {chainId} </Typography>
                        <Typography variant="h6" style={playTextStyle}>Chain Connection: {awaitingContract ? "Awaiting Contract" : "Up-To-Date"} </Typography>
                        <Button onClick={() => setAwaitingContract(false)}>Override Waiting for Chain</Button>
                        <Typography variant="h6" style={playTextStyle}>Game Status:&nbsp;
                            {gameInProgress && !gameOutcome ? ("In Progress") : gameOutcome ? (gameOutcome) : ("Not Started")}
                        </Typography>
                    </Box>
                    : <Box sx={{ display: 'flex', flexDirection: 'column', width: '90%', alignItems: 'center' }}>
                        <MetaMaskButton />
                    </Box>}
                {awaitingContract ? <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <Typography variant="h6" style={playTextStyle}>Awaiting Contract Response</Typography>
                    <Box sx={{ width: '90%', mt:1 }}>
                        <LinearProgress />
                    </Box>
                </Box> : <></>}
            </Box>
        </Paper>
    );
}

export default InfoPanel;