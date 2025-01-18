import { Component, OnDestroy, OnInit } from '@angular/core';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { ZuluCheckboxComponent } from "../../zulu-tools/zulu-checkbox/zulu-checkbox.component";
import { CommonModule } from '@angular/common';
import { ZuluInputNumberComponent } from "../../zulu-tools/zulu-input-number/zulu-input-number.component";
import { ZuluInputComponent } from "../../zulu-tools/zulu-input/zulu-input.component";
import { Subscription } from 'rxjs';
import { CountdownSettings } from '../../../models/countdown-settings';
import { CountdownService } from '../../../services/countdown-service';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-countdown-settings',
  standalone: true,
  imports: [CommonModule, ZuluCardComponent, ZuluCheckboxComponent, ZuluInputNumberComponent, ZuluInputComponent, MainStyleDirective],
  templateUrl: './countdown-settings.component.html',
  styleUrl: './countdown-settings.component.scss'
})
export class CountdownSettingsComponent {
  settings: CountdownSettings;
  settingsServiceSubscription: Subscription;

  constructor(private settingsService: CountdownService) { 
    this.settingsService.countdownSettings$.pipe(takeUntilDestroyed()).subscribe(cs => {
      this.settings = cs;
    });
  }

  onCountdownShowTimerChanged(e: boolean) {
    this.settingsService.saveSetting('countdownShowTimer', e);
  }

  onCountdownShowTimerBarChanged(e: boolean) {
    this.settingsService.saveSetting('countdownShowTimerBar', e);
  }

  onCountdownChanged(e: boolean) {
    this.settingsService.saveSetting('countdown', e);
  }

  onCountdownTimerChanged(e: number) {
    this.settingsService.saveSetting('countdownTimer', e);
  }

  onCountdownMessageChanged(e: string) {
    this.settingsService.saveSetting('countdownMessage', e);
  }
}
