import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { debounceTime, fromEvent, skip, Subject, Subscription, takeUntil } from 'rxjs';
import { Item } from 'spin-wheel-ts';
import { WheelDisplayTypes } from '../../../models/wheel-display-types';
import { WheelItemSettings } from '../../../models/wheel-item-settings';
import { WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';
import { WheelService } from '../../../services/wheel-service';
import { CurrentIndexChangeEvent } from '../../../types/wheel-types';
import { getTrueMod, getRandomNumber, shuffle } from '../../../util/helpers';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { easeOutCubic } from 'easing-utils';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { CountdownModalComponent } from '../../../modals/countdown-modal/countdown-modal.component';
import { StyleSettings } from '../../../models/style-settings';
import { StyleService } from '../../../services/style-service';
import { StreamerBotService } from '../../../services/streamerbot-service';
import { AudioService } from '../../../services/audio-service';
import { StreamerBotSettings } from '../../../models/streamerbot-settings';
import { ModalService } from '../../../services/modal-service';

@Component({
  selector: 'app-wheel-main-side',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, ZuluButtonComponent],
  templateUrl: './wheel-main-side.component.html',
  styleUrl: './wheel-main-side.component.scss'
})
export class WheelMainSideComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() items: Partial<Item>[];
  @Input() runCountdown: boolean = false;
  @Input() isMaximized: boolean = false;
  @Output() winnerRevealed = new EventEmitter<Partial<Item>>();
  @Output() viewToggled = new EventEmitter();
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('canvasContainer') canvasContainer: ElementRef;
    
  private destroy$ = new Subject<void>();

  oldSettings: WheelSettings;
  oldStyleSettings: StyleSettings;
  oldItemSettings: WheelItemSettings[];

  settings: WheelSettings;
  styleSettings: StyleSettings;
  streamerBotSettings: StreamerBotSettings;

  prevWinners: Partial<Item>[];
  currentWinner: Partial<Item>;
  currentWinnerIndex: number;
  nextWinners: Partial<Item>[];
  isSpinning: boolean;
  visibleItems: Partial<Item>[] = [];
  topOffset: string = '0';
  topOffsetNum: number = 0;
  padding: number = 10;

  WheelDisplayTypes = WheelDisplayTypes;

  streamerBotSpinInitialized: boolean = false;

  _spinToTimeStart = 0;
  _spinToTimeEnd: number | null = null;

  blockSize: number = 0;

  private wheelSettingsSubscription: Subscription;
  private wheelSettingsRefreshSubscription: Subscription;
  private styleSettingsSubscription: Subscription;
  private spinWheelSubscription: Subscription;
  private streamerBotSubscription: Subscription;

  constructor(private settingsService: SettingsService, private styleService: StyleService, private wheelService: WheelService, private modalService: ModalService,
    private streamerBotService: StreamerBotService, private audioService: AudioService) { }

  ngOnInit(): void {
    this.wheelSettingsSubscription = this.settingsService.wheelSettings$.subscribe(ws => {
      this.isSpinning = false;
      this.wheelService.updateIsSpinning(false);
      this.initWheelItems();

      this.settings = ws;
      this.oldSettings = { ...this.settings };
      this.oldItemSettings = ws.itemSettings.map((i: WheelItemSettings) => ({ pieColor: i.pieColor, pieFontColor: i.pieFontColor }));
    });

    this.wheelSettingsRefreshSubscription = this.settingsService.wheelSettingsRefresh$.subscribe(() => {
      this.initWheelItems();
    });

    this.styleSettingsSubscription = this.styleService.styleSettings$.subscribe(ss => {
      this.initWheelItems();

      this.styleSettings = ss;
      this.oldStyleSettings = { ...this.styleSettings };
    });

    this.streamerBotSubscription = this.streamerBotService.streamerBotSettings$.subscribe(ss => this.streamerBotSettings = ss);

    this.spinWheelSubscription = this.streamerBotService.events$.pipe(skip(1)).subscribe((event) => {
      if (event?.eventName === this.streamerBotSettings.spinWheelEventName && !this.isSpinning) {
        this.initiateSpin();
      }
    });
    
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.initWheelItems();
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initWheelItems();
    }, 100);
  }

  ngOnDestroy(): void {
    this.wheelSettingsSubscription.unsubscribe();
    this.wheelSettingsRefreshSubscription.unsubscribe();
    this.styleSettingsSubscription.unsubscribe();
    this.spinWheelSubscription.unsubscribe();
    this.streamerBotSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.settings && changes['items']) {
      const newItems = changes['items'].currentValue as Partial<Item>[];
      this.initWheelItems();

      if (newItems.length === 0) {
        this.clear();
      }
    }
  }

  initWheelItems() {
    this.items = shuffle([...this.items]);
    this.populateWinnerItems(0);
    setTimeout(() => {
      this.draw();
    }, 10);
  }

  onWheelRest() {
    this.isSpinning = false;
    this.wheelService.updateIsSpinning(false);

    if (this.winnerRevealed) {
      this.winnerRevealed.emit(this.currentWinner);
    }
  }

  onWheelCurrentIndexChange(e: CurrentIndexChangeEvent) {
    this.populateWinnerItems(e.currentIndex);
    if (this.isSpinning) {
      this.audioService.playAudio('wheelTick', true);
    }
  }

  populateWinnerItems(index: number) {
    if (this.items.length === 0 || !this.settings) {
      return; 
    }

    this.currentWinnerIndex = index;

    const currentItem = this.items[index];
    this.currentWinner = currentItem;

    let prevItems: Partial<Item>[] = [];
    let nextItems: Partial<Item>[] = [];
    for (let i = 0; i < this.settings.sideWheelEntries; i++) {
      prevItems = [...prevItems, this.getOffsetItem(index, i + 1)];
      nextItems = [this.getOffsetItem(index, -1 * (i + 1)), ...nextItems];
    }

    this.prevWinners = prevItems;
    this.nextWinners = nextItems.reverse();
  }

  getOffsetItem(index: number, offset: number) {
    return this.items[getTrueMod(index + offset, this.items.length)]
  }

  spinToItem(settings: WheelSettings) {
    if (this.items.length === 0) {
      return;
    }

    const winningIndex = getRandomNumber(0, this.items.length - 1);
    const duration = getRandomNumber(settings.minDuration * 1000, settings.maxDuration * 1000);
    const revolutions = Math.max(1, Math.floor(250 / this.items.length));

    this.isSpinning = true;
    this.blockSize = winningIndex + (revolutions * this.items.length) + Math.random();
    this.wheelService.updateIsSpinning(true);

    this._spinToTimeStart = performance.now();
    this._spinToTimeEnd = this._spinToTimeStart + duration;
    this.animate();
  }

  changeWheelDisplayType(type: WheelDisplayTypes) {
    this.settings.wheelDisplayType = type;
  }

  draw() {
    if (!this.canvas || !this.canvasContainer || !this.currentWinner) {
      return;
    }

    this.canvas.nativeElement.style.width = this.canvasContainer.nativeElement.clientWidth + 'px';
    this.canvas.nativeElement.style.height = this.canvasContainer.nativeElement.clientHeight + 'px';
    this.canvas.nativeElement.width = this.canvasContainer.nativeElement.clientWidth;
    this.canvas.nativeElement.height = this.canvasContainer.nativeElement.clientHeight;

    const scale = 2;
    const winnerFontSize = 60;
    const padding = 10;
    const borderRadius = 20;

    const ctx = this.canvas.nativeElement.getContext("2d");
    const centerX = this.canvas.nativeElement.width / 2;
    const centerY = this.canvas.nativeElement.height / 2;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    let currentFontSize = winnerFontSize, currentYOffset = 0, itemOffset = (winnerFontSize * this.topOffsetNum * scale);

    const winnerItemSize = winnerFontSize;

    for (let i = 0; i < this.settings.sideWheelEntries; i++) {
      currentFontSize = (winnerFontSize / (scale));
      currentYOffset += (currentFontSize * scale);
      itemOffset = (currentFontSize * this.topOffsetNum * scale);

      const nextItemSize = currentFontSize;
      ctx.font = `${nextItemSize}px ${this.styleSettings.globalFont}`;

      const nextY = centerY + currentYOffset + itemOffset;
      const prevY = centerY - currentYOffset + itemOffset;

      ctx.beginPath();
      ctx.fillStyle = this.nextWinners[i].backgroundColor ?? this.settings.itemSettings[getTrueMod(getTrueMod(this.currentWinnerIndex - (i + 1), this.items.length), this.settings.itemSettings.length)].pieColor;
      ctx.roundRect(padding * 16, nextY - (currentFontSize / 2) - (padding / 2), this.canvas.nativeElement.width - (padding * 32), currentFontSize + (padding), borderRadius);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = this.prevWinners[i].backgroundColor ?? this.settings.itemSettings[getTrueMod(getTrueMod(this.currentWinnerIndex + i + 1, this.items.length), this.settings.itemSettings.length)].pieColor;
      ctx.roundRect(padding * 16, prevY - (currentFontSize / 2) - (padding / 2), this.canvas.nativeElement.width - (padding * 32), currentFontSize + (padding), borderRadius);
      ctx.fill();

      ctx.fillStyle = this.nextWinners[i].labelColor ?? this.settings.itemSettings[getTrueMod(getTrueMod(this.currentWinnerIndex - (i + 1), this.items.length), this.settings.itemSettings.length)].pieFontColor;
      ctx.fillText(this.nextWinners[i].label, centerX, nextY);

      ctx.fillStyle = this.prevWinners[i].labelColor ?? this.settings.itemSettings[getTrueMod(getTrueMod(this.currentWinnerIndex + i + 1, this.items.length), this.settings.itemSettings.length)].pieFontColor;
      ctx.fillText(this.prevWinners[i].label, centerX, prevY);
    }

    ctx.font = `${winnerItemSize}px ${this.styleSettings.globalFont}`;
    ctx.fillStyle = this.styleSettings.globalBackgroundColor;
    ctx.strokeStyle = this.styleSettings.globalFontColor;
    ctx.beginPath();
    ctx.roundRect(padding, centerY - (winnerFontSize / 2) - padding, this.canvas.nativeElement.width - (padding * 2), winnerFontSize + (padding * 2), borderRadius);
    ctx.stroke();
    ctx.fill();

    if (this.currentWinner.image) {
      ctx.drawImage(this.currentWinner.image, padding + borderRadius, centerY - (winnerFontSize / 2) - padding + (borderRadius / 2), winnerFontSize, winnerFontSize);
    }

    ctx.fillStyle = this.styleSettings.globalFontColor;
    ctx.fillText(this.currentWinner.label, centerX, centerY);
  }

  animate(now = 0) {
    if (!this._spinToTimeEnd) {
      return;
    }

    if (now > this._spinToTimeEnd) {
      this.onWheelRest();
      return;
    }

    const duration = this._spinToTimeEnd - this._spinToTimeStart;
    const delta = Math.max((now - this._spinToTimeStart) / duration, 0);
    const currentPoint = this.blockSize * easeOutCubic(delta);

    const currentPointIndex = Math.floor(currentPoint);
    const currentBlockPercent = currentPointIndex + 1 - currentPoint
    this.topOffsetNum = 0.5 - (currentBlockPercent);
    
    const currentWinnerIndex = currentPointIndex % this.items.length;
    if (currentWinnerIndex !== this.currentWinnerIndex) {
      this.audioService.playAudio('wheelTick', true);
      this.populateWinnerItems(currentWinnerIndex);
    }
    
    this.draw();
    requestAnimationFrame((t) => this.animate(t));
  }

  clear() {
    const context = this.canvas.nativeElement.getContext('2d');
    context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  initiateSpin() {
    if (!this.runCountdown) {
      this.spinToItem(this.settings);
      return;
    }

    this.openCountdownModal();
  }

  openCountdownModal() {
    this.modalService.open(CountdownModalComponent, {}, (result: boolean) => {
      if (result) {
        this.spinToItem(this.settings);
      }
    });
  }

  toggleMaximize() {
    this.viewToggled.emit();
    setTimeout(() => this.initWheelItems(), 10);
  }
}
