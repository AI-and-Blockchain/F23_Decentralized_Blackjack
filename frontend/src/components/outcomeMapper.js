export function mapOutcome(input) {
    switch (input) {
        case "Player win":
            return "Player Win";
        case "Player wins":
            return "Player Win";
        case "Player loss":
            return "Dealer Win";
        case "Player bust":
            return "Dealer Win";
        case "Player loses":
            return "Dealer Win";
        case "Player surrender":
            return "Surrender";
        default:
            return input;
    }
}