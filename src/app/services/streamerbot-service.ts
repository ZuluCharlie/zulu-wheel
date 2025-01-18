import { Injectable } from '@angular/core';
import { StreamerbotClient } from '@streamerbot/client';
import { BehaviorSubject } from 'rxjs';
import { defaultStreamerBotSettings, StreamerBotSettings } from '../models/streamerbot-settings';
import { SettingsValue } from '../../main';
import { Item } from 'spin-wheel-ts';
import { getVisibleTextColor } from '../util/helpers';
import { GiveawayDetails } from '../models/giveaway-details';
import { SelectValue } from '../models/wheel-settings';

@Injectable({
    providedIn: 'root'
})
export class StreamerBotService {
    private streamerBotSettings = new BehaviorSubject<StreamerBotSettings>(defaultStreamerBotSettings);
    public readonly streamerBotSettings$ = this.streamerBotSettings.asObservable();

    private streamerBotSettingsLoading = new BehaviorSubject<boolean>(true);
    public readonly streamerBotSettingsLoading$ = this.streamerBotSettingsLoading.asObservable();

    private streamerBotSettingsRefresh = new BehaviorSubject<void>(undefined);
    public readonly streamerBotSettingsRefresh$ = this.streamerBotSettingsRefresh.asObservable();

    private connected = new BehaviorSubject<boolean>(false);
    public readonly connected$ = this.connected.asObservable();

    private allActions = new BehaviorSubject<StreamerBotAction[]>([]);
    public readonly allActions$ = this.allActions.asObservable();

    private events = new BehaviorSubject<StreamerBotEvent|null>(null);
    public readonly events$ = this.events.asObservable();

    client: StreamerbotClient;

    constructor() { }

    loadSettings() {
        this.getFullSettings().then(ws => {
            this.streamerBotSettings.next(ws);
            this.streamerBotSettingsLoading.next(false);
        });
    }

    saveSetting(setting: string, data: SettingsValue) {
        window.electronAPI?.writeSetting(setting, data).then(() => this.loadSettings());
    }

    forceRefresh() {
        this.streamerBotSettingsRefresh.next();
    }

    getAllActions() {
        if (!this.connected.value || !this.client) {
            return;
        }

        this.client.getActions().then(data => {
            this.allActions.next(data.actions);
        });
    }

    connect(onSuccess: () => void, onError: () => void) {
        this.streamerBotSettingsLoading.next(true);
        this.client = new StreamerbotClient({
            onConnect: (data) => {
                this.connected.next(true);
                this.streamerBotSettingsLoading.next(false);
                onSuccess();
            },
            onError: (error) => {
                console.log('Streamer.bot error', error);
                this.connected.next(false);
                this.streamerBotSettingsLoading.next(false);
                onError();
            },
            subscribe: {
                'General': ['Custom']
            },
            host: this.streamerBotSettings.value.webSocketAddress,
            port: this.streamerBotSettings.value.webSocketPort,
            endpoint: this.streamerBotSettings.value.webSocketEndpoint,
            password: this.streamerBotSettings.value.webSocketPassword,
            retries: 3
        });

        this.client.on('Custom.Event', (event) => {
            this.events.next({ eventName: event.data.eventName, args: event.data.args });
        });
    }

    runAction(actionId: string, winner?: string) {
        if (!this.client) {
            return;
        }

        this.client.doAction(actionId, { "zuluWheelWinner": winner });
    }

    sendGiveawayData(actionId: string, giveaway: GiveawayDetails) {
        if (!this.client) {
            return;
        }

        this.client.doAction(actionId, {
            "zuluGiveawayName": giveaway.name,
            "zuluGiveawayProvidedBy": giveaway.providedBy,
            "zuluGiveawayImageUrl": giveaway.imagePath,
            "zuluGiveawayDescription": giveaway.description,
            "zuluGiveawayLearnMoreUrl": giveaway.learnMoreUrl,
        });
    }

    private async getFullSettings(): Promise<StreamerBotSettings> {
        let [
            webSocketAddress,
            webSocketPort,
            webSocketEndpoint,
            webSocketPassword,
            spinWheelEventName,
            addNameEventName,
            removeNameEventName,
            clearWheelEventName,
            confirmWinnerEventName,
            winnerRevealedActionId,
            winnerConfirmedActionId,
            winnerLapsedActionId,
            reRollActionId,
            sendGiveawayDataActionId,
            streamerbotEntryInstructions,
            useStreamerBotColorsOnWheel,
            showTwitchProfileImages,
        ] = await Promise.all([
            window.electronAPI?.readSetting('webSocketAddress'),
            window.electronAPI?.readSetting('webSocketPort'),
            window.electronAPI?.readSetting('webSocketEndpoint'),
            window.electronAPI?.readSetting('webSocketPassword'),
            window.electronAPI?.readSetting('spinWheelEventName'),
            window.electronAPI?.readSetting('addNameEventName'),
            window.electronAPI?.readSetting('removeNameEventName'),
            window.electronAPI?.readSetting('clearWheelEventName'),
            window.electronAPI?.readSetting('confirmWinnerEventName'),
            window.electronAPI?.readSetting('winnerRevealedActionId'),
            window.electronAPI?.readSetting('winnerConfirmedActionId'),
            window.electronAPI?.readSetting('winnerLapsedActionId'),
            window.electronAPI?.readSetting('reRollActionId'),
            window.electronAPI?.readSetting('sendGiveawayDataActionId'),
            window.electronAPI?.readSetting('streamerbotEntryInstructions'),
            window.electronAPI?.readSetting('useStreamerBotColorsOnWheel'),
            window.electronAPI?.readSetting('showTwitchProfileImages'),
        ]);

        return {
            webSocketAddress: webSocketAddress as string ?? defaultStreamerBotSettings.webSocketAddress,
            webSocketPort: webSocketPort as number ?? defaultStreamerBotSettings.webSocketPort,
            webSocketEndpoint: webSocketEndpoint as string ?? defaultStreamerBotSettings.webSocketEndpoint,
            webSocketPassword: webSocketPassword as string ?? defaultStreamerBotSettings.webSocketPassword,
            spinWheelEventName: spinWheelEventName as string ?? defaultStreamerBotSettings.spinWheelEventName,
            addNameEventName: addNameEventName as string ?? defaultStreamerBotSettings.addNameEventName,
            removeNameEventName: removeNameEventName as string ?? defaultStreamerBotSettings.removeNameEventName,
            clearWheelEventName: clearWheelEventName as string ?? defaultStreamerBotSettings.clearWheelEventName,
            confirmWinnerEventName: confirmWinnerEventName as string ?? defaultStreamerBotSettings.confirmWinnerEventName,
            winnerRevealedActionId: winnerRevealedActionId as string ?? defaultStreamerBotSettings.winnerRevealedActionId,
            winnerConfirmedActionId: winnerConfirmedActionId as string ?? defaultStreamerBotSettings.winnerConfirmedActionId,
            winnerLapsedActionId: winnerLapsedActionId as string ?? defaultStreamerBotSettings.winnerLapsedActionId,
            reRollActionId: reRollActionId as string ?? defaultStreamerBotSettings.reRollActionId,
            sendGiveawayDataActionId: sendGiveawayDataActionId as string ?? defaultStreamerBotSettings.sendGiveawayDataActionId,
            streamerbotEntryInstructions: streamerbotEntryInstructions as string ?? defaultStreamerBotSettings.streamerbotEntryInstructions,
            useStreamerBotColorsOnWheel: useStreamerBotColorsOnWheel as boolean ?? defaultStreamerBotSettings.useStreamerBotColorsOnWheel,
            showTwitchProfileImages: showTwitchProfileImages as boolean ?? defaultStreamerBotSettings.showTwitchProfileImages,
        }
    }
}

export interface StreamerBotAction {
    id: string,
    name: string,
    enabled: boolean,
    group: string,
    subaction_count: number
}

export interface StreamerBotEvent {
    eventName: string;
    args: { [key: string]: SelectValue }
}
