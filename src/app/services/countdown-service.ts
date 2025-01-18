import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SettingsValue } from "../../main";
import { CountdownSettings, defaultCountdownSettings } from "../models/countdown-settings";

@Injectable({
    providedIn: 'root'
})
export class CountdownService {
    private countdownSettings = new BehaviorSubject<CountdownSettings>(defaultCountdownSettings);
    public readonly countdownSettings$ = this.countdownSettings.asObservable();

    private countdownSettingsLoading = new BehaviorSubject<boolean>(true);
    public readonly countdownSettingsLoading$ = this.countdownSettingsLoading.asObservable();

    private countdownSettingsRefresh = new BehaviorSubject<void>(undefined);
    public readonly countdownSettingsRefresh$ = this.countdownSettingsRefresh.asObservable();

    loadSettings() {
        this.getFullSettings().then(ws => {
            this.countdownSettings.next(ws);
            this.countdownSettingsLoading.next(false);
        });
    }

    saveSetting(setting: string, data: SettingsValue) {
        window.electronAPI?.writeSetting(setting, data).then(() => this.loadSettings());
    }

    forceRefresh() {
        this.countdownSettingsRefresh.next();
    }

    private async getFullSettings(): Promise<CountdownSettings> {
        let [
            countdown,
            countdownTimer,
            countdownMessage,
            countdownShowTimer,
            countdownShowTimerBar
        ] = await Promise.all([
            window.electronAPI?.readSetting('countdown'),
            window.electronAPI?.readSetting('countdownTimer'),
            window.electronAPI?.readSetting('countdownMessage'),
            window.electronAPI?.readSetting('countdownShowTimer'),
            window.electronAPI?.readSetting('countdownShowTimerBar')
        ]);

        return {
            countdown: countdown as boolean ?? defaultCountdownSettings.countdown,
            countdownTimer: countdownTimer as number ?? defaultCountdownSettings.countdownTimer,
            countdownMessage: countdownMessage as string ?? defaultCountdownSettings.countdownMessage,
            countdownShowTimer: countdownShowTimer as boolean ?? defaultCountdownSettings.countdownShowTimer,
            countdownShowTimerBar: countdownShowTimerBar as boolean ?? defaultCountdownSettings.countdownShowTimerBar,
        }
    }
}