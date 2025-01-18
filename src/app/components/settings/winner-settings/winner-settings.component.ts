import { Component } from '@angular/core';
import { SelectValue } from '../../../models/wheel-settings';
import { CommonModule } from '@angular/common';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { ZuluButtonComponent } from '../../zulu-tools/zulu-button/zulu-button.component';
import { ZuluInputComponent } from "../../zulu-tools/zulu-input/zulu-input.component";
import { ZuluCheckboxComponent } from "../../zulu-tools/zulu-checkbox/zulu-checkbox.component";
import { ZuluInputNumberComponent } from "../../zulu-tools/zulu-input-number/zulu-input-number.component";
import { ZuluRadioGroupComponent } from "../../zulu-tools/zulu-radio-group/zulu-radio-group.component";
import { WinnerRemoveType, WinnerSettings } from '../../../models/winner-settings';
import { WinnerService } from '../../../services/winner-service';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../services/modal-service';

@Component({
  selector: 'app-winner-settings',
  standalone: true,
  imports: [
    CommonModule,
    ZuluCardComponent,
    ZuluButtonComponent,
    ZuluInputComponent,
    ZuluCheckboxComponent,
    ZuluInputNumberComponent,
    ZuluRadioGroupComponent,
    MainStyleDirective
  ],
  templateUrl: './winner-settings.component.html',
  styleUrl: './winner-settings.component.scss'
})
export class WinnerSettingsComponent {
  WinnerRemoveType = WinnerRemoveType;

  settings: WinnerSettings;

  constructor(private settingsService: WinnerService, private modalService: ModalService) { 
    this.settingsService.winnerSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.settings = ws;
    });
  }

  onOpenFilePicker() {
    this.modalService.openFilePicker('Winner Images', 'assets/img/winner-images', (result: string) => 
      this.settingsService.saveSetting('winnerImagePath', result));
  }

  onSettingChanged(e: SelectValue, setting: string) {
    this.settingsService.saveSetting(setting, e);
  }
}
