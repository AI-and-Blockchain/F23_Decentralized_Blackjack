// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./BJT.sol";

contract BlackjackWithVRFv2 is VRFConsumerBaseV2, ConfirmedOwner {
    using SafeMath for uint256;
    BlackJackToken public bjtToken;

    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    uint32 callbackGasLimit = 2500000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 30;  // Adjusted for maximum of 10 random numbers (5 cards each for player and dealer)
    uint256[] public requestIds;
    uint256 public lastRequestId;

    event BetPlaced(address indexed player, uint256 amount);
    event PlayerAction(address indexed player, string action);
    event CardsDealt(address indexed player, uint256[] playerCards, uint256 dealerCard);
    event GameResult(address indexed player, uint256[] playerCards, uint256 dealerCard);
    event GameReset(address indexed player);
    event GameEnded(address indexed player, string outcome);
    event DealerBlackjack(address indexed player);

    struct PlayerHand {
        uint256[] cards;
        bool hasStood;
        uint256 betAmount;
    }

    struct GameRequest {
        address player;
        bool fulfilled;
        PlayerHand[] playerHands;
        uint256 dealerCard;
        uint256[] dealerCards;
        uint256[] randomNumbers;
        bool gameEnded;
    }

    struct GameOutcome {
        address player;
        uint256[] playerHand;
        uint256[] dealerHand;
        string outcome;
    }

    mapping(uint256 => GameRequest) public gameRequests;
    mapping(address => GameOutcome[]) public gameHistories;

    constructor(uint64 subscriptionId, address BJTAddr)
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625);
        s_subscriptionId = subscriptionId;
        bjtToken = BlackJackToken(BJTAddr);
    }

    function placeBet(uint256 betAmount) public {
        require(bjtToken.balanceOf(msg.sender) >= betAmount, "Insufficient BJT balance");
        require(bjtToken.allowance(msg.sender, address(this)) >= betAmount, "Blackjack contract not approved for the bet amount");
        bjtToken.transferFrom(msg.sender, address(this), betAmount);

        uint256 requestId = requestRandomWords();
        gameRequests[requestId].player = msg.sender;
        gameRequests[requestId].fulfilled = false;
        gameRequests[requestId].dealerCard = 0;
        gameRequests[requestId].dealerCards = new uint256[](1);
        gameRequests[requestId].randomNumbers = new uint256[](numWords);
        gameRequests[requestId].gameEnded = false;

        // Initialize the first hand
        PlayerHand memory newHand = PlayerHand({
            cards: new uint256[](2),
            hasStood: false,
            betAmount: betAmount
        });
        gameRequests[requestId].playerHands.push(newHand);

        emit BetPlaced(msg.sender, betAmount);
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(gameRequests[_requestId].player != address(0), "Game request not found");

        GameRequest storage request = gameRequests[_requestId];
        request.fulfilled = true;
        request.randomNumbers = _randomWords;

        // Deal initial two cards for player and one card for dealer
        request.playerHands[0].cards[0] = getCard(_requestId);
        request.playerHands[0].cards[1] = getCard(_requestId);
        request.dealerCard = getCard(_requestId);
        request.dealerCards[0] = request.dealerCard;

        emit CardsDealt(request.player, request.playerHands[0].cards, request.dealerCard);
    }

    // Implement split functionality
    function split(uint256 requestId) public {
        GameRequest storage request = gameRequests[requestId];
        require(request.player == msg.sender, "Not the player's game");
        require(!request.gameEnded, "Game already ended");
        require(request.fulfilled, "Game not yet started");

        // Validate split conditions
        require(request.playerHands.length == 1, "Splitting not possible");
        require(request.playerHands[0].cards.length == 2, "Cannot split");
        require(request.playerHands[0].cards[0] == request.playerHands[0].cards[1], "Cards are not the same for splitting");

        // Ensure the player has enough BJT tokens for the additional bet
        uint256 additionalBet = request.playerHands[0].betAmount;
        require(bjtToken.balanceOf(msg.sender) >= additionalBet, "Insufficient BJT balance for split");
        bjtToken.transferFrom(msg.sender, address(this), additionalBet);

        uint256 splitCard = request.playerHands[0].cards[0];
        request.playerHands[0].cards[1] = getCard(requestId);

        PlayerHand memory newHand = PlayerHand({
            cards: new uint256[](2),
            hasStood: false,
            betAmount: additionalBet
        });
        newHand.cards[0] = splitCard;
        newHand.cards[1] = getCard(requestId);
        request.playerHands.push(newHand);
        
    }


    function hit(uint256 requestId, uint256 handIndex) public {
        GameRequest storage request = gameRequests[requestId];
        require(request.player == msg.sender, "Not the player's game");
        require(handIndex < request.playerHands.length, "Invalid hand index");
        require(!request.playerHands[handIndex].hasStood, "Cannot hit on this hand");
        require(!request.gameEnded, "Game already ended");

        uint256 newCard = getCard(requestId);
        request.playerHands[handIndex].cards.push(newCard);

        if (calculateHandValue(request.playerHands[handIndex].cards) > 21) {
            endGame(requestId, handIndex, "Player bust");
        }
    }

    function stand(uint256 requestId, uint256 handIndex) public {
        GameRequest storage request = gameRequests[requestId];
        require(request.player == msg.sender, "Not the player's game");
        require(handIndex < request.playerHands.length, "Invalid hand index");
        require(!request.gameEnded, "Game already ended");

        request.playerHands[handIndex].hasStood = true;

        bool allHandsStood = true;
        for (uint256 i = 0; i < request.playerHands.length; i++) {
            if (!request.playerHands[i].hasStood) {
                allHandsStood = false;
                break;
            }
        }

        if (allHandsStood) {
            playDealerHand(requestId);
        }
    }

    function playDealerHand(uint256 requestId) internal {
        GameRequest storage request = gameRequests[requestId];
        // Dealer draws cards until their hand value is 17 or higher
        while (calculateHandValue(request.dealerCards) < 17) {
            request.dealerCards.push(getCard(requestId));
        }

        // Resolve the game for each hand
        for (uint256 i = 0; i < request.playerHands.length; i++) {
            finalizeHand(requestId, i);
        }
    }

    function finalizeHand(uint256 requestId, uint256 handIndex) internal {
        GameRequest storage request = gameRequests[requestId];
        uint256 dealerHandValue = calculateHandValue(request.dealerCards);
        uint256 playerHandValue = calculateHandValue(request.playerHands[handIndex].cards);

        string memory outcome;
        if (playerHandValue > 21) {
            outcome = "Player bust";
        } else if (dealerHandValue > 21) {
            outcome = "Dealer bust";
        } else if (dealerHandValue == 21 || dealerHandValue > playerHandValue) {
            outcome = "Dealer wins";
        } else if (playerHandValue > dealerHandValue) {
            outcome = "Player wins";
        } else {
            outcome = "Push";
        }

        endGame(requestId, handIndex, outcome);
    }

    function getCard(uint256 requestId) private returns (uint256) {
        require(gameRequests[requestId].randomNumbers.length > 0, "No more random numbers available");
        uint256 cardIndex = gameRequests[requestId].randomNumbers.length - 1;
        uint256 cardValue = (gameRequests[requestId].randomNumbers[cardIndex] % 13) + 1;
        gameRequests[requestId].randomNumbers.pop();
        return cardValue;
    }

    function calculateHandValue(uint256[] memory cards) internal pure returns (uint256) {
        uint256 totalValue = 0;
        uint256 aces = 0;

        for (uint256 i = 0; i < cards.length; i++) {
            uint256 cardValue = cards[i];
            if (cardValue > 10) {
                cardValue = 10; // Face cards are worth 10
            } else if (cardValue == 1) {
                aces += 1; // Aces count as 1 initially
            } else {
                totalValue += cardValue;
            }
        }

        for (uint256 i = 0; i < aces; i++) {
            if (totalValue + 11 <= 21) {
                totalValue += 11; // Count Aces as 11 if it doesn't cause bust
            } else {
                totalValue += 1; // Otherwise, count Aces as 1
            }
        }

        return totalValue;
    }

    function endGame(uint256 requestId, uint256 handIndex, string memory outcome) internal {
        GameRequest storage request = gameRequests[requestId];
        PlayerHand storage hand = request.playerHands[handIndex];

        // Calculate the dealer's and player's hand value
        uint256 dealerHandValue = calculateHandValue(request.dealerCards);
        uint256 playerHandValue = calculateHandValue(hand.cards);

        // Determine the game outcome and handle BJT token transfer accordingly
        if (playerHandValue <= 21 && (playerHandValue > dealerHandValue || dealerHandValue > 21)) {
            // Player wins - transfer winnings in BJT tokens
            uint256 winnings = hand.betAmount.mul(2); // Assuming the player receives double the bet amount
            bjtToken.transfer(request.player, winnings);
            outcome = "Player wins";
        } else if (playerHandValue > 21 || (dealerHandValue <= 21 && dealerHandValue > playerHandValue)) {
            // Player loses - BJT tokens remain in the contract
            outcome = "Player loses";
        } else {
            // Push - Player gets their bet back
            bjtToken.transfer(request.player, hand.betAmount);
            outcome = "Push";
        }

        // Log the result of this hand
        GameOutcome memory result = GameOutcome({
            player: request.player,
            playerHand: hand.cards,
            dealerHand: request.dealerCards,
            outcome: outcome
        });
        gameHistories[request.player].push(result);

        // Check if this was the last hand to finish
        bool allHandsFinished = true;
        for (uint256 i = 0; i < request.playerHands.length; i++) {
            if (!request.playerHands[i].hasStood) {
                allHandsFinished = false;
                break;
            }
        }

        if (allHandsFinished) {
            request.gameEnded = true;
            emit GameEnded(request.player, outcome);
        }
    }

    function resetGame(uint256 requestId) internal {
        GameRequest storage request = gameRequests[requestId];
        delete request.playerHands; // Clear all player hands
        request.dealerCard = 0;
        delete request.dealerCards;
        delete request.randomNumbers;
        request.fulfilled = false;
        request.gameEnded = false;

        emit GameReset(request.player);
    }

    function hasAce(uint256[] memory cards) internal pure returns (bool) {
        for (uint256 i = 0; i < cards.length; i++) {
            if (cards[i] == 1) { // Ace is represented as 1
                return true;
            }
        }
        return false;
    }
    function requestRandomWords() internal returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        requestIds.push(requestId);
        lastRequestId = requestId;
    }
    function getGameState(uint256 requestId) public view returns (uint256[][] memory playerHands, uint256[] memory dealerCards, string[] memory statuses) {
        require(gameRequests[requestId].player != address(0), "Game request not found");

        GameRequest storage request = gameRequests[requestId];
        uint256 numHands = request.playerHands.length;
        playerHands = new uint256[][](numHands);
        statuses = new string[](numHands);

        for (uint256 i = 0; i < numHands; i++) {
            playerHands[i] = request.playerHands[i].cards;
            uint256 playerHandValue = calculateHandValue(playerHands[i]);
            if (request.gameEnded) {
                statuses[i] = "Game ended";
            } else if (playerHandValue > 21) {
                statuses[i] = "Player bust";
            } else if (request.playerHands[i].hasStood) {
                statuses[i] = "Hand stood";
            } else {
                statuses[i] = "Game in progress";
            }
        }

        dealerCards = request.dealerCards;
        return (playerHands, dealerCards, statuses);
    }
    function getGameRequest(uint256 requestId) public view returns (GameRequest memory) {
        require(gameRequests[requestId].player != address(0), "Game request not found");
        return gameRequests[requestId];
    }
    function getPlayerCards(uint256 requestId) public view returns (uint256[][] memory) {
        require(gameRequests[requestId].player != address(0), "Game request not found");

        GameRequest storage request = gameRequests[requestId];
        uint256 numHands = request.playerHands.length;
        uint256[][] memory allHands = new uint256[][](numHands);

        for (uint256 i = 0; i < numHands; i++) {
            allHands[i] = request.playerHands[i].cards;
        }

        return allHands;
    }
    function getDealerCards(uint256 requestId) public view returns (uint256[] memory) {
        require(gameRequests[requestId].player != address(0), "Game request not found");
        return gameRequests[requestId].dealerCards;
    }
    function getGameHistory(address player) public view returns (GameOutcome[] memory) {
        return gameHistories[player];
    }
    function getRandomNumbersLength(uint256 requestId) public view returns (uint256) {
        require(gameRequests[requestId].player != address(0), "Game request not found");
        return gameRequests[requestId].randomNumbers.length;
    }
}