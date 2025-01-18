import { Component, OnDestroy, OnInit } from '@angular/core';
import { StreamerBotSettings } from '../../../models/streamerbot-settings';
import { StreamerBotAction, StreamerBotService } from '../../../services/streamerbot-service';
import { Subscription } from 'rxjs';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { CommonModule } from '@angular/common';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { SelectValue } from '../../../models/wheel-settings';
import { ZuluInputComponent } from "../../zulu-tools/zulu-input/zulu-input.component";
import { ZuluInputNumberComponent } from "../../zulu-tools/zulu-input-number/zulu-input-number.component";
import { ZuluSelectComponent } from "../../zulu-tools/zulu-select/zulu-select.component";
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { ZuluTextareaComponent } from "../../zulu-tools/zulu-textarea/zulu-textarea.component";
import { ZuluCheckboxComponent } from "../../zulu-tools/zulu-checkbox/zulu-checkbox.component";
import { Clipboard } from '@angular/cdk/clipboard';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-streamerbot-settings',
  standalone: true,
  imports: [CommonModule, MainStyleDirective, ZuluCardComponent, ZuluInputComponent, ZuluInputNumberComponent, ZuluSelectComponent, ZuluButtonComponent, ZuluTextareaComponent, ZuluCheckboxComponent],
  templateUrl: './streamerbot-settings.component.html',
  styleUrl: './streamerbot-settings.component.scss'
})
export class StreamerbotSettingsComponent {
  settings: StreamerBotSettings;
  allActions: StreamerBotAction[];
  allActionsSelectList: { label: string, value: string | null, disabled: boolean }[];

  streamerBotConnecting: boolean = false;
  streamerBotConnected: boolean = false;
  streamerBotConnectedError: boolean = false;
  showImportCode: boolean = false;
  importCodeCopied: boolean = false;

  importCode: string = 'U0JBRR+LCAAAAAAABADtWktvIzcSvgfIf2gYyC00+H7k5kywyQLebOBJNsAGORTJot1YqVvbkjzxDua/b1EP25KsGa83wbTjuQjdrFKT/Kq+YlV1v/38s6Y5meICTr5q3tYbuu1ginR78s/lZPnzFeLk5MuNBJaLq37Yyl5dwTBp8fzs9a3CNQ7ztu+qhjjlp/xWkHGehna22AjPUuqnM+hu2u6ygVSH503ph+bBOfuLZXeWNv/tlpPJVjZtu3a6nP7jdtYqrLJ3K42TDDsb20xEI7+sR5qtaCVuc12aDEY77RUrqCTTWXoWU+YsaiFC0NZakbaLW/3t30tc4u7CVuPYQZxgfeZiWOKO5Lc0WWb8y9BPv2vni364IaUCk/kxrR+wy4TUQ1oHxmpYc5Zz830dv694OfTL2YNmXWMzeQM3cwL6oUkG6HI/vTXBgTz1XVoOA3aLh6SLob28JBPdx30P+3v4GyGkDqWwmINlOlrPQKXEspfOCB254OH+ytdT3MwqCkKpfclRK9xhPN86xa/3pe/ubn7dAerQiR7aDF4TGt9vjEMGqZc/9ge4r3SXczwbLudH1riGJWMxPpTEdIqFkX8KFoOUTGGxPIAIKMzBg99ge3lVbUJUPAYZV3pftHWVPY9+BJ5tl/G3+tQdJL98H1Dzfjkk/HGzmv0HXsPQ1gkrBAfbWyMjvPHKoGWQE2daaMs8KM14jpBkVBCjfQoy5kBwS6GDxz0OFf54//q2TrV2yl2iTSYwm2O+J9+K72B+IKh5acBlzVRQjmkbJfOSIxPKBRut49LakQe1v3fNz23X4dBcELegLmJ84e0pkWLSX57TjiakJ/c9Z4rzOVyusNjbfPMdzGbY0QUtvllcYfNmrdDOmy/+s8Vg/acvjjCHo7BeV6+g4MI0ZMMiV4pJbXwqQYAJ5WkxRR7lztNjykdkjwkhobEsCQsUYTKxBy1FYYHWUfQBbsOzYc+rvivtMH2h9Enb3d/y5wg3LM8yZ6GZKNwzXZRhxInMsgNjjdRR+E/cIJwgeGsEB8qPFSUnHBQLCiiaZK1Dpswth/hsuHG+QuBFEmO99Q+xAiRKnaRgKVRWeKBI6HikK60LiETZFnxiBa0PsveagPGBjg3NFZUzQEVMscV7hUknVONnxQVe0P5fFh3We/4QDwKQJaMOTNf0SScQzMeYKfTZ7DiZnkqRTzxoTkqIiaMXLJtE+ZJydE5Eqyh8QABrJRUffuQ8eD1r6Xw48PRxEOF9Dr8tnavi23cP+3FBSCjAMdQRmXaFMy+kr20XMhgWreHQjze+SkXjKJst1WAf6rPsg3oPEiNF0qg8c7ICUYJn4CAy5zFGnUoRIMfTaPl41E7SAdeGAh8i4VSbdXRFmUEClXOK3sQycmpf4LS/xufYKn0Mt4Fy8aKKZEXWfDwmYGA4ZyBN9gWz4e6wghk5t9cWq3fV3E/vpkqZeMr1XCqSqhaAwgJ3llE9r70MKeh0ePS/jG6qkCUBLyw5+tEYiODKI8ugY/TJJqVefDfVxOB0NpKJEsl7vJcsBOno6FQhuihc4DDy0LfpAm0K3z9h9CtGoshasWBKpsxTZgaKJyZtcDJDoQrs2UW/jdEObbZSfVR2gwqtsgKZwUQJn7SFkftyojd4YVUO2h2+XXuB2Q0vlL9E42oWSIcncsuipuqliBQtWjpMwYyc4hcIufm2vUYgwjbf1Ffh46P5H1jJV9YQDKuXIVsY6tixtyE5UCFkvGWCjjmKGB4oqnuKGBlCshiyz3qsNf17c4JH4vXD0F+3GXPz9c0+bFvR1zfHwKPzMOVSNLPgeW0MEl8kRZjEnchcYLbJjQe8/yGheiR4f53SRfPTxfk+dCvBT8PkGHAWCw+Uc1IFJWqgEZxFx5EhIiVbLvgs43iAk787cN/cfRi0D9090VG3w5S4yY4ZV99rJ0PHmS6JfoSK3hVt5Ije0qjfHb1zhKFr/tYP5HvDZB/AlbQK3+N/RgTlefAsCEUJgTJ05TEzSwg4aUBp+cSE4I9AUH+0hMBGkV2KkipGR56mMlLFSOeEzaHECFJZL0eeELyakD/8aVuZAaKTVlIh72qr2VEoCJEiQ8iKooEzOofDkn7sCX+12P/Ry/TIsXirWfRIJwxQFhui10wkdNpwL1N5YkrzDLP99cVWf83PnUfQ36dT8ufdwTcY5336Fy5e43C9l7XeCV9NWrLbrnDRTrf6dWTzTerdJ7Ji3Z8hZ5r1wwJzpfSq9jiVp5vi4vAL15WUDIoLOLUnn3/27r+EyvtgwysAAA==';

  constructor(private settingsService: StreamerBotService, private clipboard: Clipboard) { 
    this.settingsService.streamerBotSettings$.pipe(takeUntilDestroyed()).subscribe(ss => {
      this.settings = ss;
    });

    this.settingsService.allActions$.pipe(takeUntilDestroyed()).subscribe(actions => {
      this.allActions = actions;
      this.allActionsSelectList = [
        { label: '- None -', value: null, disabled: false },
        ...this.allActions.filter(a => a.enabled).map(a => ({ label: a.name, value: a.id, disabled: false }))
      ];
    });

    this.settingsService.connected$.pipe(takeUntilDestroyed()).subscribe(c => {
      this.streamerBotConnected = c;
      if (c) {
        this.settingsService.getAllActions();
      }
    });
  }

  onSettingChanged(e: SelectValue, setting: string) {
    this.settingsService.saveSetting(setting, e);
  }

  connectToStreamerBot() {
    this.streamerBotConnecting = true;
    this.streamerBotConnected = false;
    this.streamerBotConnectedError = false;
    this.settingsService.connect(
      () => {
        this.streamerBotConnecting = false;
        this.streamerBotConnected = true;
        this.streamerBotConnectedError = false;
      },
      () => {
        this.streamerBotConnecting = false;
        this.streamerBotConnected = false;
        this.streamerBotConnectedError = true;
      }
    );
  }

  toggleImportCode() {
    this.showImportCode = !this.showImportCode;
  }

  copyImportCode() {
    if (this.clipboard.copy(this.importCode)) {
      this.importCodeCopied = true;
    }
  }
}
