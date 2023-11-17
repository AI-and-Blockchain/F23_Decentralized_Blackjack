import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [userAddress, setUserAddress] = useState("");
    const [gameInProgress, setGameInProgress] = useState(false);
    const [betAmount, setBetAmount] = useState(0);
    const [gameOutcome, setGameOutcome] = useState("");
    const [chainId, setChainId] = useState("");

    const signIn = (credentials) => {
        // Implement your sign-in logic here
        setUserAddress(credentials);
    };

    const setGameState = (gameState) => {
        setGameInProgress(gameState);
    }

    const updateGameOutcome = (outcome) => {
        setGameOutcome(outcome);
    }

    const updateBetAmount = (event, val) => {
        const numericValue = Number(val);
        if (numericValue >= 0) {
          setBetAmount(numericValue);
        }
    };

    const updateChainId = (val) => {
        setChainId(val);
    }

    return (
        <AuthContext.Provider value={{ userAddress, signIn, gameInProgress, setGameState, betAmount, updateBetAmount, gameOutcome, updateGameOutcome, chainId, updateChainId }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    return useContext(AuthContext);
}