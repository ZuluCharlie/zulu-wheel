import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Item, Wheel } from 'spin-wheel-ts';
import { WheelSettings } from '../../../models/wheel-settings';
import { CurrentIndexChangeEvent, Props, RestEvent } from '../../../types/wheel-types';
import { CommonModule } from '@angular/common';
import { getRandomNumber, toRad } from '../../../util/helpers';
import { WheelDisplayTypes } from '../../../models/wheel-display-types';
import { WheelItemSettings } from '../../../models/wheel-item-settings';
import { MatButtonModule } from '@angular/material/button';
import { skip, Subscription } from 'rxjs';
import { spinFunctions } from '../../../models/wheel-spin-functions-lookup';
import { SettingsService } from '../../../services/settings-service';
import { WheelService } from '../../../services/wheel-service';
import { GuidGenerator } from '../../../util/guid-generator';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { CountdownModalComponent } from '../../../modals/countdown-modal/countdown-modal.component';
import { StyleService } from '../../../services/style-service';
import { StyleSettings } from '../../../models/style-settings';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { StreamerBotService } from '../../../services/streamerbot-service';
import { AudioService } from '../../../services/audio-service';
import { StreamerBotSettings } from '../../../models/streamerbot-settings';
import { ModalService } from '../../../services/modal-service';
import { AudioSettingsItem } from '../../../models/audio-settings';
import { MatIconModule } from '@angular/material/icon';


@Component({
  standalone: true,
  selector: 'app-wheel-main',
  templateUrl: './wheel-main.component.html',
  styleUrl: './wheel-main.component.scss',
  imports: [CommonModule, MatButtonModule, ZuluButtonComponent, MainStyleDirective, MatIconModule]
})
export class WheelMainComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() items: Partial<Item>[];
  @Input() runCountdown: boolean = false;
  @Input() showPointer: boolean = false;
  @Input() isMaximized: boolean = false;
  @Input() staticWheelSettings?: Partial<WheelSettings> | null = null;
  @Input() staticWheelTickOverride?: AudioSettingsItem | null = null;
  @Input() fontOverride?: string | null = null;
  @Output() winnerRevealed = new EventEmitter<Item>();
  @Output() viewToggled = new EventEmitter();
  @ViewChild('centerImage') centerImage: ElementRef<HTMLImageElement>;
  @ViewChild('wheelContainer') wheelContainer: ElementRef;
  @ViewChild('pointerCanvas') pointerCanvas: ElementRef<HTMLCanvasElement>;

  oldSettings: WheelSettings;
  oldStyleSettings: StyleSettings;
  oldItemSettings: WheelItemSettings[];

  wheel: Wheel;
  settings: WheelSettings;
  styleSettings: StyleSettings;
  streamerBotSettings: StreamerBotSettings;

  currentWinner: Item | null;
  currentWinnerIndex: number;
  isSpinning: boolean;
  visibleItems: Partial<Item>[] = [];

  isCenterImageLoaded: boolean = false;
  isCenterImageRotating: boolean = false;
  hasOverrideTick: boolean = false;

  streamerBotSpinInitialized: boolean = false;

  wheelTickSoundPath: string;

  uiGuid: string = `g${GuidGenerator.short()}`;

  WheelDisplayTypes = WheelDisplayTypes;

  private wheelSettingsSubscription: Subscription;
  private wheelSettingsRefreshSubscription: Subscription;
  private styleSettingsSubscription: Subscription;
  private spinWheelSubscription: Subscription;
  private streamerBotSubscription: Subscription;

  constructor(
    private renderer: Renderer2,
    private settingsService: SettingsService,
    private wheelService: WheelService,
    private styleService: StyleService,
    private modalService: ModalService,
    private streamerBotService: StreamerBotService,
    private audioService: AudioService
  ) { }

  ngOnInit(): void {
    this.wheelSettingsSubscription = this.settingsService.wheelSettings$.subscribe(ws => {
      this.settings = {...ws, ...this.staticWheelSettings ?? {}};
      this.isSpinning = false;
      this.wheelService.updateIsSpinning(false);
      if (!this.oldSettings || !this.oldItemSettings || this.shouldRedrawWheel(this.settings, this.styleSettings)) {
        this.initWheelItems(this.settings);
        this.drawWheel(this.settings, this.styleSettings);
      }

      this.oldSettings = { ...this.settings };
      this.oldItemSettings = this.settings.itemSettings.map((i: WheelItemSettings) => ({ pieColor: i.pieColor, pieFontColor: i.pieFontColor }));
      this.runIdleSpin(this.settings.idleSpeed);
    });

    this.streamerBotSubscription = this.streamerBotService.streamerBotSettings$.subscribe(ss => this.streamerBotSettings = ss);

    this.wheelSettingsRefreshSubscription = this.settingsService.wheelSettingsRefresh$.subscribe(() => {
      this.initWheelItems(this.settings);
      this.drawWheel(this.settings, this.styleSettings);
      this.runIdleSpin(this.settings.idleSpeed);
    });

    this.styleSettingsSubscription = this.styleService.styleSettings$.subscribe(ss => {
      if (!this.oldSettings || !this.oldItemSettings || this.shouldRedrawWheel(this.settings, ss)) {
        this.initWheelItems(this.settings);
        this.drawWheel(this.settings, ss);
      }

      this.styleSettings = ss;
      this.oldStyleSettings = { ...this.styleSettings };
    });

    this.spinWheelSubscription = this.streamerBotService.events$.pipe(skip(1)).subscribe((event) => {
      if (this.isSpinning) {
        return;
      }

      if (event?.eventName === this.streamerBotSettings.spinWheelEventName) {
        this.initiateSpin();
      }
    });
  }

  ngOnDestroy(): void {
    this.wheel?.remove();
    this.wheelSettingsSubscription.unsubscribe();
    this.wheelSettingsRefreshSubscription.unsubscribe();
    this.spinWheelSubscription.unsubscribe();
    this.styleSettingsSubscription.unsubscribe();
    this.streamerBotSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initWheel(), 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.settings) {
      return;
    }

    if (changes['items']) {
      const newItems = changes['items'].currentValue as Partial<Item>[];
      this.initWheelItems(this.settings, newItems);
      this.runIdleSpin(this.settings.idleSpeed);
    }

    if (changes['showPointer']) {
      const showPointer = changes['showPointer'].currentValue as boolean;
      if (showPointer) {
        this.drawPointerLine(this.staticWheelSettings?.pointerAngle ?? this.settings.pointerAngle);
      }
      else if (this.pointerCanvas) {
        const canvas = this.pointerCanvas.nativeElement!;
        const ctx = canvas.getContext('2d')!;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    if (changes['staticWheelSettings']) {
      const staticWheelSettings = changes['staticWheelSettings'].currentValue as Partial<WheelSettings>;
      if (!staticWheelSettings) {
        return;
      }

      this.settings = {...this.settings, ...staticWheelSettings};
      this.initWheelItems(this.settings);
      this.drawWheel(this.settings, this.styleSettings);
      this.runIdleSpin(this.settings.idleSpeed);
    }

    if (changes['staticWheelTickOverride']) {
      const audioSettingsItem = changes['staticWheelTickOverride'].currentValue as AudioSettingsItem | null;
      if (!audioSettingsItem) {
        this.hasOverrideTick = false;
        return;
      }

      this.audioService.createAudio(audioSettingsItem, 'wheelTickOverride');
      this.hasOverrideTick = true;
    }

    if (changes['fontOverride']) {
      const fontOverride = changes['fontOverride'].currentValue as string;
      this.initWheelItems(this.settings);
      this.drawWheel(this.settings, this.styleSettings);
      this.runIdleSpin(this.settings.idleSpeed);
    }
  }

  initWheel() {
    if (!this.wheelContainer) {
      return;
    }

    this.wheel = new Wheel(this.wheelContainer.nativeElement, {});
    if (this.wheel.canvas) {
      this.wheel.canvas.style.display = 'block';
    }

    this.drawWheel(this.settings, this.styleSettings);
    this.runIdleSpin(this.settings.idleSpeed);
  }

  initWheelItems(settings: WheelSettings, newItems: Partial<Item>[] = this.items) {
    if (!settings) {
      return;
    }

    const initWheelItems = newItems;
    let wheelItems = newItems;
    while (wheelItems.length > 0 && wheelItems.length < settings.minPies) {
      wheelItems = [...wheelItems, ...initWheelItems];
    }

    this.visibleItems = wheelItems;

    if (this.wheel) {
      this.wheel.items = wheelItems;
      this.wheel.itemLabelFontSizeMax = Math.max((60 - (2.5 * this.visibleItems.length)), 10);
      this.wheel.pixelRatio = this.getPixelRatio();

      const wheelHasImages = this.visibleItems.some(i => i.image);
      const minImageRadius = Math.min(...this.visibleItems.map(i => i.imageRadius ?? 1));
      this.wheel.itemLabelRadius = this.settings.labelRadius ?? (wheelHasImages ? minImageRadius - .1 : 0.95);
    }
  }

  drawWheel(settings: WheelSettings, styleSettings: StyleSettings) {
    if (!settings || !styleSettings || !this.wheel) {
      return;
    }

    const wheelHasImages = this.visibleItems.some(i => i.image);
    const minImageRadius = Math.min(...this.visibleItems.map(i => i.imageRadius ?? 1));
    const curRotation = this.wheel.rotation;
    const props: Partial<Props> = {
      items: this.visibleItems,
      borderWidth: settings.wheelBorderWidth,
      radius: 0.9,
      itemLabelRadius: this.settings.labelRadius ?? (wheelHasImages ? minImageRadius - .2 : 0.95),
      itemLabelRadiusMax: (settings.wheelCenterImageSize / 100) + .1,
      itemLabelFontSizeMax: Math.max((60 - (2.5 * this.visibleItems.length)), 10),
      isInteractive: false,
      itemBackgroundColors: settings.itemSettings.map(i => i.pieColor),
      itemLabelColors: settings.itemSettings.map(i => i.pieFontColor),
      onRest: (e) => this.onWheelRest(e as RestEvent),
      onSpin: () => this.onWheelSpin(),
      onCurrentIndexChange: (e) => this.onWheelCurrentIndexChange(e as CurrentIndexChangeEvent),
      itemLabelFont: this.fontOverride ?? styleSettings.globalFont,
      pixelRatio: this.getPixelRatio(),
      rotation: curRotation,
      pointerAngle: settings.pointerAngle
    };

    if (this.showPointer) {
      window.requestAnimationFrame(() => this.drawPointerLine(settings.pointerAngle));
    }

    this.wheel.init(props);
    this.isSpinning = false;
  }

  runIdleSpin(speed: number) {
    if (!this.wheel) {
      return;
    }

    if (speed === 0) {
      this.wheel.stop();
      this.isSpinning = false;
      this.wheelService.updateIsSpinning(false);
      return;
    }

    this.wheel.rotationResistance = 0;
    this.wheel.spin(speed * (this.settings.isCounterClockwise ? -1 : 1));
  }

  onWheelSpin() {
    if (this.settings.wheelCenterImagePath) {
      this.startCenterImageRotation();
    }
  }

  onWheelRest(e: RestEvent) {
    this.isSpinning = false;
    this.stopCenterImageRotation();
    this.wheelService.updateIsSpinning(false);

    if (this.winnerRevealed) {
      this.winnerRevealed.emit(this.currentWinner!);
    }
  }

  onWheelCurrentIndexChange(e: CurrentIndexChangeEvent) {
    this.populateWinnerItems(e.currentIndex);
    if (this.isSpinning) {
      const wheelTickKey = this.hasOverrideTick ? 'wheelTickOverride' : 'wheelTick';
      this.audioService.playAudio(wheelTickKey, true);
    }
  }

  populateWinnerItems(index: number) {
    this.currentWinnerIndex = index;
    this.currentWinner = this.wheel.items[index];
  }

  spinToItem(settings: WheelSettings) {
    if (!this.wheel || this.wheel.items.length == 0) {
      return;
    }

    const winningIndex = this.getRandomIndexWithWeight();
    const duration = getRandomNumber(settings.minDuration * 1000, settings.maxDuration * 1000);
    const revolutions = getRandomNumber(settings.minRevolutions, settings.maxRevolutions);

    this.isSpinning = true;
    this.wheel.spinToItem(winningIndex, duration, false, revolutions, this.settings.isCounterClockwise ? -1 : 1, spinFunctions[settings.easeOutFunction]);
    this.wheelService.updateIsSpinning(true);
  }

  changeWheelDisplayType(type: WheelDisplayTypes) {
    this.settings.wheelDisplayType = type;
  }

  shouldRedrawWheel(newSettings: WheelSettings, newStyleSettings: StyleSettings) {
    if (!newSettings || !newStyleSettings || !this.oldSettings || !this.oldStyleSettings) {
      return false;
    }

    return newStyleSettings.globalFont !== this.oldStyleSettings.globalFont ||
      newSettings.wheelOverlayImagePath !== this.oldSettings.wheelOverlayImagePath ||
      newSettings.wheelCenterImageSize !== this.oldSettings.wheelCenterImageSize ||
      newSettings.pointerAngle !== this.oldSettings.pointerAngle ||
      Math.floor((newSettings.minPies - 1) / this.items.length) !== Math.floor((this.oldSettings.minPies - 1) / this.items.length) ||
      newSettings.itemSettings.length !== this.oldItemSettings.length ||
      newSettings.itemSettings.some((item, index) => item.pieColor !== this.oldItemSettings[index].pieColor || item.pieFontColor !== this.oldItemSettings[index].pieFontColor);
  }

  rotateCenterImage() {
    if (!this.wheel || !this.isCenterImageRotating || this.wheel.items.length === 0) {
      return;
    }

    // If there is no center image, it just hasn't rendered yet. Request animation frame for when it does
    if (!this.centerImage) {
      requestAnimationFrame(() => this.rotateCenterImage());
      return;
    }

    const curRotation = this.wheel.rotation % 360;
    this.renderer.setStyle(this.centerImage.nativeElement, 'transform', `rotate(${curRotation}deg)`);
    requestAnimationFrame(() => this.rotateCenterImage());
  }

  startCenterImageRotation() {
    this.isCenterImageRotating = true;
    this.rotateCenterImage();
  }

  stopCenterImageRotation() {
    this.isCenterImageRotating = false;
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
  }

  private getPixelRatio(): number | undefined {
    return this.visibleItems.length < 100 ? 1 :
      this.visibleItems.length < 125 ? 0.9 :
        this.visibleItems.length < 150 ? 0.75 :
          this.visibleItems.length < 175 ? 0.60 :
            0.5
  }

  private drawPointerLine(angle: number) {
    if (!this.showPointer || !this.pointerCanvas)
      return;

    const canvas = this.pointerCanvas.nativeElement!;
    canvas.width = this.wheelContainer.nativeElement.clientWidth;
    canvas.height = this.wheelContainer.nativeElement.clientHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.translate(Math.floor(canvas.clientWidth / 2), Math.floor(canvas.clientHeight / 2));
    ctx.rotate(toRad(angle - 90));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.min(canvas.clientWidth, canvas.clientWidth), 0);
    ctx.strokeStyle = this.styleSettings.globalFontColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private getRandomIndexWithWeight() {
    const totalWeight = this.wheel.items.reduce((prev: number, curr) => prev + (curr.weight ?? 1), 0);
    const winningWeightedIndex = getRandomNumber(0, totalWeight - 1);
    let currWeight = 0;

    for (let i = 0; i < this.wheel.items.length; i++) {
      const itemWeight = this.wheel.items[i].weight ?? 1;
      currWeight += itemWeight;
      if (currWeight > winningWeightedIndex) {
        return i;
      }
    }

    return -1;
  }
}
