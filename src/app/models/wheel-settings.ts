import { WheelDisplayTypes } from "./wheel-display-types";
import { WheelItemSettings } from "./wheel-item-settings";

export type SelectValue = number | string | WheelEntryType | null | boolean;

export enum WheelEntryType {
    Manual = 0,
    Twitch = 1,
    StreamerBot = 2,
    File = 3
}

export interface WheelSettings {
    wheelBorderWidth: number;
    minPies: number;
    minDuration: number;
    maxDuration: number;
    minRevolutions: number;
    maxRevolutions: number;
    wheelOverlayImagePath: string | undefined;
    wheelCenterImagePath: string | undefined;
    wheelCenterImageSize: number;
    wheelBackgroundImagePath: string | undefined;
    sideWheelEntries: number;
    wheelDisplayType: WheelDisplayTypes;
    easeOutFunction: string;
    idleSpeed: number;
    isCounterClockwise: boolean;
    wheelEntryType: WheelEntryType;
    maxTopWheelWedges: number;
    wheelTickSoundPath: string;
    entriesFilePath: string;
    pointerAngle: number;
    labelRadius: number | null;

    itemSettings: WheelItemSettings[];
}

export const defaultWheelSettings: WheelSettings = {
    wheelBorderWidth: 0,
    minPies: 8,
    minDuration: 10,
    maxDuration: 15,
    minRevolutions: 3,
    maxRevolutions: 5,
    wheelOverlayImagePath: 'assets/img/overlay-images/Wheel Template.png',
    wheelCenterImagePath: 'assets/img/center-images/Z.png',
    wheelCenterImageSize: 12,
    wheelBackgroundImagePath: 'assets/img/background-images/Zulu Background.png',
    sideWheelEntries: 10,
    wheelDisplayType: WheelDisplayTypes.Wheel,
    easeOutFunction: 'Circular',
    idleSpeed: 5,
    isCounterClockwise: false,
    wheelEntryType: WheelEntryType.Manual,
    maxTopWheelWedges: 250,
    wheelTickSoundPath: 'assets/sounds/tick.mp3',
    entriesFilePath: '',
    pointerAngle: 0,
    labelRadius: null,

    itemSettings:
        [
            { pieColor: '#000000', pieFontColor: '#ffffff' },
            { pieColor: '#ffffff', pieFontColor: '#000000' }
        ],
}