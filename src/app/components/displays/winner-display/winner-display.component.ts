import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WheelEntryType, WheelSettings } from '../../../models/wheel-settings';
import { CommonModule } from '@angular/common';
import { TwitchService } from '../../../services/twitch-service';
import { TimerDetails, ZuluTimerComponent } from '../../zulu-tools/zulu-timer/zulu-timer.component';
import { ZuluImageComponent } from "../../zulu-tools/zulu-image/zulu-image.component";
import { skip } from 'rxjs';
import { WinnerSettings } from '../../../models/winner-settings';
import { WinnerService } from '../../../services/winner-service';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { SettingsService } from '../../../services/settings-service';
import { ButtonStyleDirective } from '../../../directives/button-style.directive';
import { StreamerBotService } from '../../../services/streamerbot-service';
import { AudioService } from '../../../services/audio-service';
import { TwitchChatMessage } from '../../../types/twitch-message';
import { StreamerBotSettings } from '../../../models/streamerbot-settings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AudioSettingsItem } from '../../../models/audio-settings';
import { TwitchMessagesComponent } from "../twitch-messages/twitch-messages.component";

@Component({
  selector: 'app-winner-display',
  standalone: true,
  imports: [CommonModule, ZuluTimerComponent, ZuluImageComponent,
    MainStyleDirective, ButtonStyleDirective, TwitchMessagesComponent],
  templateUrl: './winner-display.component.html',
  styleUrl: './winner-display.component.scss'
})
export class WinnerDisplayComponent implements OnInit {
  @Input() winner: string;
  @Input() entryCount: number;
  @Input() runTimer: boolean;
  @Input() imgSrc: string | null = null;
  @Input() winnerMessageOverride?: string | null = null;
  @Input() winnerSoundOverride?: AudioSettingsItem | null = null;
  @Input() twitchFeatureChatters: string[] = [];

  @Output() confirmed = new EventEmitter<void>();
  @Output() confirmLapsed = new EventEmitter<void>();

  winnerMessage: string;
  percentRemaining: number = 100;

  settings: WinnerSettings;
  wheelSettings: WheelSettings;
  streamerBotSettings: StreamerBotSettings;

  timerStarted: boolean = false;
  isConfirmed: boolean = false;
  isLapsed: boolean = false;
  chatInitialized: boolean = false;
  streamerBotInitialized: boolean = false;
  winnerMessages: TwitchChatMessage[] = [];

  WheelEntryType = WheelEntryType;
  authToken: string;

  get winnerMessageDisplay() {
    return this.winnerMessage
      .replace('${winner}', this.winner)
      .replace('${entryCount}', this.entryCount.toString());
  }

  constructor(
    private settingsService: WinnerService,
    private wheelSettingsService: SettingsService,
    private streamerBotService: StreamerBotService,
    private audioService: AudioService,
    private twitchService: TwitchService
  ) {
    this.settingsService.winnerSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.settings = ws;

      if (!this.winnerMessageOverride) {
        this.winnerMessage = ws.winnerMessage;
      }
    });

    this.wheelSettingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => this.wheelSettings = ws);
    this.streamerBotService.streamerBotSettings$.pipe(takeUntilDestroyed()).subscribe(ss => this.streamerBotSettings = ss);

    this.twitchService.chatMessageReceived$.pipe(skip(1), takeUntilDestroyed()).subscribe(msg => {
      if (msg?.chatter_user_name === this.winner) {
        if (!this.isLapsed && this.timerStarted && !this.isConfirmed) {
          this.confirmWinner();
        }
      }
    });

    this.streamerBotService.events$.pipe(skip(1), takeUntilDestroyed()).subscribe((event) => {
      if (!this.isLapsed && this.timerStarted && !this.isConfirmed && event?.eventName === this.streamerBotSettings.confirmWinnerEventName) {
        this.confirmWinner();
      }
    });
  }

  ngOnInit() {
    if (this.runTimer) {
      this.timerStarted = true;
    }

    if (this.winnerMessageOverride) {
      this.winnerMessage = this.winnerMessageOverride;
    }

    if (this.winnerSoundOverride) {
      this.audioService.createAndPlayAudio(this.winnerSoundOverride);
    }
    else {
      this.audioService.playAudio('winnerAnnounced', false);
    }
  }

  private confirmWinner() {
    this.isConfirmed = true;
    this.timerStarted = false;
    this.confirmed?.emit();
    this.audioService.playAudio('winnerConfirmed', false);
  }

  onTick(e: TimerDetails) {
    this.percentRemaining = (e.remaining) / (this.settings.winnerRequireConfirmationTimer * 1000) * 100;
  }

  onLapsed() {
    this.isLapsed = true;
    this.confirmLapsed?.emit();
    this.audioService.playAudio('winnerLapsed', false);
  }
}
