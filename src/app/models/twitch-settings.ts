export interface TwitchSettings {
    twitchAuthToken: string | null;
    twitchEnterCommand: string;
    twitchRemoveCommand: string;
    useTwitchUserColors: boolean;
    showTwitchProfileImages: boolean;
}

export const defaultTwitchSettings: TwitchSettings = {
    twitchAuthToken: null,
    twitchEnterCommand: '!enter',
    twitchRemoveCommand: '!remove',
    useTwitchUserColors: true,
    showTwitchProfileImages: true
}