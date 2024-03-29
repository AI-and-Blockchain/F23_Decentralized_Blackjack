// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./BJT.sol";
import "./Authenticator.sol";

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
    Authenticator private authenticator;

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
        string[] actions;
        bool hasInsurance;
        bool hasDoubledDown;
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
    struct Outcome {
        string status;
        uint256 payout;
    }
    struct GameOutcome {
        uint256 round;
        uint256 betAmount;
        uint256[] playerHand;
        uint256[] dealerHand;
        string[] actions;
        Outcome outcome;
    }

    mapping(uint256 => GameRequest) public gameRequests;
    mapping(address => GameOutcome[]) public gameHistories;
    mapping(address => uint256[]) private userRequestIds;


    constructor(uint64 subscriptionId, address BJTAddr)
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625);
        s_subscriptionId = subscriptionId;
        bjtToken = BlackJackToken(BJTAddr);
        authenticator = Authenticator(0x13Be49565C126AD6aFe76dBd22b2Aa75670240C0);
    }

    function placeBet(uint256 betAmount) public {
        require(authenticator.isVerified(msg.sender), "Player not verified");
        require(bjtToken.balanceOf(msg.sender) >= betAmount, "Insufficient BJT balance");
        require(bjtToken.allowance(msg.sender, address(this)) >= betAmount, "Blackjack contract not approved for the bet amount");
        bjtToken.transferFrom(msg.sender, address(this), betAmount);

        uint256 requestId = requestRandomWords();
        userRequestIds[msg.sender].push(requestId);
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
            betAmount: betAmount,
            actions: new string[](0),
            hasInsurance: false,
            hasDoubledDown: false
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
        if (calculateHandValue(request.playerHands[0].cards) == 21) {
            request.gameEnded = true;
            playDealerHand(_requestId);
        }
    }

    // Implement split functionality
    function split(uint256 requestId) public {
        // GameRequest storage request = gameRequests[requestId];
        // require(request.player == msg.sender, "Not the player's game");
        // require(!request.gameEnded, "Game already ended");

        // // Validate split conditions
        // require(request.playerHands[0].cards.length == 2, "Cannot split");
        // require(request.playerHands[0].cards[0] == request.playerHands[0].cards[1], "Cards are not the same for splitting");

        // // Ensure the player has enough BJT tokens for the additional bet
        // uint256 additionalBet = request.playerHands[0].betAmount;
        // require(bjtToken.balanceOf(msg.sender) >= additionalBet, "Insufficient BJT balance for split");
        // bjtToken.transferFrom(msg.sender, address(this), additionalBet);

        // uint256 splitCard = request.playerHands[0].cards[0];
        // request.playerHands[0].cards[1] = getCard(requestId);

        // PlayerHand memory newHand = PlayerHand({
        //     cards: new uint256[](2),
        //     hasStood: false,
        //     betAmount: additionalBet,
        //     actions: new string[](0)
        // });
        // newHand.cards[0] = splitCard;
        // newHand.cards[1] = getCard(requestId);
        // request.playerHands.push(newHand);
    }


    function hit(uint256 requestId, uint256 handIndex) public {
        GameRequest storage request = gameRequests[requestId];
        require(request.player == msg.sender, "Not the player's game");
        require(handIndex < request.playerHands.length, "Invalid hand index");
        require(!request.playerHands[handIndex].hasStood, "Cannot hit on this hand");
        require(calculateHandValue(request.playerHands[handIndex].cards) < 21, "Hand value already 21 or more");
        require(!request.gameEnded, "Game already ended");

        uint256 newCard = getCard(requestId);
        request.playerHands[handIndex].cards.push(newCard);
        request.playerHands[handIndex].actions.push("hit"); // Remember to track the action

        uint256 handValue = calculateHandValue(request.playerHands[handIndex].cards);

        if (handValue > 21) {
            // Player busts
            finalizeHand(requestId, 0);
        } else if (handValue == 21) {
            // If player hits 21, play dealer's hand and end the game
            stand(requestId, handIndex); // Mark the player's hand as stood
            playDealerHand(requestId);   // Play out the dealer's hand
        }
    }

    function stand(uint256 requestId, uint256 handIndex) public {
        GameRequest storage request = gameRequests[requestId];
        require(request.player == msg.sender, "Not the player's game");
        require(handIndex < request.playerHands.length, "Invalid hand index");
        require(!request.gameEnded, "Game already ended");

        request.playerHands[handIndex].actions.push("stand");
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

        endGame(requestId, handIndex, outcome,false);
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
                totalValue += cardValue;
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

    function endGame(uint256 requestId, uint256 handIndex, string memory outcome, bool isSurrender) internal {
        GameRequest storage request = gameRequests[requestId];
        PlayerHand storage hand = request.playerHands[handIndex];
        uint256 payout;
        uint256 dealerHandValue = calculateHandValue(request.dealerCards);
        uint256 playerHandValue = calculateHandValue(hand.cards);
        bool isPlayerBlackjack = (hand.cards.length == 2 && playerHandValue == 21);
        bool isDealerBlackjack = (request.dealerCards.length == 2 && dealerHandValue == 21);
        if (isSurrender) {
            // In case of surrender, refund half of the bet.
            uint256 refundAmount = hand.betAmount / 2;
            bjtToken.transfer(request.player, refundAmount);
            outcome = "Player surrender";
            payout = refundAmount; // Half the bet amount as the player surrendered
        } else {
            if (hand.hasInsurance && isDealerBlackjack) {
                uint256 insurancePayout = hand.betAmount / 2 * 2; // Insurance bet is half of the original bet and pays 2:1
                bjtToken.transfer(request.player, insurancePayout);
                payout += insurancePayout;
                }
            if (isPlayerBlackjack && !isDealerBlackjack) {
                uint256 blackjackPayout = hand.betAmount * 3 / 2;
                bjtToken.transfer(request.player, blackjackPayout);
                outcome = "Player blackjack";
                payout = blackjackPayout;
            } else if (playerHandValue < 21 && (playerHandValue > dealerHandValue || dealerHandValue > 21)) {
                uint256 winnings = hand.betAmount * 2;
                bjtToken.transfer(request.player, winnings);
                outcome = "Player wins";
                payout = winnings;
            } else if (playerHandValue > 21 || (dealerHandValue <= 21 && dealerHandValue > playerHandValue)) {
                outcome = "Player loses";
                payout = 0;
            } else if (playerHandValue == dealerHandValue) {
                bjtToken.transfer(request.player, hand.betAmount);
                outcome = "Push";
                payout = hand.betAmount;
            } else {
                outcome = "Player loses";
                payout = 0;
            }
        }
        // Log the result of this hand
        GameOutcome memory result = GameOutcome({
            round: requestId,
            betAmount: hand.betAmount,
            playerHand: hand.cards,
            dealerHand: request.dealerCards,
            actions: hand.actions, // You need to implement logic to track actions
            outcome: Outcome({
                status: outcome,
                payout: payout
            })
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
    function takeInsurance(uint256 requestId) public {
        GameRequest storage request = gameRequests[requestId];
        PlayerHand storage hand = request.playerHands[0]; // assuming single hand for simplicity
        require(request.dealerCard == 1, "Dealer's upcard is not an Ace"); // 1 represents an Ace
        require(hand.betAmount > 0 && !hand.hasInsurance, "Cannot take insurance");
        uint256 insuranceBet = hand.betAmount / 2;
        require(bjtToken.balanceOf(msg.sender) >= insuranceBet, "Insufficient BJT balance for insurance");
        bjtToken.transferFrom(msg.sender, address(this), insuranceBet);
        request.playerHands[0].actions.push("insurance");
        hand.hasInsurance = true;
    }
    // function doubleDown(uint256 requestId) public {
    //     GameRequest storage request = gameRequests[requestId];
    //     PlayerHand storage hand = request.playerHands[0]; // assuming single hand for simplicity
    //     require(hand.cards.length == 2, "Can only double down on first two cards");
    //     require(!hand.hasDoubledDown, "Already doubled down");
    //     uint256 additionalBet = hand.betAmount;
    //     require(bjtToken.balanceOf(msg.sender) >= additionalBet, "Insufficient BJT balance to double down");
    //     bjtToken.transferFrom(msg.sender, address(this), additionalBet);

    //     hand.betAmount *= 2;
    //     hand.hasDoubledDown = true;

    //
    //     uint256 newCard = getCard(requestId);
    //     hand.cards.push(newCard);
    //     stand(requestId, 0);
    // }


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
    function surrender(uint256 requestId) public {
        GameRequest storage request = gameRequests[requestId];
        require(request.player == msg.sender, "Not the player's game");
        require(request.playerHands[0].cards.length == 2, "Surrender only allowed as first action");
        require(!request.gameEnded, "Game already ended");
        request.playerHands[0].actions.push("surrender");
        request.gameEnded = true;
        endGame(requestId, 0, "Player surrender",true);
    }

    function getGameState(uint256 requestId) public view returns (uint256[][] memory playerHands, uint256[] memory dealerCards, string[] memory statuses,  uint256[] memory betSizes) {
        require(gameRequests[requestId].player != address(0), "Game request not found");

        GameRequest storage request = gameRequests[requestId];
        uint256 numHands = request.playerHands.length;
        playerHands = new uint256[][](numHands);
        statuses = new string[](numHands);
        betSizes = new uint256[](numHands);

        for (uint256 i = 0; i < numHands; i++) {
            playerHands[i] = request.playerHands[i].cards;
            betSizes[i] = request.playerHands[i].betAmount;
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
        return (playerHands, dealerCards, statuses, betSizes);
    }
    function uintArrayToString(uint256[] memory arr) internal pure returns (string memory) {
    if (arr.length == 0) return "";

    string memory result = toString(arr[0]);
    for (uint256 i = 1; i < arr.length; i++) {
        result = string(abi.encodePacked(result, ", ", toString(arr[i])));
    }
    return result;
    }

    function toString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }
    function stringArrayToString(string[] memory arr) internal pure returns (string memory) {
        if (arr.length == 0) return "[]";

        string memory result = "[\"";
        result = string(abi.encodePacked(result, arr[0], "\""));

        for (uint256 i = 1; i < arr.length; i++) {
            result = string(abi.encodePacked(result, ", \"", arr[i], "\""));
        }

        result = string(abi.encodePacked(result, "]"));
        return result;
    }
    function getGameHistory(address player) public view returns (string[] memory) {
        GameOutcome[] memory outcomes = gameHistories[player];
        string[] memory historyStrings = new string[](outcomes.length);

        for (uint256 i = 0; i < outcomes.length; i++) {
            string memory playerHand = uintArrayToString(outcomes[i].playerHand);
            string memory dealerHand = uintArrayToString(outcomes[i].dealerHand);
            string memory actions = stringArrayToString(outcomes[i].actions);
            string memory round = toString(outcomes[i].round);
            string memory betAmount = toString(outcomes[i].betAmount);
            string memory outcome = string(abi.encodePacked(
                "{ \"round\": ", round,
                ", \"betAmount\": ", betAmount,
                ", \"playerHand\": [", playerHand, "]",
                ", \"dealerHand\": [", dealerHand, "]",
                ", \"actions\": [", actions, "]",
                ", \"outcome\": { \"status\": \"", outcomes[i].outcome.status,
                "\", \"payout\": ", toString(outcomes[i].outcome.payout), " } }"
            ));
            historyStrings[i] = outcome;
        }

        return historyStrings;
    }
    function getRequestIdsForUser(address user) public view returns (uint256[] memory) {
        return userRequestIds[user];
    }
}
