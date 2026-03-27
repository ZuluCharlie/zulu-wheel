export interface StyleSettings {
    wheelName: string;
    globalFontColor: string;
    globalBackgroundColor: string;
    globalBorderColor: string;
    globalButtonFontColor: string;
    globalButtonColor: string;
    globalButtonBorderColor: string;
    globalInputFontColor: string;
    globalInputBackgroundColor: string;
    globalInputBorderColor: string;
    globalFont: string;
}

export const defaultStyleSettings: StyleSettings = {
    wheelName: 'Zulu Wheel',
    globalFontColor: '#ffffff',
    globalBackgroundColor: '#000000',
    globalBorderColor: '#ffffff',
    globalButtonFontColor: '#000000',
    globalButtonColor: '#ffffff',
    globalButtonBorderColor: '#ffffff',
    globalInputFontColor: '#000000',
    globalInputBackgroundColor: '#eeeeee',
    globalInputBorderColor: '#ffffff',
    globalFont: 'Roboto'
}