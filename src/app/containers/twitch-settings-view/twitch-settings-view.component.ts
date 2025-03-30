import { Component, OnInit } from '@angular/core';
import { TwitchSettingsComponent } from "../../components/settings/twitch-settings/twitch-settings.component";
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { randomNames } from '../../util/random-names';
import { getRandomNumber } from '../../util/helpers';
import { Item } from '../../spin-wheel-ts/item';

@Component({
  selector: 'app-twitch-settings-view',
  standalone: true,
  imports: [TwitchSettingsComponent, WheelMainComponent],
  templateUrl: './twitch-settings-view.component.html',
  styleUrl: './twitch-settings-view.component.scss'
})
export class TwitchSettingsViewComponent implements OnInit {
  items: Partial<Item>[] = [];

  ngOnInit() {
    for (let i = 0; i < 8; i++) {
      this.addRandom();
    }
  }

  addToWheel(item: Partial<Item>) {
    this.items = [...this.items, item];
  }

  addRandom() {
    this.addToWheel({ label: randomNames[getRandomNumber(0, 999)] });
  }

}
