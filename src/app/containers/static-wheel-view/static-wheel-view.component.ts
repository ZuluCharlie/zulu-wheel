import { Component, OnInit } from '@angular/core';
import { StaticWheelItemsComponent } from "../../components/displays/static-wheel-items/static-wheel-items.component";
import { StaticWheelSettingsComponent } from "../../components/settings/static-wheel-settings/static-wheel-settings.component";
import { StaticWheelItemSettingsComponent } from "../../components/settings/static-wheel-item-settings/static-wheel-item-settings.component";
import { StaticWheel, StaticWheelItem } from '../../models/static-wheel';
import { StaticWheelService } from '../../services/static-wheel-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectOption, ZuluSelectComponent } from "../../components/zulu-tools/zulu-select/zulu-select.component";
import { SelectValue, WheelSettings } from '../../models/wheel-settings';
import { ZuluButtonComponent } from "../../components/zulu-tools/zulu-button/zulu-button.component";
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal-service';
import { Item } from 'spin-wheel-ts';
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { StreamerBotService } from '../../services/streamerbot-service';
import { WinnerModalComponent } from '../../modals/winner-modal/winner-modal.component';
import { WinnerResult } from '../../models/winner-result';
import { TwitchMessagesComponent } from "../../components/displays/twitch-messages/twitch-messages.component";
import { ZuluInputComponent } from "../../components/zulu-tools/zulu-input/zulu-input.component";
import { ZuluCardComponent } from "../../components/zulu-tools/zulu-card/zulu-card.component";
import { AudioSettingsItem } from '../../models/audio-settings';

@Component({
  selector: 'app-static-wheel-view',
  standalone: true,
  imports: [StaticWheelItemsComponent, StaticWheelSettingsComponent, StaticWheelItemSettingsComponent, ZuluSelectComponent, ZuluButtonComponent, CommonModule, WheelMainComponent, TwitchMessagesComponent, ZuluInputComponent, ZuluCardComponent],
  templateUrl: './static-wheel-view.component.html',
  styleUrl: './static-wheel-view.component.scss'
})
export class StaticWheelViewComponent implements OnInit {
  allWheels: SelectOption[] = [];
  currentWheel: StaticWheel | null;
  currentWheelIndex: number;
  isEditingWheel: boolean = false;
  currentEditingItem: StaticWheelItem | null = null;
  currentEditingItemIndex: number | null = null;

  wheelItems: Partial<Item>[] = [];
  wheelSettings: Partial<WheelSettings> | null = null;
  wheelTick: AudioSettingsItem | null = null;
  showPointer: boolean;
  isHotSeatOpen: boolean = false;
  hotSeatChatters: string[] = [];
  maximized: boolean = false;

  constructor(
    private staticWheelService: StaticWheelService,
    private modalService: ModalService,
    private streamerBotService: StreamerBotService) {
    this.staticWheelService.allStaticWheels$.pipe(takeUntilDestroyed()).subscribe(staticWheels => {
      this.allWheels = staticWheels.map((w, i) => ({
        label: w.name,
        value: i,
        disabled: false
      }));

      if (this.currentWheelIndex !== null) {
        this.currentWheel = staticWheels[this.currentWheelIndex];

        if (this.currentEditingItemIndex !== null) {
          this.currentEditingItem = this.currentWheel.items[this.currentEditingItemIndex];
        }
      }
    });

    this.staticWheelService.currentStaticWheel$.pipe(takeUntilDestroyed()).subscribe(staticWheel => {
      this.currentWheel = staticWheel;
      this.wheelSettings = this.buildWheelSettings();
      this.wheelItems = this.buildWheelItems();
      this.wheelTick = !staticWheel?.wheelTickSoundPath ? null : {
        soundPath: staticWheel.wheelTickSoundPath,
        volume: staticWheel.wheelTickSoundVolume,
        muted: staticWheel.wheelTickSoundMute
      };
    });

    this.staticWheelService.currentStaticWheelIndex$.pipe(takeUntilDestroyed()).subscribe(currentWheelIndex => this.currentWheelIndex = currentWheelIndex ?? 0);
  }

  ngOnInit() {
    this.staticWheelService.getAllStaticWheels();
  }

  buildWheelSettings(): Partial<WheelSettings> | null {
    return !this.currentWheel ? null : {
      wheelCenterImagePath: this.currentWheel.wheelCenterImagePath,
      wheelOverlayImagePath: this.currentWheel.wheelOverlayImagePath,
      pointerAngle: this.currentWheel.pointerAngle,
      idleSpeed: this.currentWheel.idleSpeed,
      minPies: this.currentWheel.minPies,
      labelRadius: this.currentWheel.labelRadius
    }
  }

  buildWheelItems(): Partial<Item>[] {
    return !this.currentWheel ? [] : this.currentWheel.items.map((item, index) => ({
      backgroundColor: item.backgroundColor,
      image: !item.imagePath ? null : this.createImage(item.imagePath),
      imageOpacity: item.imageOpacity,
      imageRadius: item.imageRadius,
      imageRotation: item.imageRotation,
      imageScale: item.imageScale,
      label: item.label,
      labelColor: item.labelColor,
      value: index.toString(),
      weight: item.itemWeight
    }));
  }

  onSelect(e: SelectValue) {
    this.staticWheelService.setCurrentStaticWheel(e as number);
    this.currentEditingItem = null;
    this.currentEditingItemIndex = null;
  }

  onAddWheel() {
    this.staticWheelService.addStaticWheel().then(() => this.isEditingWheel = true);
  }

  onDeleteWheel() {
    const remainingWheelsCount = this.allWheels.length - 1;
    this.modalService.confirm(`Are you sure you want to delete ${this.currentWheel!.name}?`, () => {
      this.staticWheelService.deleteStaticWheel(this.currentWheelIndex!).then(() => {
        this.onSelect(remainingWheelsCount > 0 ? 0 : null);
      });
    });
  }

  onEditWheelItem(index: number | null) {
    this.isEditingWheel = false;
    this.currentEditingItemIndex = index;
    this.currentEditingItem = index === null ? null : this.currentWheel!.items[index];
  }

  onFinishEditWheelItem() {
    this.currentEditingItemIndex = null;
    this.currentEditingItem = null;
  }

  onDeleteWheelItem(index: number) {
    this.modalService.confirm(`Are you sure you want to delete ${this.currentWheel!.items[index].label}?`, () => {
      if (this.currentEditingItemIndex === index) {
        this.onEditWheelItem(null);
      }

      this.staticWheelService.deleteStaticWheelItem(this.currentWheelIndex!, index);
    });
  }

  toggleEdit() {
    this.isEditingWheel = !this.isEditingWheel;
  }

  createImage(imageUrl: string) {
    const image = new Image(70, 70);
    image.src = imageUrl;
    return image;
  }

  onWinnerDeclared(item: Item) {
    if (!this.currentWheel!.showWinnerPopup) {
      return;
    }

    const winningItem = this.currentWheel!.items[+(item.value!)];
    const winnerImgSrc = winningItem.imagePath;
    if (winningItem.itemWinningStreamerbotActionId) {
      this.streamerBotService.runAction(winningItem.itemWinningStreamerbotActionId);
    }

    const data = {
      winner: winningItem.label,
      entryCount: this.currentWheel!.items.length,
      runTimer: false,
      imgSrc: winnerImgSrc,
      winnerMessageOverride: winningItem.itemWinningMessage,
      winnerSoundOverride: {
        soundPath: winningItem.itemWinningSound,
        volume: winningItem.itemWinningSoundVolume,
        muted: winningItem.itemWinningSoundMute
      }
    };

    this.modalService.open(WinnerModalComponent, data, (result: WinnerResult) => {
      
    });
  }

  onShowPointer(e: boolean) {
    this.showPointer = e;
  }

  onHotSeatChattersChange(e: string) {
    this.hotSeatChatters = e.split(',').map(s => s.trim());
  }

  toggleHotSeat() {
    this.isHotSeatOpen = !this.isHotSeatOpen;
    if (this.isHotSeatOpen) {
      this.currentEditingItem = null;
      this.currentEditingItemIndex = null;
      this.isEditingWheel = false;
    }
  }

  toggleMaximize() {
    this.maximized = !this.maximized;
  }
}
