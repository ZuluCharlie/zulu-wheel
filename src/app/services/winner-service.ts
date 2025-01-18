import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SettingsValue } from "../../main";
import { defaultWinnerSettings, WinnerSettings } from "../models/winner-settings";

@Injectable({
    providedIn: 'root'
})
export class WinnerService {
    private winnerSettings = new BehaviorSubject<WinnerSettings>(defaultWinnerSettings);
    public readonly winnerSettings$ = this.winnerSettings.asObservable();

    private winnerSettingsLoading = new BehaviorSubject<boolean>(true);
    public readonly winnerSettingsLoading$ = this.winnerSettingsLoading.asObservable();

    private winnerSettingsRefresh = new BehaviorSubject<void>(undefined);
    public readonly winnerSettingsRefresh$ = this.winnerSettingsRefresh.asObservable();

    loadSettings() {
        this.getFullSettings().then(ws => {
            this.winnerSettings.next(ws);
            this.winnerSettingsLoading.next(false);
        });
    }

    saveSetting(setting: string, data: SettingsValue) {
        window.electronAPI?.writeSetting(setting, data).then(() => this.loadSettings());
    }

    forceRefresh() {
        this.winnerSettingsRefresh.next();
    }

    private async getFullSettings(): Promise<WinnerSettings> {
        let [
            winnerImagePath,
            winnerMessage,
            winnerRequireConfirmation,
            winnerRequireConfirmationMessage,
            winnerRequireConfirmationLapsedMessage,
            winnerRequireConfirmationTimer,
            winnerRemove,
            useTwitchProfileImage,
            showWinnerMessages
        ] = await Promise.all([
            window.electronAPI?.readSetting('winnerImagePath'),
            window.electronAPI?.readSetting('winnerMessage'),
            window.electronAPI?.readSetting('winnerRequireConfirmation'),
            window.electronAPI?.readSetting('winnerRequireConfirmationMessage'),
            window.electronAPI?.readSetting('winnerRequireConfirmationLapsedMessage'),
            window.electronAPI?.readSetting('winnerRequireConfirmationTimer'),
            window.electronAPI?.readSetting('winnerRemove'),
            window.electronAPI?.readSetting('useTwitchProfileImage'),
            window.electronAPI?.readSetting('showWinnerMessages'),
        ]);

        return {
            winnerImagePath: winnerImagePath as string ?? defaultWinnerSettings.winnerImagePath,
            winnerMessage: winnerMessage as string ?? defaultWinnerSettings.winnerMessage,
            winnerRequireConfirmation: winnerRequireConfirmation as boolean ?? defaultWinnerSettings.winnerRequireConfirmation,
            winnerRequireConfirmationMessage: winnerRequireConfirmationMessage as string ?? defaultWinnerSettings.winnerRequireConfirmationMessage,
            winnerRequireConfirmationLapsedMessage: winnerRequireConfirmationLapsedMessage as string ?? defaultWinnerSettings.winnerRequireConfirmationLapsedMessage,
            winnerRequireConfirmationTimer: winnerRequireConfirmationTimer as number ?? defaultWinnerSettings.winnerRequireConfirmationTimer,
            winnerRemove: winnerRemove as number ?? defaultWinnerSettings.winnerRemove,
            useTwitchProfileImage: useTwitchProfileImage as boolean ?? defaultWinnerSettings.useTwitchProfileImage,
            showWinnerMessages: showWinnerMessages as boolean ?? defaultWinnerSettings.showWinnerMessages,
        }
    }
}