import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [userAddress, setUserAddress] = useState("");
    const [gameInProgress, setGameInProgress] = useState(false);
    const [betAmount, setBetAmount] = useState(0);
    const [gameOutcome, setGameOutcome] = useState("");
    const [chainId, setChainId] = useState("");
    const [gameHist, setGameHist] = useState([]);
    const [awaitingContract, setAwaitingContract] = useState(false);
    const [verified, setVerified] = useState(false);
    const [checkingVerified, setCheckingVerified] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [requestId, setRequestId] = useState("");
    const [dealerCardsTemp, setDealerCardsTemp] = useState([]);
    const [playerCardsTemp, setPlayerCardsTemp] = useState([]);
    const [gameOutcomeTemp, setGameOutcomeTemp] = useState("");
    const [payoutAmount, setPayoutAmount] = useState(0);
    const [awaitingContractMessage, setAwaitingContractMessage] = useState("Awaiting Contract Response...");
    const [playingWithAI, setPlayingWithAI] = useState(false);
    const [recommendation, setRecommendation] = useState("");

    const signIn = (credentials) => {
        setUserAddress(credentials);
        setAwaitingContract(true);
        //updateGameHist
    };

    const setGameState = (gameState) => {
        setGameInProgress(gameState);
        if (!gameState){
            setGameHist([]);
        }
    }

    const updateGameOutcome = (outcome) => {
        setGameOutcome(outcome);
        //setAwaitingContract(true);
        setGameInProgress(false);
    }

    const updateChainId = (val) => {
        setChainId(val);
        setAwaitingContract(true);
    }

    return (
        <AuthContext.Provider value={{ userAddress, signIn, 
        gameInProgress, setGameState, 
        betAmount, setBetAmount, 
        gameHist, setGameHist,
        gameOutcome, updateGameOutcome, 
        chainId, updateChainId,
        awaitingContract, setAwaitingContract,
        verified, setVerified,
        checkingVerified, setCheckingVerified,
        userBalance, setUserBalance,
        requestId, setRequestId,
        dealerCardsTemp, setDealerCardsTemp,
        playerCardsTemp, setPlayerCardsTemp,
        gameOutcomeTemp, setGameOutcomeTemp,
        payoutAmount, setPayoutAmount,
        awaitingContractMessage, setAwaitingContractMessage,
        gameHist, setGameHist,
        playingWithAI, setPlayingWithAI,
        recommendation, setRecommendation }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    return useContext(AuthContext);
}