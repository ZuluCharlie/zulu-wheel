import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwitchService } from '../../../services/twitch-service';
import { Observable, Subscription } from 'rxjs';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { ZuluInputComponent } from "../../zulu-tools/zulu-input/zulu-input.component";
import { ZuluCheckboxComponent } from "../../zulu-tools/zulu-checkbox/zulu-checkbox.component";
import { TwitchSettings } from '../../../models/twitch-settings';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { SettingsValue } from '../../../../main';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-twitch-settings',
  standalone: true,
  imports: [CommonModule, ZuluButtonComponent, ZuluCardComponent, ZuluInputComponent, ZuluCheckboxComponent, MainStyleDirective],
  templateUrl: './twitch-settings.component.html',
  styleUrl: './twitch-settings.component.scss'
})
export class TwitchSettingsComponent {
  twitchSettings: TwitchSettings;
  authToken: string;

  twitchUsername: Observable<string>;

  constructor(private twitchService: TwitchService) {
    this.twitchUsername = this.twitchService.twitchUsername$;
  
    this.twitchService.twitchSettings$.pipe(takeUntilDestroyed()).subscribe(ts => {
      this.twitchSettings = ts;
    });

    this.twitchService.twitchAuthToken$.pipe(takeUntilDestroyed()).subscribe(token => {
      if (token !== this.authToken) {
        this.twitchService.saveSetting('twitchAuthToken', token);
        this.authToken = token;
        this.twitchService.openListener(token);
      }
    })
  }

  onSettingChanged(setting: string, e: SettingsValue) {
    this.twitchService.saveSetting(setting, e);
  }

  connectToTwitch() {
    this.twitchService.connectToTwitch(false);
  }

  reAuth() {
    this.twitchService.connectToTwitch(true);
  }
}
