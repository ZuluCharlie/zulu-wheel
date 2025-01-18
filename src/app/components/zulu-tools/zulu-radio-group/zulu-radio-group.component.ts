import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../services/settings-service';
import { SelectValue } from '../../../models/wheel-settings';
import { StyleService } from '../../../services/style-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputStyleDirective } from '../../../directives/input-style.directive';

@Component({
  selector: 'zulu-radio-group',
  standalone: true,
  imports: [CommonModule, FormsModule, InputStyleDirective],
  templateUrl: './zulu-radio-group.component.html',
  styleUrl: './zulu-radio-group.component.scss'
})
export class ZuluRadioGroupComponent {
  @Input() model: SelectValue;
  @Input() label: string
  @Input() options: { label: string, value: SelectValue }[]
  @Input() setting: string;
  @Input() formName: string;
  @Input() inline: boolean;

  @Output() inputChange = new EventEmitter<SelectValue>();

  checkedImageUrl: string = 'none';

  constructor(private settings: SettingsService, private styleService: StyleService) {
    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => {
      this.checkedImageUrl = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='2' fill='%23${ ss.globalInputFontColor.replace('#', '') }'/%3e%3c/svg%3e")`;
    });
  }

  onChange(e: SelectValue) {
    this.model = e;
    if (this.setting) {
      this.settings.saveSetting(this.setting, e);
    }

    this.inputChange.emit(e);
  }
}
