export interface AudioSettings {
    wheelTick: AudioSettingsItem;
    winnerAnnounced: AudioSettingsItem;
    countdownRunning: AudioSettingsItem;
    giveawayRunning: AudioSettingsItem;
    winnerConfirmed: AudioSettingsItem;
    winnerLapsed: AudioSettingsItem;
}

export const defaultAudioSettings: AudioSettings = {
    wheelTick: { soundPath: 'assets/sounds/tick.mp3', volume: 0.75, muted: false },
    winnerAnnounced: { soundPath: 'assets/sounds/kids_cheering.mp3', volume: 0.25, muted: false },
    countdownRunning: { soundPath: '', volume: 1.0, muted: false },
    giveawayRunning: { soundPath: '', volume: 1.0, muted: false },
    winnerConfirmed: { soundPath: '', volume: 1.0, muted: false },
    winnerLapsed: { soundPath: '', volume: 1.0, muted: false },
}

export interface AudioSettingsItem {
    soundPath: string | null;
    volume: number;
    muted: boolean;
}