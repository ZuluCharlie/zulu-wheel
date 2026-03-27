import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Item } from "../spin-wheel-ts/item";
import { SettingsValue, SettingsObject } from "../../main";

@Injectable({
    providedIn: 'root'
})
export class WheelService {
    private wheelItems = new BehaviorSubject<Partial<Item>[]>([]);
    public readonly wheelItems$ = this.wheelItems.asObservable();

    private wheelIsSpinning = new BehaviorSubject<boolean>(false);
    public readonly wheelIsSpinning$ = this.wheelIsSpinning.asObservable();

    constructor() {
        this.getSavedItems().then((items) => this.wheelItems.next(items));
    }

    updateItems(items: Partial<Item>[]) {
        this.saveItems(items);
        this.wheelItems.next(items);
    }

    updateIsSpinning(isSpinning: boolean) {
        this.wheelIsSpinning.next(isSpinning);
    }

    async getSavedItems(): Promise<Partial<Item>[]> {
        const savedItems = await window.electronAPI?.readSetting('currentEntries');
        return this.mapWheelItemsFromSettings(savedItems ?? []);
    }

    async saveItems(items: Partial<Item>[]) {
        return window.electronAPI?.writeSetting('currentEntries', this.mapWheelItemsToSettings(items));
    }

    private mapWheelItemFromSettings(item: SettingsValue): Partial<Item> {
        const obj = item as SettingsObject;
        return {
            label: obj['label'] as string,
            labelColor: obj['labelColor'] as string,
            backgroundColor: obj['backgroundColor'] as string,
            image: this.createImage(obj['imagePath'] as string),
            imageRadius: obj['imageRadius'] as number,
            imageRotation: obj['imageRotation'] as number,
            imageOpacity: obj['imageOpacity'] as number,
            imageScale: obj['imageScale'] as number,
        };
    }

    private mapWheelItemToSettings(item: Partial<Item>) {
        return {
            ['label']: item.label as SettingsValue,
            ['labelColor']: item.labelColor as SettingsValue,
            ['backgroundColor']: item.backgroundColor as SettingsValue,
            ['imagePath']: item.image?.src as SettingsValue,
            ['imageRadius']: item.imageRadius as SettingsValue,
            ['imageRotation']: item.imageRotation as SettingsValue,
            ['imageOpacity']: item.imageOpacity as SettingsValue,
            ['imageScale']: item.imageScale as SettingsValue,
        };
    }

    private mapWheelItemsFromSettings(items: SettingsValue): Partial<Item>[] {
        return (items as SettingsValue[]).map((item: SettingsValue) => {
            return this.mapWheelItemFromSettings(item);
        });
    }

    private mapWheelItemsToSettings(items: Partial<Item>[]): SettingsValue {
        return items.map((item: Partial<Item>) => {
            return this.mapWheelItemToSettings(item);
        });
    }

    private createImage(imageUrl: string) {
        if (!imageUrl) {
            return null;
        }

        const image = new Image(70, 70);
        image.src = imageUrl;
        return image;
    }
}