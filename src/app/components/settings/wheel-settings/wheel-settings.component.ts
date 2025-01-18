import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { easeOutBack, easeInBounce, easeOutCirc, easeOutCubic, easeOutElastic, easeOutQuad, easeOutQuart, easeOutQuint, easeOutSine, linear } from 'easing-utils';
import { WheelSettings } from '../../../models/wheel-settings';
import { spinFunctions } from '../../../models/wheel-spin-functions-lookup';
import { SettingsService } from '../../../services/settings-service';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { ZuluInputNumberComponent } from "../../zulu-tools/zulu-input-number/zulu-input-number.component";
import { ZuluSelectComponent } from "../../zulu-tools/zulu-select/zulu-select.component";
import { ZuluRadioGroupComponent } from "../../zulu-tools/zulu-radio-group/zulu-radio-group.component";
import { ZuluSliderComponent } from "../../zulu-tools/zulu-slider/zulu-slider.component";
import { Subscription } from 'rxjs';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-wheel-settings',
  standalone: true,
  imports: [
    CommonModule,
    ZuluCardComponent,
    ZuluInputNumberComponent,
    ZuluSelectComponent,
    ZuluRadioGroupComponent,
    ZuluSliderComponent,
    MainStyleDirective
],
  templateUrl: './wheel-settings.component.html',
  styleUrl: './wheel-settings.component.scss'
})
export class WheelSettingsComponent {

  constructor(private settingsService: SettingsService) {
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.settings = ws;
    });
  }

  settings: WheelSettings;

  easeOutBack = easeOutBack;
  easeOutBounce = easeInBounce;
  easeOutCirc = easeOutCirc;
  easeOutCubic = easeOutCubic;
  easeOutElastic = easeOutElastic;
  easeOutQuad = easeOutQuad;
  easeOutQuart = easeOutQuart;
  easeOutQuint = easeOutQuint;
  easeOutSine = easeOutSine;
  linear = linear;
  random = null;

  spinFunctions = spinFunctions;
  spinFunctionsKeys = Object.keys(spinFunctions);

  spinFunctionsListItems = Object.keys(spinFunctions).map(k => ({ label: k, value: k, disabled: false }));
  spinDirectionListItems = [{ label: 'Clockwise', value: false }, { label: 'Counter-Clockwise', value: true }]
}
