import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectValue, WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputStyleDirective } from '../../../directives/input-style.directive';
import { StyleService } from '../../../services/style-service';

export interface SelectOption {
  label: string;
  value: SelectValue;
  disabled: boolean;
  tooltip?: string;
}

@Component({
  selector: 'zulu-select',
  standalone: true,
  imports: [CommonModule, FormsModule, InputStyleDirective],
  templateUrl: './zulu-select.component.html',
  styleUrl: './zulu-select.component.scss'
})
export class ZuluSelectComponent {
  @Input() model: SelectValue;
  @Input() label: string
  @Input() small: string
  @Input() options: SelectOption[]
  @Input() setting: string;
  @Input() disabled: boolean;
  @Output() inputChange = new EventEmitter<SelectValue>();

  wheelSettings: WheelSettings
  checkedImageUrl: string = 'none';
  
  constructor(private settings: SettingsService, private styleService: StyleService) {
    this.settings.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => this.wheelSettings = ws);
    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => {
      this.checkedImageUrl = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23${ ss.globalInputFontColor.replace('#', '') }' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`;
    });
  }

  onInputChange(e: SelectValue) {
    if (this.setting) {
      this.settings.saveSetting(this.setting, e);
    }
    
    this.inputChange.emit(e);
  }
}
