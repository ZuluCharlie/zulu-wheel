import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputStyleDirective } from '../../../directives/input-style.directive';

@Component({
  selector: 'zulu-input',
  standalone: true,
  imports: [CommonModule, FormsModule, InputStyleDirective],
  templateUrl: './zulu-input.component.html',
  styleUrl: './zulu-input.component.scss'
})
export class ZuluInputComponent {
  @Input() label: string;
  @Input() className: string;
  @Input() placeholder: string = '';
  @Input() small: string;
  @Input() setting: string;
  @Input() model: string;
  @Input() type: string = 'text';

  @Output() inputChange = new EventEmitter<string>();

  wheelSettings: WheelSettings
  constructor(private settings: SettingsService) { }

  onInputChange(e: string) {
    if (this.setting) {
      this.settings.saveSetting(this.setting, e);
    }

    this.inputChange.emit(e);
  }
}
