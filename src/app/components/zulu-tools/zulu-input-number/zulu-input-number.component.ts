import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsService } from '../../../services/settings-service';
import { FormsModule } from '@angular/forms';
import { InputStyleDirective } from '../../../directives/input-style.directive';

@Component({
  selector: 'zulu-input-number',
  standalone: true,
  imports: [CommonModule, FormsModule, InputStyleDirective],
  templateUrl: './zulu-input-number.component.html',
  styleUrl: './zulu-input-number.component.scss'
})
export class ZuluInputNumberComponent {
  @Input() label: string;
  @Input() className: string;
  @Input() placeholder: string = '';
  @Input() small: string;
  @Input() setting: string;
  @Input() model: number;
  @Input() max: number;
  @Input() min: number;
  @Input() step: number;

  @Output() inputChange = new EventEmitter<number>()

  constructor(private settings: SettingsService) { }

  onInputChange(e: number) {
    if (this.setting) {
      this.settings.saveSetting(this.setting, e);
    }

    this.inputChange.emit(e);
  }
}
