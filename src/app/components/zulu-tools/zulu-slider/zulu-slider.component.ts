import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';
import { FormsModule } from '@angular/forms';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StyleSettings } from '../../../models/style-settings';
import { StyleService } from '../../../services/style-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { InputStyleDirective } from '../../../directives/input-style.directive';

@Component({
  selector: 'zulu-slider',
  standalone: true,
  imports: [CommonModule, FormsModule, InputStyleDirective],
  templateUrl: './zulu-slider.component.html',
  styleUrl: './zulu-slider.component.scss'
})
export class ZuluSliderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() label: string;
  @Input() className: string;
  @Input() setting: string;
  @Input() model: number;
  @Input() max: number;
  @Input() min: number;
  @Input() step: number;
  @Input() showSteps: boolean;
  @Output() inputChange = new EventEmitter<number>();
  @Output() inputChangeDebounce = new EventEmitter<number>();

  @ViewChild('slider') slider: ElementRef;
  @ViewChild('stepsCanvasContainer') stepsCanvasContainer: ElementRef;
  @ViewChild('stepsContainer') stepsContainer: ElementRef;
  @ViewChild('stepsCanvas') stepsCanvas: ElementRef<HTMLCanvasElement>;

  steps: number[];
  wheelSettings: WheelSettings;
  styleSettings: StyleSettings;

  debounceSubscription: Subscription;

  constructor(private settings: SettingsService, private styleService: StyleService) {
    this.settings.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => this.wheelSettings = ws);
    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => {
      this.styleSettings = ss;
    });
  }

  ngOnInit(): void {
    if (this.showSteps) {
      this.steps = [];
      let i = this.min;
      while (i <= this.max) {
        this.steps = [...this.steps, i];
        i += this.step;
      };

      window.requestAnimationFrame(() => this.drawSteps());
    }
  }

  ngAfterViewInit() {
    const onChange = fromEvent(this.slider.nativeElement, 'change');
    const result = onChange.pipe(debounceTime(50));
    this.debounceSubscription = result.subscribe((e: any) => {
      this.inputChangeDebounce.emit(+e.target.value);
      if (this.setting) {
        this.settings.saveSetting(this.setting, +e.target.value)
      }
    });
  }

  ngOnDestroy(): void {
    this.debounceSubscription?.unsubscribe();
  }

  drawSteps() {
    const fontSize = 10;
    this.stepsCanvas.nativeElement.height = fontSize * 2;
    this.stepsCanvas.nativeElement.width = this.stepsCanvasContainer.nativeElement.clientWidth;
    const ctx = this.stepsCanvas.nativeElement.getContext('2d')!;
    ctx.fillStyle = this.styleSettings.globalFontColor;
    ctx.strokeStyle = this.styleSettings.globalFontColor;
    ctx.textBaseline = 'top';

    ctx.textAlign = 'left';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, fontSize);
    ctx.stroke();
    ctx.fillText(this.steps[0].toString(), 0, fontSize);


    ctx.textAlign = 'right';
    ctx.moveTo(this.stepsCanvasContainer.nativeElement.clientWidth, 0);
    ctx.lineTo(this.stepsCanvasContainer.nativeElement.clientWidth, fontSize);
    ctx.stroke();
    ctx.fillText(this.steps[this.steps.length - 1].toString(), this.stepsCanvasContainer.nativeElement.clientWidth, fontSize);

    ctx.textAlign = 'center';
    for (let i = 1; i < this.steps.length - 1; i++) {
      const marker = (this.stepsCanvasContainer.nativeElement.clientWidth / (this.steps.length - 1)) * i;
      ctx.moveTo(marker, 0);
      ctx.lineTo(marker, fontSize);
      ctx.stroke();
      ctx.fillText(this.steps[i].toString(), marker, fontSize);
    }
  }
}

