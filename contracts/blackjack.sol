// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./Authenticator.sol";

contract BlackjackWithVRFv2 is VRFConsumerBaseV2, ConfirmedOwner {
    using SafeMath for uint256;

    Authenticator private authenticator;
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    uint256[] public requestIds;
    uint256 public lastRequestId;

    event BetPlaced(address indexed player, uint256 amount);
    event PlayerAction(address indexed player, string action);
    event CardsDealt(address indexed player, uint256[] playerCards, uint256 dealerCard);
    event GameResult(address indexed player, uint256[] playerCards, uint256 dealerCard);

    struct GameRequest {
        address player;
        bool fulfilled;
        uint256[] playerCards;
        uint256 dealerCard;
    }

    mapping(uint256 => GameRequest) public gameRequests;

    constructor(address authenticatorAddress, uint64 subscriptionId)
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625)
        ConfirmedOwner(msg.sender)
    {
        authenticator = Authenticator(authenticatorAddress);
        COORDINATOR = VRFCoordinatorV2Interface(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625);
        s_subscriptionId = subscriptionId;
    }

    // Function to request dealing cards
    function dealCards() external {
        require(authenticator.isVerified(msg.sender), "Player not verified");
        uint256 requestId = requestRandomWords();
        gameRequests[requestId] = GameRequest({
            player: msg.sender,
            fulfilled: false,
            playerCards: new uint256[](0),
            dealerCard: 0
        });
    }

    // Overridden fulfillRandomWords function
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(gameRequests[_requestId].player != address(0), "Game request not found");

        GameRequest storage request = gameRequests[_requestId];
        request.fulfilled = true;
        uint256[] memory dealtCards = dealCards(_randomWords[0]);
        request.playerCards = new uint256[](2);
        request.playerCards[0] = dealtCards[0];
        request.playerCards[1] = dealtCards[1];
        request.dealerCard = dealtCards[2];

        emit GameResult(request.player, request.playerCards, request.dealerCard);
    }

    // Card dealing logic using random number
    function dealCards(uint256 random) private pure returns (uint256[] memory) {
        uint256[] memory deck = new uint256[](52);
        bool[] memory cardPicked = new bool[](52);

        // Initialize deck
        for (uint256 i = 0; i < 52; i++) {
            deck[i] = i + 1; // Cards numbered from 1 to 52
        }

        uint256[] memory dealtCards = new uint256[](3); // 2 player cards, 1 dealer card
        uint256 index;
        uint256 count = 0;

        // Deal cards
        while (count < 3) {
            index = random % 52;
            if (!cardPicked[index]) {
                dealtCards[count] = deck[index];
                cardPicked[index] = true;
                count++;
            }
            random = uint256(keccak256(abi.encode(random))); // Generate a new pseudo-random number
        }

        return dealtCards;
    }

    // Function to request random words from Chainlink VRF
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

    function bet(uint256 amount) external {
        require(authenticator.isVerified(msg.sender), "Player not verified");
        // Betting logic...
        emit BetPlaced(msg.sender, amount);
    }

    function hit() external {
        require(authenticator.isVerified(msg.sender), "Player not verified");
        // Hit logic...
        emit PlayerAction(msg.sender, "hit");
    }

    function stand() external {
        require(authenticator.isVerified(msg.sender), "Player not verified");
        // Stand logic...
        emit PlayerAction(msg.sender, "stand");
    }
}
