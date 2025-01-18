import { Injectable } from '@angular/core';
import { defaultWheelSettings, WheelEntryType, WheelSettings } from '../models/wheel-settings';
import { WheelDisplayTypes } from '../models/wheel-display-types';
import { SettingsObject, SettingsValue } from '../../main';
import { BehaviorSubject } from 'rxjs';
import { WheelItemSettings } from '../models/wheel-item-settings';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private wheelSettings = new BehaviorSubject<WheelSettings>(defaultWheelSettings);
    public readonly wheelSettings$ = this.wheelSettings.asObservable();

    private wheelSettingsLoading = new BehaviorSubject<boolean>(true);
    public readonly wheelSettingsLoading$ = this.wheelSettingsLoading.asObservable();

    private wheelSettingsRefresh = new BehaviorSubject<void>(undefined);
    public readonly wheelSettingsRefresh$ = this.wheelSettingsRefresh.asObservable();

    loadSettings() {
        this.getFullSettings().then(ws => {
            this.wheelSettings.next(ws);
            this.wheelSettingsLoading.next(false);
        });
    }

    saveSetting(setting: string, data: SettingsValue) {
        window.electronAPI?.writeSetting(setting, data).then(() => this.loadSettings());
    }

    forceRefresh() {
        this.wheelSettingsRefresh.next();
    }

    private async getFullSettings(): Promise<WheelSettings> {
        let [
            wheelBorderWidth,
            minPies,
            minDuration,
            maxDuration,
            minRevolutions,
            maxRevolutions,
            wheelOverlayImagePath,
            wheelCenterImagePath,
            wheelCenterImageSize,
            wheelBackgroundImagePath,
            sideWheelEntries,
            wheelDisplayType,
            easeOutFunction,
            idleSpeed,
            isCounterClockwise,
            wheelEntryType,
            maxTopWheelWedges,
            wheelTickSoundPath,
            entriesFilePath,
            pointerAngle,
            labelRadius,
            itemSettings,
        ] = await Promise.all([
            window.electronAPI?.readSetting('wheelBorderWidth'),
            window.electronAPI?.readSetting('minPies'),
            window.electronAPI?.readSetting('minDuration'),
            window.electronAPI?.readSetting('maxDuration'),
            window.electronAPI?.readSetting('minRevolutions'),
            window.electronAPI?.readSetting('maxRevolutions'),
            window.electronAPI?.readSetting('wheelOverlayImagePath'),
            window.electronAPI?.readSetting('wheelCenterImagePath'),
            window.electronAPI?.readSetting('wheelCenterImageSize'),
            window.electronAPI?.readSetting('wheelBackgroundImagePath'),
            window.electronAPI?.readSetting('sideWheelEntries'),
            window.electronAPI?.readSetting('wheelDisplayType'),
            window.electronAPI?.readSetting('easeOutFunction'),
            window.electronAPI?.readSetting('idleSpeed'),
            window.electronAPI?.readSetting('isCounterClockwise'),
            window.electronAPI?.readSetting('wheelEntryType'),
            window.electronAPI?.readSetting('maxTopWheelWedges'),
            window.electronAPI?.readSetting('wheelTickSoundPath'),
            window.electronAPI?.readSetting('entriesFilePath'),
            window.electronAPI?.readSetting('pointerAngle'),
            window.electronAPI?.readSetting('labelRadius'),
            window.electronAPI?.readSetting('itemSettings')
        ]);

        return {
            wheelBorderWidth: wheelBorderWidth as number ?? defaultWheelSettings.wheelBorderWidth,
            minPies: minPies as number ?? defaultWheelSettings.minPies,
            minDuration: minDuration as number ?? defaultWheelSettings.minDuration,
            maxDuration: maxDuration as number ?? defaultWheelSettings.maxDuration,
            minRevolutions: minRevolutions as number ?? defaultWheelSettings.minRevolutions,
            maxRevolutions: maxRevolutions as number ?? defaultWheelSettings.maxRevolutions,
            wheelOverlayImagePath: wheelOverlayImagePath as string ?? defaultWheelSettings.wheelOverlayImagePath,
            wheelCenterImagePath: wheelCenterImagePath as string ?? defaultWheelSettings.wheelCenterImagePath,
            wheelCenterImageSize: wheelCenterImageSize as number ?? defaultWheelSettings.wheelCenterImageSize,
            wheelBackgroundImagePath: wheelBackgroundImagePath as string ?? defaultWheelSettings.wheelBackgroundImagePath,
            sideWheelEntries: sideWheelEntries as number ?? defaultWheelSettings.sideWheelEntries,
            wheelDisplayType: wheelDisplayType as WheelDisplayTypes ?? defaultWheelSettings.wheelDisplayType,
            easeOutFunction: easeOutFunction as string ?? defaultWheelSettings.easeOutFunction,
            idleSpeed: idleSpeed as number ?? defaultWheelSettings.idleSpeed,
            isCounterClockwise: isCounterClockwise as boolean ?? defaultWheelSettings.isCounterClockwise,
            wheelEntryType: wheelEntryType as WheelEntryType ?? defaultWheelSettings.wheelEntryType,
            maxTopWheelWedges: maxTopWheelWedges as number ?? defaultWheelSettings.maxTopWheelWedges,
            wheelTickSoundPath: wheelTickSoundPath as string ?? defaultWheelSettings.wheelTickSoundPath,
            entriesFilePath: entriesFilePath as string ?? defaultWheelSettings.entriesFilePath,
            pointerAngle: pointerAngle as number ?? defaultWheelSettings.pointerAngle,
            labelRadius: labelRadius as number ?? defaultWheelSettings.labelRadius,

            itemSettings: !itemSettings ? defaultWheelSettings.itemSettings : this.mapItemSettings(itemSettings),
        }
    }

    private mapItemSettings(itemSettings: SettingsValue): WheelItemSettings[] {
        return (itemSettings as SettingsValue[]).map((item: SettingsValue) => {
            const obj = item as SettingsObject;
            return {
                pieColor: obj['pieColor'] as string,
                pieFontColor: obj['pieFontColor'] as string
            };
        });
    }

}