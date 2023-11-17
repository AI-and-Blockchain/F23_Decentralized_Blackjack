import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function InfoAccordion({gameId}) {

const titleStyle = {
    fontFamily: 'Agbalumo',
    color: '#fdd7a6'
}

  return (
    <div style={{width: '100%'}}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h6" style={titleStyle}>Game {gameId}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Bet: 10 wei</Typography>
          <Typography>Game Outcome: Player Win</Typography>
          <Typography>Payout: 20 wei</Typography>
          <Typography>Dealer Hand: 10h 7s</Typography>
          <Typography>Player Hand: 9h 9c</Typography>
          <Typography>Address:</Typography>
          <Typography noWrap>0xbb70ca6812002e077225e5421788cf53260cf82c</Typography>
          <Typography>Encrypted RFN:</Typography>
          <Typography noWrap>pjwhlkj4352jlrl2kj345</Typography>
          <Typography>RFN Key:</Typography>
          <Typography noWrap>pjwhlkj4352jlrl2kj345</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}