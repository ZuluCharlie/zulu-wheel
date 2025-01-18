export interface StreamerBotSettings {
    webSocketAddress: string;
    webSocketPort: number;
    webSocketEndpoint: string;
    webSocketPassword: string;
    spinWheelEventName: string;
    addNameEventName: string;
    removeNameEventName: string;
    clearWheelEventName: string;
    confirmWinnerEventName: string;
    winnerRevealedActionId: string | null;
    winnerConfirmedActionId: string | null;
    winnerLapsedActionId: string | null;
    reRollActionId: string | null;
    sendGiveawayDataActionId: string | null;
    streamerbotEntryInstructions: string;
    useStreamerBotColorsOnWheel: boolean;
    showTwitchProfileImages: boolean;
}

export const defaultStreamerBotSettings: StreamerBotSettings = {
    webSocketAddress: '127.0.0.1',
    webSocketPort: 8080,
    webSocketEndpoint: '/',
    webSocketPassword: '',
    spinWheelEventName: 'SpinWheel',
    addNameEventName: 'AddNameToWheel',
    removeNameEventName: 'RemoveNameFromWheel',
    clearWheelEventName: 'ClearWheel',
    confirmWinnerEventName: 'ConfirmWinner',
    winnerRevealedActionId: null,
    winnerConfirmedActionId: null,
    winnerLapsedActionId: null,
    reRollActionId: null,
    sendGiveawayDataActionId: null,
    streamerbotEntryInstructions: '',
    useStreamerBotColorsOnWheel: true,
    showTwitchProfileImages: true
}
