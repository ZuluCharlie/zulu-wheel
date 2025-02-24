export interface StaticWheelItem {
    label: string;
    labelColor: string;
    backgroundColor: string;
    imagePath: string;
    imageRadius: number;
    imageRotation: number;
    imageOpacity: number;
    imageScale: number;
    itemWeight: number;
    itemWinningMessage: string;
    itemWinningStreamerbotActionId: string;
    itemWinningSound: string;
    itemWinningSoundVolume: number;
    itemWinningSoundMute: boolean;
    itemWinningImage: string;
}

export interface StaticWheel {
    name: string;
    featureChatters: string[];
    wheelCenterImagePath: string;
    wheelOverlayImagePath: string;
    wheelTickSoundPath: string;
    wheelTickSoundVolume: number;
    wheelTickSoundMute: boolean;
    pointerAngle: number;
    idleSpeed: number;
    minPies: number;
    itemFont: string | null;
    labelRadius: number;

    items: StaticWheelItem[];
}

export const defaultStaticWheelItem: StaticWheelItem = {
    label: 'New Item',
    labelColor: '#000000',
    backgroundColor: '#ffffff',
    imagePath: '',
    imageRadius: 0.9,
    imageRotation: 0,
    imageOpacity: 1,
    imageScale: 1,
    itemWeight: 1,
    itemWinningMessage: '',
    itemWinningStreamerbotActionId: '',
    itemWinningSound: '',
    itemWinningSoundVolume: 1,
    itemWinningSoundMute: false,
    itemWinningImage: ''
}

export const defaultStaticWheel: StaticWheel = {
    name: 'New Static Wheel',
    featureChatters: [],
    wheelCenterImagePath: 'assets/img/center-images/Z.png',
    wheelOverlayImagePath: 'assets/img/overlay-images/Wheel Template.png', 
    wheelTickSoundPath: 'assets/sounds/tick.mp3',
    wheelTickSoundVolume: 1,
    wheelTickSoundMute: false,
    pointerAngle: 0,
    idleSpeed: 0,
    minPies: 1,
    itemFont: null,
    labelRadius: 0.95,

    items: []
}
