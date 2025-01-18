import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, Subscription, take } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { TwitchChatMessage, TwitchMessage, TwitchSubscriptionRequest, TwitchTokenValidateResponse } from '../types/twitch-message';
import { WsService } from './web-socket-service';
import { defaultTwitchSettings, TwitchSettings } from '../models/twitch-settings';
import { SettingsValue } from '../../main';

const client_id = '7sfz2braoxwi5lsjniilwefr2fpdrg';

@Injectable({
    providedIn: 'root'
})
export class TwitchService implements OnDestroy {
    private twitchAuthToken = new BehaviorSubject<string>('');
    public readonly twitchAuthToken$ = this.twitchAuthToken.asObservable();

    private twitchSettings = new BehaviorSubject<TwitchSettings>(defaultTwitchSettings);
    public readonly twitchSettings$ = this.twitchSettings.asObservable();

    private twitchSettingsLoading = new BehaviorSubject<boolean>(true);
    public readonly twitchSettingsLoading$ = this.twitchSettingsLoading.asObservable();

    private twitchSettingsRefresh = new BehaviorSubject<void>(undefined);
    public readonly twitchSettingsRefresh$ = this.twitchSettingsRefresh.asObservable();

    private twitchUsername = new BehaviorSubject<string>('');
    public readonly twitchUsername$ = this.twitchUsername.asObservable();

    private twitchUserId = new BehaviorSubject<string>('');
    public readonly twitchUserId$ = this.twitchUserId.asObservable();

    private chatMessageReceived = new BehaviorSubject<TwitchChatMessage | null>(null);
    public readonly chatMessageReceived$ = this.chatMessageReceived.asObservable();

    chatSubscription: Subscription;

    constructor(private http: HttpClient, private wsService: WsService<TwitchMessage>) {
        window.electronAPI.onTokenCollected((token) => {
            this.twitchAuthToken.next(token);
        })
    }

    loadSettings() {
        this.getFullSettings().then(ws => {
            this.twitchSettings.next(ws);
            this.twitchSettingsLoading.next(false);
        });
    }

    saveSetting(setting: string, data: SettingsValue) {
        window.electronAPI?.writeSetting(setting, data).then(() => this.loadSettings());
    }

    forceRefresh() {
        this.twitchSettingsRefresh.next();
    }

    ngOnDestroy(): void {
        this.wsService.messages.unsubscribe();
        this.chatSubscription.unsubscribe();
        this.wsService.disconnect();
    }

    connectToTwitch(forceVerify: boolean, error?: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI
                .twitchAuth(forceVerify)
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    pollForDeviceAuth(device_code: string) {
        const data = {
            client_id,
            scopes: encodeURIComponent('user:read:chat'),
            device_code: device_code,
            grant_type: encodeURIComponent('urn:ietf:params:oauth:grant-type:device_code')
        };
        this.http.post(`https://id.twitch.tv/oauth2/token?client_id=${data.client_id}&scope=${data.scopes}&device_code=${device_code}&grant_Type=${data.grant_type}`, {
            headers: {
                ['Content-Type']: 'application/x-www-form-urlencoded'
            }
        }).pipe(take(1)).subscribe((response: any) => {
            if (response.status === 400) {
                if (response.message === 'authorization_pending') {
                    setTimeout(() => this.pollForDeviceAuth(device_code), 1000);
                }
                else {
                    return;
                }
            }

            this.twitchAuthToken.next(response.access_token);
        });
    }

    subscribeToChat(auth_token: string, data: TwitchSubscriptionRequest): Observable<any> {
        return this.http.post('https://api.twitch.tv/helix/eventsub/subscriptions', data, {
            headers: {
                ['Authorization']: `Bearer ${auth_token}`,
                ['Client-Id']: client_id,
                ['Content-Type']: 'application/json'
            }
        })
    }

    getUserProfileImage(auth_token: string, userId: number): Observable<any> {
        return this.http.get(`https://api.twitch.tv/helix/users?id=${userId}`, {
            headers: {
                ['Authorization']: `Bearer ${auth_token}`,
                ['Client-Id']: client_id,
                ['Content-Type']: 'application/json'
            }
        })
    }

    validateToken(auth_token: string): Observable<TwitchTokenValidateResponse | null> {
        return this.http.get<TwitchTokenValidateResponse | null>('https://id.twitch.tv/oauth2/validate', {
            headers: {
                ['Authorization']: `Bearer ${auth_token}`
            }
        }).pipe(map(res => {
            this.twitchAuthToken.next(auth_token);
            this.twitchUsername.next(res?.login ?? '');
            this.twitchUserId.next(res?.user_id ?? '');
            return res;
        }), catchError(error => {
            if (error.status === 401) {
                // Handle 401 error, e.g., redirect to login page
                console.error('Unauthorized!');
            }
            this.twitchAuthToken.next('');
            this.twitchUsername.next('');
            this.twitchUserId.next('');
            return of(null);
        }))
    }

    openListener(token: string) {
        if (!token || this.wsService.isConnected) {
            return;
        }

        this.wsService.open('wss://eventsub.wss.twitch.tv/ws');
        this.wsService.messages.subscribe(msg => {
            if (msg.metadata.message_type === 'session_welcome') {
                this.onSessionWelcome(msg, token);
            }
            if (msg.metadata.message_type === 'notification' && msg.metadata.subscription_type === 'channel.chat.message') {
                this.onTwitchChatMessage(msg);
            }
        });
    }

    private async getFullSettings(): Promise<TwitchSettings> {
        let [
            twitchAuthToken,
            twitchEnterCommand,
            twitchRemoveCommand,
            useTwitchUserColors,
            showTwitchProfileImages
        ] = await Promise.all([
            window.electronAPI?.readSetting('twitchAuthToken'),
            window.electronAPI?.readSetting('twitchEnterCommand'),
            window.electronAPI?.readSetting('twitchRemoveCommand'),
            window.electronAPI?.readSetting('useTwitchUserColors'),
            window.electronAPI?.readSetting('showTwitchProfileImages'),
        ]);

        return {
            twitchAuthToken: twitchAuthToken as string ?? defaultTwitchSettings.twitchAuthToken,
            twitchEnterCommand: twitchEnterCommand as string ?? defaultTwitchSettings.twitchEnterCommand,
            twitchRemoveCommand: twitchRemoveCommand as string ?? defaultTwitchSettings.twitchRemoveCommand,
            useTwitchUserColors: useTwitchUserColors as boolean ?? defaultTwitchSettings.useTwitchUserColors,
            showTwitchProfileImages: showTwitchProfileImages as boolean ?? defaultTwitchSettings.showTwitchProfileImages,
        }
    }


    private onSessionWelcome(msg: TwitchMessage, token: string) {
        const id = msg.payload.session.id;
        this.validateToken(token).pipe(take(1)).subscribe(res => {
            const request: TwitchSubscriptionRequest = {
                type: 'channel.chat.message',
                version: '1',
                condition: {
                    broadcaster_user_id: res?.user_id ?? '',
                    user_id: res?.user_id ?? ''
                },
                transport: {
                    method: 'websocket',
                    session_id: id
                }
            };

            this.chatSubscription = this.subscribeToChat(token, request).pipe(take(1)).subscribe();
        });
    }

    private onTwitchChatMessage(msg: TwitchMessage) {
        this.chatMessageReceived.next(msg.payload.event);
    }
}