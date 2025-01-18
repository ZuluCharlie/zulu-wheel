export interface StyleSettings {
    wheelName: string;
    globalFontColor: string;
    globalBackgroundColor: string;
    globalButtonFontColor: string;
    globalButtonColor: string;
    globalInputFontColor: string;
    globalInputBackgroundColor: string;
    globalFont: string;
}

export const defaultStyleSettings: StyleSettings = {
    wheelName: 'Zulu Wheel',
    globalFontColor: '#ffffff',
    globalBackgroundColor: '#000000',
    globalButtonFontColor: '#000000',
    globalButtonColor: '#ffffff',
    globalInputFontColor: '#000000',
    globalInputBackgroundColor: '#cccccc',
    globalFont: 'Roboto'
}