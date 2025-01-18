import { Injectable } from "@angular/core";
import { defaultStaticWheel, defaultStaticWheelItem, StaticWheel, StaticWheelItem } from "../models/static-wheel";
import { BehaviorSubject } from "rxjs";
import { SettingsValue, SettingsObject } from "../../main";
import { StyleService } from "./style-service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
    providedIn: 'root'
})
export class StaticWheelService {
    private allStaticWheels = new BehaviorSubject<StaticWheel[]>([]);
    public readonly allStaticWheels$ = this.allStaticWheels.asObservable();

    private allStaticWheelsCount = new BehaviorSubject<number>(0);
    public readonly allStaticWheelsCount$ = this.allStaticWheelsCount.asObservable();

    private currentStaticWheel = new BehaviorSubject<StaticWheel | null>(null);
    public readonly currentStaticWheel$ = this.currentStaticWheel.asObservable();

    private currentStaticWheelIndex = new BehaviorSubject<number | null>(null);
    public readonly currentStaticWheelIndex$ = this.currentStaticWheelIndex.asObservable();
  
    defaultFont: string;
  
    constructor(private styleService: StyleService) {
      this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(style => {
        this.defaultFont = style.globalFont;
      });
    }

    getAllStaticWheels() {
        return window.electronAPI?.readSetting('staticWheels').then(g => {
            const staticWheels = this.mapStaticWheelsFromSettings(g);
            this.allStaticWheels.next(staticWheels);
            this.allStaticWheelsCount.next(staticWheels.length);

            if (staticWheels.length > 0) {
                this.getCurrentStaticWheel();
            }
            else {
                this.currentStaticWheel.next(null);
            }
        });
    }

    getCurrentStaticWheel() {
        return window.electronAPI?.readSetting('currentStaticWheel').then(index => {
            this.currentStaticWheelIndex.next(index as number);
            window.electronAPI?.readSetting(`staticWheels[${index}]`).then(g => {
                this.currentStaticWheel.next(this.mapStaticWheelFromSettings(g));
            })
        });
    }

    setCurrentStaticWheel(index: number) {
        return window.electronAPI?.writeSetting('currentStaticWheel', index).then(() => this.getCurrentStaticWheel());
    }

    addStaticWheel() {
        const wheelsCount = this.allStaticWheelsCount.value;
        return window.electronAPI?.writeSetting(`staticWheels[${wheelsCount}]`, this.mapStaticWheelToSettings(defaultStaticWheel)).then(() => {
            this.getAllStaticWheels();
            this.setCurrentStaticWheel(wheelsCount);
        });
    }

    deleteStaticWheel(index: number) {
        return window.electronAPI?.writeSetting('staticWheels', this.mapStaticWheelsToSettings(this.allStaticWheels.value.filter((g, i) => i !== index))).then(() => this.getAllStaticWheels());
    }

    saveStaticWheelSetting(setting: string, value: SettingsValue, index: number) {
        return window.electronAPI?.writeSetting(`staticWheels[${index}].${setting}`, value).then(() => this.getAllStaticWheels());
    }

    saveStaticWheelItems(setting: string, value: StaticWheelItem[], index: number) {
        return window.electronAPI?.writeSetting(`staticWheels[${index}].${setting}`, this.mapStaticWheelItemsToSettings(value)).then(() => this.getAllStaticWheels());
    }

    saveStaticWheelItemSetting(setting: string, value: SettingsValue, wheelIndex: number, itemIndex: number) {
        return window.electronAPI?.writeSetting(`staticWheels[${wheelIndex}].items[${itemIndex}].${setting}`, value).then(() => this.getAllStaticWheels());
    }

    saveAllStaticWheels(staticWheels: StaticWheel[]) {
        return window.electronAPI?.writeSetting('staticWheels', this.mapStaticWheelsToSettings(staticWheels)).then(() => this.getAllStaticWheels());
    }

    addStaticWheelItem(wheelIndex: number) {
        const currentWheel  = this.currentStaticWheel.value;
        const itemsCount = currentWheel!.items.length;
        const item = {...defaultStaticWheelItem, itemFont: this.defaultFont};
        return window.electronAPI?.writeSetting(`staticWheels[${wheelIndex}].items[${itemsCount}]`, this.mapStaticWheelItemToSettings(item)).then(() => {
            this.getAllStaticWheels();
        });
    }

    deleteStaticWheelItem(wheelIndex: number, itemIndex: number) {
        return window.electronAPI?.writeSetting(`staticWheels[${wheelIndex}].items`,
            this.mapStaticWheelItemsToSettings(this.allStaticWheels.value[wheelIndex].items.filter((g, i) => i !== itemIndex))).then(() => this.getAllStaticWheels());
    }

    private mapStaticWheelFromSettings(item: SettingsValue) {
        const obj = item as SettingsObject;
        return {
            name: obj['name'] as string,
            featureChatters: this.mapStringArr(obj['featureChatters']),
            centerImagePath: obj['centerImagePath'] as string,
            overlayImagePath: obj['overlayImagePath'] as string,
            wheelTickSoundPath: obj['wheelTickSoundPath'] as string,
            wheelTickSoundVolume: obj['wheelTickSoundVolume'] as number,
            wheelTickSoundMute: obj['wheelTickSoundMute'] as boolean,
            pointerAngle: obj['pointerAngle'] as number,
            idleSpeed: obj['idleSpeed'] as number,
            minPies: obj['minPies'] as number,
            itemFont: obj['itemFont'] as string,
            labelRadius: obj['labelRadius'] as number,

            items: this.mapStaticWheelItemsFromSettings(obj['items'])
        };
    }

    private mapStaticWheelToSettings(wheel: StaticWheel) {
        return {
            ['name']: wheel.name as SettingsValue,
            ['featureChatters']: wheel.featureChatters.map((w: string) => w as SettingsValue) as SettingsValue,
            ['centerImagePath']: wheel.centerImagePath as SettingsValue,
            ['overlayImagePath']: wheel.overlayImagePath as SettingsValue,
            ['wheelTickSoundPath']: wheel.wheelTickSoundPath as SettingsValue,
            ['wheelTickSoundVolume']: wheel.wheelTickSoundVolume as SettingsValue,
            ['wheelTickSoundMute']: wheel.wheelTickSoundMute as SettingsValue,
            ['pointerAngle']: wheel.pointerAngle as SettingsValue,
            ['idleSpeed']: wheel.idleSpeed as SettingsValue,
            ['minPies']: wheel.minPies as SettingsValue,
            ['itemFont']: wheel.itemFont as SettingsValue,
            ['labelRadius']: wheel.labelRadius as SettingsValue,

            items: this.mapStaticWheelItemsToSettings(wheel.items)
        };
    }

    private mapStaticWheelItemFromSettings(item: SettingsValue) {
        const obj = item as SettingsObject;
        return {
            label: obj['label'] as string,
            labelColor: obj['labelColor'] as string,
            backgroundColor: obj['backgroundColor'] as string,
            imagePath: obj['imagePath'] as string,
            imageRadius: obj['imageRadius'] as number,
            imageRotation: obj['imageRotation'] as number,
            imageOpacity: obj['imageOpacity'] as number,
            imageScale: obj['imageScale'] as number,
            itemWeight: obj['itemWeight'] as number,
            itemWinningMessage: obj['itemWinningMessage'] as string,
            itemWinningStreamerbotActionId: obj['itemWinningStreamerbotActionId'] as string,
            itemWinningSound: obj['itemWinningSound'] as string,
            itemWinningSoundVolume: obj['itemWinningSoundVolume'] as number,
            itemWinningSoundMute: obj['itemWinningSoundMute'] as boolean,
            itemWinningImage: obj['itemWinningImage'] as string
        };
    }

    private mapStaticWheelItemToSettings(item: StaticWheelItem) {
        return {
            ['label']: item.label as SettingsValue,
            ['labelColor']: item.labelColor as SettingsValue,
            ['backgroundColor']: item.backgroundColor as SettingsValue,
            ['imagePath']: item.imagePath as SettingsValue,
            ['imageRadius']: item.imageRadius as SettingsValue,
            ['imageRotation']: item.imageRotation as SettingsValue,
            ['imageOpacity']: item.imageOpacity as SettingsValue,
            ['imageScale']: item.imageScale as SettingsValue,
            ['itemWeight']: item.itemWeight as SettingsValue,
            ['itemWinningMessage']: item.itemWinningMessage as SettingsValue,
            ['itemWinningStreamerbotActionId']: item.itemWinningStreamerbotActionId as SettingsValue,
            ['itemWinningSound']: item.itemWinningSound as SettingsValue,
            ['itemWinningSoundVolume']: item.itemWinningSoundVolume as SettingsValue,
            ['itemWinningSoundMute']: item.itemWinningSoundMute as SettingsValue,
            ['itemWinningImage']: item.itemWinningImage as SettingsValue
        };
    }

    private mapStaticWheelsFromSettings(wheels: SettingsValue): StaticWheel[] {
        return (wheels as SettingsValue[]).map((item: SettingsValue) => {
            return this.mapStaticWheelFromSettings(item);
        });
    }

    private mapStaticWheelsToSettings(wheels: StaticWheel[]): SettingsValue {
        return wheels.map((item: StaticWheel) => {
            return this.mapStaticWheelToSettings(item);
        });
    }

    private mapStaticWheelItemsFromSettings(items: SettingsValue): StaticWheelItem[] {
        return (items as SettingsValue[]).map((item: SettingsValue) => {
            return this.mapStaticWheelItemFromSettings(item);
        });
    }

    private mapStaticWheelItemsToSettings(items: StaticWheelItem[]): SettingsValue {
        return items.map((item: StaticWheelItem) => {
            return this.mapStaticWheelItemToSettings(item);
        });
    }

    private mapStringArr(stringArr: SettingsValue): string[] {
        return (stringArr as SettingsValue[]).map((item: SettingsValue) => item as string);
    }
}