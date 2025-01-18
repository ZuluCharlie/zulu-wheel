import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { SettingsService } from '../../../services/settings-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputStyleDirective } from '../../../directives/input-style.directive';

@Component({
  selector: 'zulu-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule, InputStyleDirective],
  templateUrl: './zulu-textarea.component.html',
  styleUrl: './zulu-textarea.component.scss'
})
export class ZuluTextareaComponent {
  @Input() label: string;
  @Input() className: string;
  @Input() placeholder: string = '';
  @Input() small: string;
  @Input() setting: string;
  @Input() model: string;
  @Input() rows: number;
  @Input() disabled: boolean;

  @Output() inputChange = new EventEmitter<string>();

  constructor(private settings: SettingsService) { }

  onInputChange(e: string) {
    if (this.setting) {
      this.settings.saveSetting(this.setting, e);
    }

    this.inputChange.emit(e);
  }

}
