import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { defaultGiveaway, GiveawayDetails } from "../models/giveaway-details";
import { SettingsValue, SettingsObject } from "../../main";

@Injectable({
    providedIn: 'root'
})
export class GiveawayService {
    private allGiveaways = new BehaviorSubject<GiveawayDetails[]>([]);
    public readonly allGiveaways$ = this.allGiveaways.asObservable();

    private allGiveawaysCount = new BehaviorSubject<number>(0);
    public readonly allGiveawaysCount$ = this.allGiveawaysCount.asObservable();

    private currentGiveaway = new BehaviorSubject<GiveawayDetails | null>(null);
    public readonly currentGiveaway$ = this.currentGiveaway.asObservable();

    private currentGiveawayIndex = new BehaviorSubject<number | null>(null);
    public readonly currentGiveawayIndex$ = this.currentGiveawayIndex.asObservable();

    getAllGiveaways() {
        return window.electronAPI?.readSetting('giveaways').then(g => {
            const giveaways = !g ? [] : this.mapGiveawaysFromSettings(g);
            this.allGiveaways.next(giveaways);
            this.allGiveawaysCount.next(giveaways.length);

            if (giveaways.length > 0) {
                this.getCurrentGiveaway();
            }
            else {
                this.currentGiveaway.next(null);
            }
        });
    }

    getCurrentGiveaway() {
        return window.electronAPI?.readSetting('currentGiveaway').then(index => {
            this.currentGiveawayIndex.next(index as number);
            window.electronAPI?.readSetting(`giveaways[${index}]`).then(g => {
                this.currentGiveaway.next(this.mapGiveawayFromSettings(g));
            })
        });
    }

    setCurrentGiveaway(index: number) {
        return window.electronAPI?.writeSetting('currentGiveaway', index).then(() => this.getCurrentGiveaway());
    }

    addGiveaway() {
        return window.electronAPI?.writeSetting(`giveaways[${this.allGiveawaysCount.value}]`, this.mapGiveawayToSettings(defaultGiveaway)).then(() => this.getAllGiveaways());
    }

    deleteGiveaway(index: number) {
        return window.electronAPI?.writeSetting('giveaways', this.mapGiveawaysToSettings(this.allGiveaways.value.filter((g, i) => i !== index))).then(() => this.getAllGiveaways());
    }

    saveGiveaway(giveaway: GiveawayDetails, index: number) {
        return window.electronAPI?.writeSetting(`giveaways[${index}]`, this.mapGiveawayToSettings(giveaway)).then(() => this.getAllGiveaways());
    }

    saveAllGiveaways(giveaways: GiveawayDetails[]) {
        return window.electronAPI?.writeSetting('giveaways', this.mapGiveawaysToSettings(giveaways)).then(() => this.getAllGiveaways());
    }

    private mapGiveawaysFromSettings(giveaways: SettingsValue): GiveawayDetails[] {
        return (giveaways as SettingsValue[]).map((item: SettingsValue) => {
            return this.mapGiveawayFromSettings(item);
        });
    }

    private mapGiveawaysToSettings(giveaways: GiveawayDetails[]): SettingsValue {
        return giveaways.map((item: GiveawayDetails) => {
            return this.mapGiveawayToSettings(item);
        });
    }

    private mapGiveawayFromSettings(item: SettingsValue) {
        const obj = item as SettingsObject;
        return {
            name: obj['name'] as string,
            providedBy: obj['providedBy'] as string,
            imagePath: obj['imagePath'] as string,
            description: obj['description'] as string,
            learnMoreUrl: obj['learnMoreUrl'] as string,
            trackWinners: obj['trackWinners'] as boolean,
            winners: this.mapStringArr(obj['winners'])
        };
    }

    private mapGiveawayToSettings(giveaway: GiveawayDetails) {
        return {
            ['name']: giveaway.name as SettingsValue,
            ['providedBy']: giveaway.providedBy as SettingsValue,
            ['imagePath']: giveaway.imagePath as SettingsValue,
            ['description']: giveaway.description as SettingsValue,
            ['learnMoreUrl']: giveaway.learnMoreUrl as SettingsValue,
            ['trackWinners']: giveaway.trackWinners as SettingsValue,
            ['winners']: giveaway.winners.map((w: string) => w as SettingsValue) as SettingsValue
        };
    }

    private mapStringArr(stringArr: SettingsValue): string[] {
        return (stringArr as SettingsValue[]).map((item: SettingsValue) => item as string);
    }
}