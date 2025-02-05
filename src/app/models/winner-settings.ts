export enum WinnerRemoveType {
    Keep = 0,
    RemoveOne = 1,
    RemoveAll = 2
}

export interface WinnerSettings {
    winnerImagePath: string;
    winnerMessage: string;
    winnerRequireConfirmation: boolean;
    winnerRequireConfirmationMessage: string;
    winnerRequireConfirmationLapsedMessage: string;
    winnerRequireConfirmationTimer: number;
    winnerRemove: WinnerRemoveType;
    useTwitchProfileImage: boolean;
    showWinnerMessages: boolean;
}

export const defaultWinnerSettings: WinnerSettings = {
    winnerImagePath: '',
    winnerMessage: '${winner} has won the giveaway with ${entryCount} entries!',
    winnerRequireConfirmation: false,
    winnerRequireConfirmationMessage: 'Hurry up and claim your prize!',
    winnerRequireConfirmationLapsedMessage: 'Too late!',
    winnerRequireConfirmationTimer: 30,
    winnerRemove: WinnerRemoveType.RemoveOne,
    useTwitchProfileImage: true,
    showWinnerMessages: true
}
