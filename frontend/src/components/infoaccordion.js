import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mapOutcome } from './outcomeMapper';
export default function InfoAccordion({ gameId, bet, outcome, payout, dealerHand, playerHand, actions }) {
  const titleStyle = {
    fontFamily: 'Agbalumo',
    color: '#fdd7a6'
  }
  function generateCardSets(hand) {
    const suits = ['h', 'd', 'c', 's'];
    const faceCardValues = { 11: 'J', 12: 'Q', 13: 'K' };

    let usedCombinations = new Set(); // Track used combinations

    // Function to generate a unique combination for a card
    function generateUniqueCombination(card) {
      let shuffledSuits = suits.sort(() => Math.random() - 0.5);
      if (card == -1 || card == 0) {
        return '*';
      }

      if (card === 1) {
        for (let suit of shuffledSuits) {
          let combination = `A${suit}`;
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
        let combination = `${cardLabel}${suit}`;

        if (!usedCombinations.has(combination)) {
          usedCombinations.add(combination);
          return combination;
        }
      }

      return null;
    }

    return hand.map(generateUniqueCombination).filter(Boolean);
  }

  return (
    <div style={{ width: '100%' }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h6" style={titleStyle}>Game {gameId}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Bet: {bet} BJT</Typography>
          <Typography>Game Outcome: {mapOutcome(outcome)}</Typography>
          <Typography>Payout: {payout} BJT</Typography>
          <Typography>Dealer Hand: {generateCardSets(dealerHand)}</Typography>
          <Typography>Player Hand: {generateCardSets(playerHand)}</Typography>
          <Typography>Actions: {actions.join(", ")}</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}