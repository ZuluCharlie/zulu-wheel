import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Item } from 'spin-wheel-ts';
import { SettingsService } from '../../../services/settings-service';
import { WheelService } from '../../../services/wheel-service';
import { WheelEntryType, WheelSettings } from '../../../models/wheel-settings';
import { TwitchService } from '../../../services/twitch-service';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { Subscription } from 'rxjs';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { ZuluTextareaComponent } from '../../zulu-tools/zulu-textarea/zulu-textarea.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZuluCardComponent,
    MainStyleDirective,
    ZuluTextareaComponent
],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss'
})
export class ItemsListComponent {
  @Input() initItems: Partial<Item>[];

  itemsStr: string;
  items: Partial<Item>[];
  settings: WheelSettings;
  isSpinning: boolean = false;
  chatInitialized: boolean = false;
  twitchBroadcasterUserId: string;
  authToken: string;
  isManual: boolean;

  WheelEntryType = WheelEntryType;

  constructor(private settingsService: SettingsService, private wheelService: WheelService, private twitchService: TwitchService) { 
    this.wheelService.wheelIsSpinning$.pipe(takeUntilDestroyed()).subscribe(ws => this.isSpinning = ws);
    this.twitchService.twitchUserId$.pipe(takeUntilDestroyed()).subscribe(id => this.twitchBroadcasterUserId = id);
    this.wheelService.wheelItems$.pipe(takeUntilDestroyed()).subscribe(items => {
      this.items = items;
      this.itemsStr = this.items.map(i => i.label).join('\n');
    });
    
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.settings = ws;
      this.isManual = ws.wheelEntryType === WheelEntryType.Manual;
    });
  }

  onItemsChange(e: string) {
    this.items = e.split('\n').map(i => ({ label: i.trim() })).filter(i => i.label.length > 0);
    this.wheelService.updateItems(this.items);
  }
}
