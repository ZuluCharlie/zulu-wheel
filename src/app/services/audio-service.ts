import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SettingsObject, SettingsValue } from "../../main";
import { AudioSettings, AudioSettingsItem, defaultAudioSettings } from "../models/audio-settings";

@Injectable({
    providedIn: 'root'
})
export class AudioService {
    private audioSettings = new BehaviorSubject<AudioSettings>(defaultAudioSettings);
    public readonly audioSettings$ = this.audioSettings.asObservable();

    private audioSettingsLoading = new BehaviorSubject<boolean>(true);
    public readonly audioSettingsLoading$ = this.audioSettingsLoading.asObservable();

    private audioSettingsRefresh = new BehaviorSubject<void>(undefined);
    public readonly countdownSettingsRefresh$ = this.audioSettingsRefresh.asObservable();

    private audioElements: { [sound: string]: HTMLAudioElement | null } = {};

    loadSettings() {
        this.getFullSettings().then(ws => {
            this.audioSettings.next(ws);
            this.audioSettingsLoading.next(false);
            this.loadAudioElements(ws);
        });
    }

    loadAudioElements(ws: AudioSettings) {
        this.audioElements = {};
        this.createAudio(ws.wheelTick, 'wheelTick');
        this.createAudio(ws.winnerAnnounced, 'winnerAnnounced');
        this.createAudio(ws.countdownRunning, 'countdownRunning');
        this.createAudio(ws.giveawayRunning, 'giveawayRunning');
        this.createAudio(ws.winnerConfirmed, 'winnerConfirmed');
        this.createAudio(ws.winnerLapsed, 'winnerLapsed');

        Object.keys(this.audioElements).forEach(k => {
            this.audioElements[k]?.load()
        });
    }

    createAudio(item: AudioSettingsItem, key?: string) {
        if (!item.soundPath) {
            return null;
        }

        const audio = new Audio(item.soundPath);
        audio.volume = item.volume;
        audio.muted = item.muted;

        if (key) {
            if (key === 'giveawayRunning') {
                audio.loop = true;
            }
            this.audioElements[key] = audio;
        }

        audio.load();
        return audio;
    }

    createAndPlayAudio(item: AudioSettingsItem) {
        this.createAudio(item)?.play();
    }

    playAudio(audio: string, reset: boolean) {
        if (!this.audioElements[audio]?.src) {
            return;
        }

        if (reset) {
            this.audioElements[audio].currentTime = 0;
        }

        this.audioElements[audio].play();
    }

    stopAudio(audio: string) {
        if (!this.audioElements[audio]?.src) {
            return;
        }

        this.audioElements[audio].pause();
        this.audioElements[audio].currentTime = 0;
    }

    saveSetting(setting: string, data: AudioSettingsItem) {
        window.electronAPI?.writeSetting(setting, this.mapAudioToSettings(data)).then(() => this.loadSettings());
    }

    forceRefresh() {
        this.audioSettingsRefresh.next();
    }

    private async getFullSettings(): Promise<AudioSettings> {
        let [
            wheelTick,
            winnerAnnounced,
            countdownRunning,
            giveawayRunning,
            winnerConfirmed,
            winnerLapsed
        ] = await Promise.all([
            window.electronAPI?.readSetting('wheelTick'),
            window.electronAPI?.readSetting('winnerAnnounced'),
            window.electronAPI?.readSetting('countdownRunning'),
            window.electronAPI?.readSetting('giveawayRunning'),
            window.electronAPI?.readSetting('winnerConfirmed'),
            window.electronAPI?.readSetting('winnerLapsed'),
        ]);

        return {
            wheelTick: this.mapAudioFromSettings(wheelTick) ?? defaultAudioSettings.wheelTick,
            winnerAnnounced: this.mapAudioFromSettings(winnerAnnounced) ?? defaultAudioSettings.winnerAnnounced,
            countdownRunning: this.mapAudioFromSettings(countdownRunning) ?? defaultAudioSettings.countdownRunning,
            giveawayRunning: this.mapAudioFromSettings(giveawayRunning) ?? defaultAudioSettings.giveawayRunning,
            winnerConfirmed: this.mapAudioFromSettings(winnerConfirmed) ?? defaultAudioSettings.winnerConfirmed,
            winnerLapsed: this.mapAudioFromSettings(winnerLapsed) ?? defaultAudioSettings.winnerLapsed
        }
    }

    private mapAudioFromSettings(item: SettingsValue) {
        if (!item) {
            return null;
        }

        const obj = item as SettingsObject;
        return {
            soundPath: obj['soundPath'] as string,
            volume: obj['volume'] as number,
            muted: obj['muted'] as boolean
        };
    }

    private mapAudioToSettings(item: AudioSettingsItem) {
        if (!item) {
            return null;
        }

        return {
            ['soundPath']: item.soundPath as SettingsValue,
            ['volume']: item.volume as SettingsValue,
            ['muted']: item.muted as SettingsValue
        };
    }
}
