import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';
import { CommonModule } from '@angular/common';
import Pickr from '@simonwep/pickr';
import { ColorPickerModule } from 'ngx-color-picker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'zulu-color-picker',
  standalone: true,
  imports: [CommonModule, ColorPickerModule],
  templateUrl: './zulu-color-picker.component.html',
  styleUrl: './zulu-color-picker.component.scss'
})
export class ZuluColorPickerComponent {
  @Input() model: string;
  @Input() label: string;
  @Input() setting: string;
  @Input() position: Pickr.Position;

  @Output() changed = new EventEmitter<string>;
  @Output() saved = new EventEmitter<string>;

  @ViewChild('colorPickerContainer') colorPickerContainer: ElementRef
  @ViewChild('colorPicker') colorPicker: ElementRef

  pickr: Pickr;

  wheelSettings: WheelSettings
  
  constructor(private settings: SettingsService) {
    this.settings.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.wheelSettings = ws;
    })
  }

  onColorChange(e: string) {
    if (this.changed) {
      this.changed.emit(e);
    }
  }
}
