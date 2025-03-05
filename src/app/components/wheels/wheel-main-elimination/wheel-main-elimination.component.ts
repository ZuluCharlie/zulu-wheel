import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { WheelSettings } from '../../../models/wheel-settings';
import { Item } from 'spin-wheel-ts';
import { SettingsService } from '../../../services/settings-service';
import { WheelService } from '../../../services/wheel-service';
import { getRandomNumber, toRad } from '../../../util/helpers';
import { easeOutCubic } from 'easing-utils';
import { CountdownModalComponent } from '../../../modals/countdown-modal/countdown-modal.component';
import { debounceTime, fromEvent, skip, Subject, Subscription, takeUntil } from 'rxjs';
import { StyleService } from '../../../services/style-service';
import { StyleSettings } from '../../../models/style-settings';
import { StreamerBotService } from '../../../services/streamerbot-service';
import { AudioService } from '../../../services/audio-service';
import { StreamerBotSettings } from '../../../models/streamerbot-settings';
import { ModalService } from '../../../services/modal-service';

export interface EliminationItem {
  label: string;
  x: number;
  y: number;
  rotation: number;
  color: string | null;
  backgroundColor: string | null;
  textWidth: number;
  currentSize: number;
  isEliminated: boolean;
  image: HTMLImageElement | null | undefined;
  eliminatedAt?: number;
  fadeAngle?: number;
}

@Component({
  selector: 'app-wheel-main-elimination',
  standalone: true,
  imports: [CommonModule, ZuluButtonComponent],
  templateUrl: './wheel-main-elimination.component.html',
  styleUrl: './wheel-main-elimination.component.scss'
})
export class WheelMainEliminationComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() items: Partial<Item>[];
  @Input() runCountdown: boolean = false;
  @Input() isMaximized: boolean = false;
  @Output() winnerRevealed = new EventEmitter<EliminationItem>();
  @Output() viewToggled = new EventEmitter();
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('canvasContainer') canvasContainer: ElementRef;
  
  private destroy$ = new Subject<void>();

  settings: WheelSettings;
  styleSettings: StyleSettings;
  streamerBotSettings: StreamerBotSettings;

  isSpinning: boolean;
  loading: boolean = false;

  fontSize: number = 30;
  borderRadius: number = 10;
  padding: number = 10;
  fadeScale: number = 0.6;
  scaleDownTime: number = 300;
  maxEntriesForAnimation: number = 1500;

  settingsServiceSubscription: Subscription;
  wheelServiceSubscription: Subscription;
  styleServiceSubscription: Subscription;
  spinWheelSubscription: Subscription;
  wheelSettingsRefreshSubscription: Subscription;
  streamerBotSubscription: Subscription;

  streamerBotSpinInitialized: boolean = false;

  drawnItems: EliminationItem[] = [];

  _spinToTimeStart = 0;
  _spinToTimeEnd: number | null = null;

  constructor(private settingsService: SettingsService, private styleService: StyleService, private wheelService: WheelService, private modalService: ModalService,
    private streamerBotService: StreamerBotService, private audioService: AudioService) { }

  ngOnInit(): void {
    this.settingsServiceSubscription = this.settingsService.wheelSettings$.subscribe(ws => {
      this.isSpinning = false;
      this.wheelService.updateIsSpinning(false);

      this.settings = ws;
    });

    this.wheelServiceSubscription = this.wheelService.wheelIsSpinning$.subscribe((isSpinning) => {
      this.isSpinning = isSpinning;
    });

    this.styleServiceSubscription = this.styleService.styleSettings$.subscribe(ss => this.styleSettings = ss);
    this.streamerBotSubscription = this.streamerBotService.streamerBotSettings$.subscribe(ss => this.streamerBotSettings = ss);

    this.spinWheelSubscription = this.streamerBotService.events$.pipe(skip(1)).subscribe((event) => {
      if (this.isSpinning) {
        return;
      }

      if (event?.eventName === this.streamerBotSettings.spinWheelEventName) {
        this.initiateSpin();
      }
    });

    this.wheelSettingsRefreshSubscription = this.settingsService.wheelSettingsRefresh$.pipe(skip(1)).subscribe(() => {
      this.initItems();
      this.drawAll();
    });

    fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.initItems();
        this.drawAll();
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initItems();
      this.drawAll();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.settings && changes['items']) {
      const newItems = changes['items'].currentValue as Partial<Item>[];

      const itemsDeleted = this.drawnItems.some(item => !newItems.some(i => i.label === item.label));
      const shuffled = this.drawnItems.length === newItems.length;
      if (newItems.length === 0) {
        this.clear();
      }
      else if (itemsDeleted || shuffled) {
        this.initItems();
      }
      else {
        newItems.filter(item => !this.drawnItems.some(i => i.label === item.label)).forEach(item => this.addItem(item.label!, item.labelColor, item.backgroundColor, item.image));
      }

      this.drawAll();
    }
  }

  ngOnDestroy() {
    this.settingsServiceSubscription.unsubscribe();
    this.wheelServiceSubscription.unsubscribe();
    this.styleServiceSubscription.unsubscribe();
    this.wheelSettingsRefreshSubscription.unsubscribe();
    this.streamerBotSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  initItems() {
    this.clear();
    this.items.forEach(item => this.addItem(item.label!, item.labelColor, item.backgroundColor, item.image));
  }

  addItem(label: string, color: string | null | undefined, background: string | null | undefined, image: HTMLImageElement | null | undefined) {
    const rotation = toRad(getRandomNumber(-45, 45));
    const hasImage = image !== null && image !== undefined;
    const bounds = this.getTrueBoundingBox(label, rotation, hasImage);

    const newItem: EliminationItem = {
      label: label,
      x: getRandomNumber(bounds.minX, bounds.maxX),
      y: getRandomNumber(bounds.minY, bounds.maxY),
      rotation,
      color: color ?? this.settings.itemSettings[this.drawnItems.length % this.settings.itemSettings.length].pieFontColor,
      backgroundColor: background ?? this.settings.itemSettings[this.drawnItems.length % this.settings.itemSettings.length].pieColor,
      textWidth: bounds.textWidth,
      currentSize: 1,
      isEliminated: false,
      image
    };

    this.drawnItems = [...this.drawnItems, newItem];
  }

  getTrueBoundingBox(label: string, rotation: number, includeImage: boolean) {
    const ctx = this.canvas.nativeElement.getContext('2d');
    ctx.font = `${this.fontSize}px ${this.styleSettings.globalFont}`;
    const maxWidth = this.canvasContainer.nativeElement.clientWidth;
    const maxHeight = this.canvasContainer.nativeElement.clientHeight;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    const imageWidth = includeImage ? this.fontSize + this.borderRadius : 0;
    const textMeasurements = ctx.measureText(label);
    const textWidth = textMeasurements.width + imageWidth;
    const textHeight = textMeasurements.actualBoundingBoxDescent - textMeasurements.actualBoundingBoxAscent;

    const xOffset = textWidth * Math.cos(rotation);
    const yOffset = -1 * textWidth * Math.sin(rotation); // rotations happen clockwise on the canvas, the opposite of what you would expect from a unit circle

    return ({
      minX: (xOffset / 2),
      maxX: maxWidth - (xOffset / 2),
      minY: Math.abs(yOffset / 2),
      maxY: maxHeight - Math.abs(yOffset / 2),
      textWidth
    })
  }

  drawAll(now = 0) {
    if (!this.canvas || !this.canvasContainer) {
      return;
    }

    this.canvas.nativeElement.style.width = this.canvasContainer.nativeElement.clientWidth + 'px';
    this.canvas.nativeElement.style.height = this.canvasContainer.nativeElement.clientHeight + 'px';
    this.canvas.nativeElement.width = this.canvasContainer.nativeElement.clientWidth;
    this.canvas.nativeElement.height = this.canvasContainer.nativeElement.clientHeight;

    const ctx = this.canvas.nativeElement.getContext('2d');

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    ctx.font = `${this.fontSize}px ${this.styleSettings.globalFont}`;
    this.drawnItems.forEach(item => {

      if (item.isEliminated) {
        item.currentSize = (this.scaleDownTime - (now - item.eliminatedAt!)) / this.scaleDownTime;
      }

      if (item.currentSize <= 0) {
        return;
      }

      ctx.fillStyle = item.backgroundColor;
      ctx.translate(item.x, item.y);
      ctx.scale(item.currentSize, item.currentSize);
      ctx.rotate(item.rotation + toRad((item.fadeAngle ?? 0) * (1 - item.currentSize)));
      ctx.globalAlpha = 1 - ((1 - item.currentSize) * this.fadeScale);

      ctx.beginPath();
      ctx.roundRect(
        0 - (item.textWidth / 2) - this.padding,
        0 - (this.fontSize / 2) - this.padding,
        item.textWidth + (2 * this.padding),
        this.fontSize + (2 * this.padding),
        this.borderRadius
      );
      ctx.fill();

      const xStart = item.image ? this.fontSize + this.borderRadius : 0;
      ctx.fillStyle = item.color;
      ctx.fillText(item.label, xStart - (item.textWidth / 2), 0 - (this.fontSize / 2));

      if (item.image) {
        if (item.image.complete) {
          ctx.drawImage(item.image, 0 - (item.textWidth / 2), 0 - (this.fontSize / 2), this.fontSize, this.fontSize);
        }
        else {
          item.image.decode().then(() => {
            ctx.translate(item.x, item.y);
            ctx.scale(item.currentSize, item.currentSize);
            ctx.globalAlpha = 1 - ((1 - item.currentSize) * this.fadeScale);
            ctx.rotate(item.rotation + toRad((item.fadeAngle ?? 0) * (1 - item.currentSize)));
            ctx.drawImage(item.image, 0 - (item.textWidth / 2), 0 - (this.fontSize / 2), this.fontSize, this.fontSize);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 1;
          });
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
    });
  }

  spin(settings: WheelSettings) {
    if (this.drawnItems.length !== this.items.length) {
      this.initItems();
    }

    const duration = getRandomNumber(settings.minDuration * 1000, settings.maxDuration * 1000);

    this._spinToTimeStart = performance.now();
    this._spinToTimeEnd = this._spinToTimeStart + duration;

    this.wheelService.updateIsSpinning(true);
    this.animate();
  }

  clear() {
    this.drawnItems = [];
    const context = this.canvas.nativeElement.getContext('2d');
    context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  animate(now = 0) {
    if (!this._spinToTimeEnd) {
      return;
    }

    const duration = this._spinToTimeEnd - this._spinToTimeStart;
    const delta = Math.max((now - this._spinToTimeStart) / duration, 0);
    const currentLeft = this.items.length - Math.floor(this.items.length * easeOutCubic(delta)) + 1;

    while (this.drawnItems.filter(i => !i.isEliminated).length > Math.max(currentLeft, 1)) {
      const index = getRandomNumber(0, this.drawnItems.length - 1);

      if (!this.drawnItems[index].isEliminated) {
        this.drawnItems[index].isEliminated = true;
        this.drawnItems[index].eliminatedAt = now;
        this.drawnItems[index].fadeAngle = getRandomNumber(-45, 45);
        this.audioService.playAudio('wheelTick', true);
      }
    }

    this.drawAll(now);
    this.drawnItems = this.drawnItems.filter((i) => i.currentSize > 0);
    if (this.drawnItems.length === 1) {
      if (this.winnerRevealed) {
        this.winnerRevealed.emit(this.drawnItems[0]);
      }

      this.wheelService.updateIsSpinning(false);
      return;
    }

    requestAnimationFrame((t) => this.animate(t));
  }

  getRandomWedgeColors() {
    const red = getRandomNumber(0, 255);
    const green = getRandomNumber(0, 255);
    const blue = getRandomNumber(0, 255);

    const backgroundColor = `#${('00' + red.toString(16)).slice(-2)}${('00' + green.toString(16)).slice(-2)}${('00' + blue.toString(16)).slice(-2)}`;

    return backgroundColor;
  }

  initiateSpin() {
    if (!this.runCountdown) {
      this.spin(this.settings);
      return;
    }

    this.openCountdownModal();
  }

  openCountdownModal() {
    this.modalService.open(CountdownModalComponent, {}, (result: boolean) => {
      if (result) {
        this.spin(this.settings);
      }
    });
  }

  toggleMaximize() {
    this.viewToggled.emit();
    setTimeout(() => {
      this.initItems();
      this.drawAll();
    }, 10);
  }
}
