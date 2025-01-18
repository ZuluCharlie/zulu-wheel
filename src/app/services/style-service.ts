import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SettingsValue } from "../../main";
import { StyleSettings, defaultStyleSettings } from "../models/style-settings";

@Injectable({
    providedIn: 'root'
})
export class StyleService {
    private styleSettings = new BehaviorSubject<StyleSettings>(defaultStyleSettings);
    public readonly styleSettings$ = this.styleSettings.asObservable();

    private styleSettingsLoading = new BehaviorSubject<boolean>(true);
    public readonly styleSettingsLoading$ = this.styleSettingsLoading.asObservable();

    private styleSettingsRefresh = new BehaviorSubject<void>(undefined);
    public readonly styleSettingsRefresh$ = this.styleSettingsRefresh.asObservable();

    

    loadSettings() {
        this.getFullSettings().then(ws => {
            this.styleSettings.next(ws);
            this.styleSettingsLoading.next(false);
        });
    }

    saveSetting(setting: string, data: SettingsValue) {
        window.electronAPI?.writeSetting(setting, data).then(() => this.loadSettings());
    }

    forceRefresh() {
        this.styleSettingsRefresh.next();
    }

    private async getFullSettings(): Promise<StyleSettings> {
        let [
            wheelName,
            globalFont,
            globalFontColor,
            globalBackgroundColor,
            globalButtonFontColor,
            globalButtonColor,
            globalInputFontColor,
            globalInputBackgroundColor
        ] = await Promise.all([
            window.electronAPI?.readSetting('wheelName'),
            window.electronAPI?.readSetting('globalFont'),
            window.electronAPI?.readSetting('globalFontColor'),
            window.electronAPI?.readSetting('globalBackgroundColor'),
            window.electronAPI?.readSetting('globalButtonFontColor'),
            window.electronAPI?.readSetting('globalButtonColor'),
            window.electronAPI?.readSetting('globalInputFontColor'),
            window.electronAPI?.readSetting('globalInputBackgroundColor'),
        ]);

        return {
            wheelName: wheelName as string ?? defaultStyleSettings.wheelName,
            globalFont: globalFont as string ?? defaultStyleSettings.globalFont,
            globalFontColor: globalFontColor as string ?? defaultStyleSettings.globalFontColor,
            globalBackgroundColor: globalBackgroundColor as string ?? defaultStyleSettings.globalBackgroundColor,
            globalButtonFontColor: globalButtonFontColor as string ?? defaultStyleSettings.globalButtonFontColor,
            globalButtonColor: globalButtonColor as string ?? defaultStyleSettings.globalButtonColor,
            globalInputFontColor: globalInputFontColor as string ?? defaultStyleSettings.globalInputFontColor,
            globalInputBackgroundColor: globalInputBackgroundColor as string ?? defaultStyleSettings.globalInputBackgroundColor,
        }
    }
}