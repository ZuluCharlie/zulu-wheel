import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';
import { Subscription } from 'rxjs';
import { InputStyleDirective } from '../../../directives/input-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'zulu-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, InputStyleDirective],
  templateUrl: './zulu-checkbox.component.html',
  styleUrl: './zulu-checkbox.component.scss'
})
export class ZuluCheckboxComponent {
  @Input() label: string;
  @Input() className: string;
  @Input() setting: string;
  @Input() checked: boolean;

  @Output() changed = new EventEmitter<boolean>();

  wheelSettings: WheelSettings
  
  constructor(private settings: SettingsService) {
    this.settings.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.wheelSettings = ws;
    })
  }

  onChange(e: boolean) {
    this.checked = e;
    if (this.setting) {
      this.settings.saveSetting(this.setting, e);
    }

    this.changed.emit(e);
  }
}
