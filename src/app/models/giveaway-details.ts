export interface GiveawayDetails {
    name: string,
    providedBy: string | null,
    imagePath: string | null,
    description: string,
    learnMoreUrl: string | null,
    trackWinners: boolean,
    winners: string[]
}

export const defaultGiveaway: GiveawayDetails = {
    name: 'New Giveaway',
    providedBy: null,
    imagePath: null,
    description: '',
    learnMoreUrl: null,
    trackWinners: true,
    winners: []
}
