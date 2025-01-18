export interface CountdownSettings {
    countdown: boolean;
    countdownTimer: number;
    countdownMessage: string;
    countdownShowTimer: boolean;
    countdownShowTimerBar: boolean;
}

export const defaultCountdownSettings: CountdownSettings = {
    countdown: false,
    countdownTimer: 3,
    countdownMessage: 'Spinning in...',
    countdownShowTimer: true,
    countdownShowTimerBar: true
}