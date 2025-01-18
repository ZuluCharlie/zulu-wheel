import { Component } from '@angular/core';
import { StreamerbotSettingsComponent } from "../../components/settings/streamerbot-settings/streamerbot-settings.component";
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { Item } from 'spin-wheel-ts';
import { getRandomNumber } from '../../util/helpers';
import { randomNames } from '../../util/random-names';

@Component({
  selector: 'app-streamerbot-settings-view',
  standalone: true,
  imports: [StreamerbotSettingsComponent],
  templateUrl: './streamerbot-settings-view.component.html',
  styleUrl: './streamerbot-settings-view.component.scss'
})
export class StreamerbotSettingsViewComponent {
}
