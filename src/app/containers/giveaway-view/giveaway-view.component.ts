import { Component } from '@angular/core';
import { ItemsListComponent } from "../../components/displays/items-list/items-list.component";
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { Item } from 'spin-wheel-ts';
import { WheelEntryType, WheelSettings } from '../../models/wheel-settings';
import { SafeStyle } from '@angular/platform-browser';
import { FONT_PICKER_CONFIG, FontInterface, FontPickerConfigInterface, FontPickerModule, FontPickerService } from 'ngx-font-picker';
import { SettingsService } from '../../services/settings-service';
import { getRandomNumber, getVisibleTextColor, shuffle } from '../../util/helpers';
import { randomNames } from '../../util/random-names';
import { WheelService } from '../../services/wheel-service';
import { WheelMainSideComponent } from "../../components/wheels/wheel-main-side/wheel-main-side.component";
import { CommonModule } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { TwitchService } from '../../services/twitch-service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ZuluButtonComponent } from '../../components/zulu-tools/zulu-button/zulu-button.component';
import { ZuluCardComponent } from "../../components/zulu-tools/zulu-card/zulu-card.component";
import { ZuluSelectComponent } from "../../components/zulu-tools/zulu-select/zulu-select.component";
import { WheelDisplayTypes } from '../../models/wheel-display-types';
import { EliminationItem, WheelMainEliminationComponent } from "../../components/wheels/wheel-main-elimination/wheel-main-elimination.component";
import { WinnerModalComponent } from '../../modals/winner-modal/winner-modal.component';
import { WinnerResult } from '../../models/winner-result';
import { CurrentGiveawayComponent } from "../../components/displays/current-giveaway/current-giveaway.component";
import { skip, take } from 'rxjs';
import { GiveawayService } from '../../services/giveaway-service';
import { GiveawayDetails } from '../../models/giveaway-details';
import { TwitchSettings } from '../../models/twitch-settings';
import { WinnerRemoveType, WinnerSettings } from '../../models/winner-settings';
import { WinnerService } from '../../services/winner-service';
import { CountdownSettings } from '../../models/countdown-settings';
import { CountdownService } from '../../services/countdown-service';
import { StreamerBotEvent, StreamerBotService } from '../../services/streamerbot-service';
import { StreamerBotSettings } from '../../models/streamerbot-settings';
import { FileService } from '../../services/file-service';
import { TwitchChatMessage } from '../../types/twitch-message';
import { AudioService } from '../../services/audio-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../services/modal-service';
import { AnimatedUnderlineDirective } from '../../directives/animated-underline.directive';
import { RouterModule } from '@angular/router';
import { MainStyleDirective } from '../../directives/main-style.directive';

const DEFAULT_FONT_PICKER_CONFIG: FontPickerConfigInterface = {
  apiKey: 'AIzaSyD-sn9nq8KSAAKgmqgDVZGck844ueiKkNE'
};

@Component({
  selector: 'app-giveaway-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FontPickerModule,
    MatCardModule,
    MatIconModule,
    ItemsListComponent,
    WheelMainComponent,
    WheelMainSideComponent,
    ZuluButtonComponent,
    ZuluCardComponent,
    ZuluSelectComponent,
    WheelMainEliminationComponent,
    CurrentGiveawayComponent,
    AnimatedUnderlineDirective,
    RouterModule,
    MainStyleDirective
  ],
  templateUrl: './giveaway-view.component.html',
  styleUrl: './giveaway-view.component.scss',
  providers: [
    FontPickerService,
    {
      provide: FONT_PICKER_CONFIG,
      useValue: DEFAULT_FONT_PICKER_CONFIG
    }
  ]
})
export class GiveawayViewComponent {
  wheelSettings: WheelSettings;
  twitchSettings: TwitchSettings;
  winnerSettings: WinnerSettings;
  countdownSettings: CountdownSettings;
  streamerBotSettings: StreamerBotSettings;
  currentGiveaway: GiveawayDetails | null;
  currentGiveawayIndex: number | null;

  wheelSettingsLoading: boolean = true;
  fontLoading: boolean = true;
  items: Partial<Item>[] = [];
  title: string;
  fontsLoaded: { [key: string]: boolean } = {};
  allfonts: FontInterface[];
  showSideItems: boolean = false;
  isSpinning: boolean = false;
  twitchBroadcasterUserId: string;
  authToken: string;
  isOverTopWheelMax: boolean;

  chatInitialized: boolean = false;
  streamerBotConnected: boolean = false;
  streamerBotConnectedError: boolean = false;
  streamerBotConnecting: boolean = false;
  isFileWatching: boolean = false;
  isFileError: boolean = false;

  backgroundImage: SafeStyle;
  WheelEntryType = WheelEntryType;
  WheelDisplayType = WheelDisplayTypes;

  constructor(
    private settingsService: SettingsService,
    private wheelService: WheelService,
    private twitchService: TwitchService,
    private modalService: ModalService,
    private giveawayService: GiveawayService,
    private winnerService: WinnerService,
    private countdownService: CountdownService,
    private streamerBotService: StreamerBotService,
    private fileService: FileService,
    private audioService: AudioService
  ) {
    this.giveawayService.currentGiveaway$.pipe(takeUntilDestroyed()).subscribe(g => this.currentGiveaway = g);
    this.giveawayService.currentGiveawayIndex$.pipe(takeUntilDestroyed()).subscribe(i => this.currentGiveawayIndex = i);
    this.wheelService.wheelIsSpinning$.pipe(skip(1), takeUntilDestroyed()).subscribe(isSpinning => {
      this.isSpinning = isSpinning;
      if (isSpinning) {
        this.audioService.playAudio('giveawayRunning', true);
      }
      else {
        this.audioService.stopAudio('giveawayRunning');
      }
    });
    this.twitchService.twitchUserId$.pipe(takeUntilDestroyed()).subscribe(id => this.twitchBroadcasterUserId = id);
    this.twitchService.twitchSettings$.pipe(takeUntilDestroyed()).subscribe(ts => this.twitchSettings = ts);
    this.twitchService.twitchAuthToken$.pipe(takeUntilDestroyed()).subscribe(token => this.updateTwitchAuthToken(token));

    this.winnerService.winnerSettings$.pipe(takeUntilDestroyed()).subscribe(ws => this.winnerSettings = ws);
    this.countdownService.countdownSettings$.pipe(takeUntilDestroyed()).subscribe(cs => this.countdownSettings = cs);

    this.streamerBotService.streamerBotSettings$.pipe(takeUntilDestroyed()).subscribe(ss => this.streamerBotSettings = ss);
    this.streamerBotService.connected$.pipe(takeUntilDestroyed()).subscribe(c => this.streamerBotConnected = c);
    this.streamerBotService.events$.pipe(takeUntilDestroyed()).subscribe(event => this.onStreamerBotEvent(event));
    
    this.fileService.watchFileChange$.pipe(takeUntilDestroyed()).subscribe(data => this.onFileWatchChange(data));
    this.fileService.watchFileError$.pipe(takeUntilDestroyed()).subscribe(isError => this.onFileWatchError(isError));

    this.wheelService.wheelItems$.pipe(takeUntilDestroyed()).subscribe(items => this.updateWheelItems(items));
    this.twitchService.chatMessageReceived$.pipe(takeUntilDestroyed()).subscribe(message => this.handleTwitchMessage(message));
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => this.onWheelSettingsUpdate(ws));
  }

  toggleSideItems() {
    this.showSideItems = !this.showSideItems;
  }

  onItemsChange(e: string) {
    this.items = e.split('\n').map(i => ({ label: i.trim() })).filter(i => i.label.length > 0);
    this.wheelService.updateItems(this.items);
  }

  addToWheel(item: Partial<Item>, ensureDistinct: boolean) {
    if (!item.label) {
      return;
    }

    if (ensureDistinct && this.items.some(i => i.label === item.label)) {
      return;
    }

    this.items = [...this.items, item].filter(i => i.label?.length! > 0);
    this.wheelService.updateItems(this.items);
  }

  removeAllFromWheel(label: string) {
    this.items = this.items.filter(i => i.label !== label);
    this.wheelService.updateItems(this.items);
  }

  removeOneFromWheel(label: string) {
    const index = this.items.findIndex(i => i.label === label);
    this.items = this.items.filter((i, idx) => idx !== index);
    this.wheelService.updateItems(this.items);
  }

  addRandom() {
    const name1 = randomNames[getRandomNumber(0, 999)];
    const name2 = randomNames[getRandomNumber(0, 999)];
    const randomName = `${name1.split(' ')[0]} ${name2.split(' ')[1]}`;
    this.addToWheel({ label: randomName, imageRadius: .9, imageScale: 0.5 }, false);
  }

  addRandomX100() {
    for (let i = 0; i < 100; i++) {
      this.addRandom();
    }
  }

  clearWheel() {
    this.items = [];
    this.wheelService.updateItems(this.items);
  }

  shuffleEntries() {
    this.items = shuffle([...this.items]);
    this.wheelService.updateItems(this.items);
  }

  sortEntries() {
    this.items = this.items.sort((a, b) => a.label!.localeCompare(b.label!))
    this.wheelService.updateItems(this.items);
  }

  onEntryTypeChange(e: MatSelectChange) {
    this.settingsService.saveSetting('wheelEntryType', e.value);
  }

  connectToTwitch() {
    this.twitchService.connectToTwitch(false);
  }

  onWinnerDeclared(item: Item | EliminationItem | Partial<Item>) {
    this.audioService.playAudio('winnerAnnounced', false);
    const winner = item.label!;
    const winnerImgSrc = this.winnerSettings.useTwitchProfileImage ? item.image?.src : undefined;
    if (this.streamerBotSettings.winnerRevealedActionId) {
      this.streamerBotService.runAction(this.streamerBotSettings.winnerRevealedActionId, winner);
    }

    const canConfirm =
      (this.wheelSettings.wheelEntryType === WheelEntryType.Twitch && this.twitchSettings.twitchAuthToken !== null) ||
      this.wheelSettings.wheelEntryType === WheelEntryType.StreamerBot;

    const data = {
      winner,
      entryCount: this.items.length,
      runTimer: canConfirm && this.winnerSettings.winnerRequireConfirmation,
      imgSrc: winnerImgSrc
    }; 

    this.modalService.open(WinnerModalComponent, data, (result: WinnerResult) => {
      if (result === WinnerResult.Confirm) {
        this.addGiveawayWinner(winner);
        if (this.winnerSettings.winnerRemove === WinnerRemoveType.RemoveAll) {
          this.removeAllFromWheel(winner);
        }
        else if (this.winnerSettings.winnerRemove === WinnerRemoveType.RemoveOne) {
          this.removeOneFromWheel(winner);
        }

        if (this.streamerBotSettings.winnerConfirmedActionId) {
          this.streamerBotService.runAction(this.streamerBotSettings.winnerConfirmedActionId, winner);
        }
      }
      else if (result == WinnerResult.Lapsed) {
        if (this.streamerBotSettings.winnerLapsedActionId) {
          this.streamerBotService.runAction(this.streamerBotSettings.winnerLapsedActionId);
        }

        this.removeAllFromWheel(winner);
      }
      else {
        if (this.streamerBotSettings.reRollActionId) {
          this.streamerBotService.runAction(this.streamerBotSettings.reRollActionId);
        }
      }

      this.settingsService.forceRefresh();
    });
  }

  addGiveawayWinner(winner: string) {
    if (this.currentGiveaway?.trackWinners) {
      this.currentGiveaway.winners = [...(this.currentGiveaway.winners ?? []), winner];
      this.giveawayService.saveGiveaway(this.currentGiveaway, this.currentGiveawayIndex!);
    }
  }

  connectToStreamerBot() {
    this.streamerBotConnecting = true;
    this.streamerBotConnected = false;
    this.streamerBotConnectedError = false;
    this.streamerBotService.connect(
      () => {
        this.streamerBotConnecting = false;
        this.streamerBotConnected = true;
        this.streamerBotConnectedError = false;
      },
      () => {
        this.streamerBotConnecting = false;
        this.streamerBotConnected = false;
        this.streamerBotConnectedError = true;
      }
    );
  }

  sendGiveawayInfoToStreamerbot() {
    this.streamerBotService.sendGiveawayData(this.streamerBotSettings.sendGiveawayDataActionId!, this.currentGiveaway!);
  }

  closeFileWatch() {
    this.wheelService.updateItems([]);
    this.fileService.unwatchFile(
      () => {
        this.isFileWatching = false;
        this.isFileError = false;
      },
      () => {
        this.isFileError = true;
      }
    );
  }

  openFileWatch(filepath: string | null, file: File | null) {
    if (!filepath && !file) {
      return;
    }

    this.fileService.watchFile(filepath, file,
      (path: string) => {
        if (!path) {
          return;
        }

        this.isFileWatching = true;
        this.isFileError = false;
        this.settingsService.saveSetting('entriesFilePath', path);
      },
      () => {
        this.isFileWatching = false;
        this.isFileError = true;
      }
    );
  }

  handleTwitchMessage(message: TwitchChatMessage | null) {
    if (!this.chatInitialized) {
      this.chatInitialized = true;
      return;
    }

    if (!message || this.isSpinning || this.wheelSettings.wheelEntryType !== WheelEntryType.Twitch) {
      return;
    }

    var userId = message.chatter_user_id;
    var username = message.chatter_user_name;
    var messageText = message.message.text.toLowerCase();

    if (messageText === this.twitchSettings?.twitchEnterCommand?.toLowerCase()) {
      const newItem: Partial<Item> = { label: username, imageRadius: .9, imageScale: 0.5 };
      if (this.twitchSettings.useTwitchUserColors) {
        var color = message.color;
        newItem.backgroundColor = color;
        newItem.labelColor = getVisibleTextColor(color);
      }

      if (this.twitchSettings.showTwitchProfileImages) {
        this.twitchService.getUserProfileImage(this.authToken, +userId).pipe(take(1)).subscribe((response: any) => {
          const imageUrl = response.data[0].profile_image_url;
          newItem.image = new Image(70, 70);
          newItem.image.src = imageUrl;

          this.addToWheel(newItem, true);
        })
      }
      else {
        this.addToWheel(newItem, true);
      }
    }

    if (messageText === this.twitchSettings?.twitchRemoveCommand?.toLowerCase()) {
      this.removeAllFromWheel(username);
    }

    // Broadcaster can add to wheel freely
    if (userId === this.twitchBroadcasterUserId) {
      const messages = messageText.split(' ');
      if (messages.length > 1) {
        if (messages[0] === this.twitchSettings?.twitchEnterCommand?.toLowerCase()) {
          this.addToWheel({ label: messages[1].replace('@', '') }, true);
        }
        if (messages[0] === this.twitchSettings?.twitchRemoveCommand?.toLowerCase()) {
          this.removeAllFromWheel(messages[1].replace('@', ''));
        }
      }
    }
  }

  updateWheelItems(items: Partial<Item>[]) {
    this.items = items;
    if (!this.wheelSettings) {
      return;
    }

    this.isOverTopWheelMax = items.length > this.wheelSettings.maxTopWheelWedges;
    if (this.isOverTopWheelMax && this.wheelSettings.wheelDisplayType === WheelDisplayTypes.Wheel) {
      this.wheelSettings.wheelDisplayType = WheelDisplayTypes.SideWheel;
    }
  }

  updateTwitchAuthToken(token: string) {
    if (token !== this.authToken) {
      this.twitchService.saveSetting('twitchAuthToken', token);
      this.authToken = token;
      this.twitchService.openListener(token);
    }
  }

  onFileWatchChange(data: string | null) {
    if (data === null || this.wheelSettings.wheelEntryType !== WheelEntryType.File) {
      return;
    }

    const newItems: Partial<Item>[] = data.split('\n').filter(line => line?.trim().length > 0).map(line => {
      const lineSplit = line.split(' ');
      const last = lineSplit[lineSplit.length - 1].replace('\r', '').replace('\n', '');
      if (lineSplit.length > 1 && last.match(/#[0-9a-fA-F]{6}/g)) {
        const backgroundColor = lineSplit[lineSplit.length - 1];
        const labelColor = getVisibleTextColor(backgroundColor);
        return { label: lineSplit.slice(0, lineSplit.length - 1).join(' '), labelColor, backgroundColor }
      }

      return { label: line };
    });


    this.wheelService.updateItems(newItems);
  }

  onFileWatchSelected(event: any) {
    const file = event.target.files[0];
    this.openFileWatch(null, file);
  }

  onFileWatchError(isError: boolean) {
    if (!isError) {
      return;
    }

    this.isFileWatching = false;
    this.isFileError = true;
  }

  private onWheelSettingsUpdate(ws: WheelSettings) {
    this.wheelSettings = ws;
    if (ws.wheelEntryType === WheelEntryType.File && !this.isFileWatching) {
      this.openFileWatch(ws.entriesFilePath, null);
    }
    else if (ws.wheelEntryType !== WheelEntryType.File && this.isFileWatching) {
      this.closeFileWatch();
    }

    if (this.items) {
      this.updateWheelItems(this.items);
    }
  }

  private onStreamerBotEvent(event: StreamerBotEvent | null) {
    if (!event || this.wheelSettings?.wheelEntryType !== WheelEntryType.StreamerBot) {
      return;
    }

    if (event.eventName === this.streamerBotSettings.addNameEventName) {
      const username = event.args['targetUser'] as string;
      const backgroundColor = this.streamerBotSettings.useStreamerBotColorsOnWheel ? event.args['color'] as string : null;
      const labelColor = backgroundColor ? getVisibleTextColor(backgroundColor) : null;
      const newItem: Partial<Item> = { label: username, backgroundColor, labelColor, imageRadius: .9, imageScale: 0.6 };

      if (this.streamerBotSettings.showTwitchProfileImages) {
        const imageUrl = event.args['targetUserProfileImageUrl'] as string;
        newItem.image = new Image(70, 70);
        newItem.image.src = imageUrl;
      }

      this.addToWheel(newItem, true);
    }
    else if (event.eventName === this.streamerBotSettings.removeNameEventName) {
      const username = event.args['targetUser'] as string;
      this.removeAllFromWheel(username);
    }
    else if (event.eventName === this.streamerBotSettings.clearWheelEventName) {
      this.clearWheel();
    }
  }
}
