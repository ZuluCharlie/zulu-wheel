import { Item } from "spin-wheel-ts";

export type Alignment = 'left' | 'center' | 'right';
export type Offset = {
    w: number;
    h: number;
};
export type Angle = {
    start: number;
    end: number;
};
export type EasingFunction = (n: number) => number;
export type SpinEvent = {
    type: 'spin';
    method: 'spin';
    rotationSpeed: number;
    rotationResistance: number;
};
export type SpinToEvent = {
    type: 'spin';
    method: 'spinto';
    targetRotation: number;
    duration: number;
};
export type SpinToItemEvent = {
    type: 'spin';
    method: 'spintoitem';
    targetItemIndex: number;
    targetRotation: number;
    duration: number;
};
export type InteractEvent = {
    type: 'spin';
    method: 'interact';
    rotationSpeed: number;
    rotationResistance: number;
};
export type RestEvent = {
    type: 'rest';
    currentIndex: number;
    rotation: number;
};
export type CurrentIndexChangeEvent = {
    type: 'currentIndexChange';
    currentIndex: number;
};
export type SpinWheelEvent = SpinEvent | SpinToEvent | SpinToItemEvent | InteractEvent | RestEvent | CurrentIndexChangeEvent;
export type Props = {
    borderColor: string;
    borderWidth: number;
    debug: boolean;
    image: string;
    isInteractive: boolean;
    itemBackgroundColors: string[];
    itemLabelAlign: Alignment;
    itemLabelBaselineOffset: number;
    itemLabelColors: string[];
    itemLabelFont: string;
    itemLabelFontSizeMax: number;
    itemLabelRadius: number;
    itemLabelRadiusMax: number;
    itemLabelRotation: number;
    itemLabelStrokeColor: string;
    itemLabelStrokeWidth: number;
    items: Partial<Item>[];
    lineColor: string;
    lineWidth: number;
    pixelRatio: number;
    radius: number;
    rotation: number;
    rotationResistance: number;
    rotationSpeedMax: number;
    offset: Offset;
    onCurrentIndexChange: ((e: SpinWheelEvent) => void) | null;
    onRest: ((e: SpinWheelEvent) => void) | null;
    onSpin: ((e: SpinWheelEvent) => void) | null;
    overlayImage: string;
    pointerAngle: number;
};