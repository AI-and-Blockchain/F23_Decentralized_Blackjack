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
        setAwaitingContract(true);
        setGameInProgress(false);
    }

    const updateBetAmount = (event, val) => {
        const numericValue = Number(val);
        if (numericValue >= 0) {
          setBetAmount(numericValue);
        }
    };

    const updateChainId = (val) => {
        setChainId(val);
        setAwaitingContract(true);
    }

    return (
        <AuthContext.Provider value={{ userAddress, signIn, 
        gameInProgress, setGameState, 
        betAmount, updateBetAmount, 
        gameOutcome, updateGameOutcome, 
        chainId, updateChainId,
        awaitingContract, setAwaitingContract,
        verified, setVerified }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    return useContext(AuthContext);
}