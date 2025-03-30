import { Component } from '@angular/core';
import { AudioSettingsComponent } from "../../components/settings/audio-settings/audio-settings.component";
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { getRandomNumber } from '../../util/helpers';
import { randomNames } from '../../util/random-names';
import { Item } from '../../spin-wheel-ts/item';

@Component({
  selector: 'app-audio-settings-view',
  standalone: true,
  imports: [AudioSettingsComponent, WheelMainComponent],
  templateUrl: './audio-settings-view.component.html',
  styleUrl: './audio-settings-view.component.scss'
})
export class AudioSettingsViewComponent {
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
