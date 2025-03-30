import { Component, OnInit } from '@angular/core';
import { getRandomNumber } from '../../util/helpers';
import { randomNames } from '../../util/random-names';
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { CountdownSettingsComponent } from "../../components/settings/countdown-settings/countdown-settings.component";
import { Item } from '../../spin-wheel-ts/item';

@Component({
  selector: 'app-countdown-settings-view',
  standalone: true,
  imports: [WheelMainComponent, CountdownSettingsComponent],
  templateUrl: './countdown-settings-view.component.html',
  styleUrl: './countdown-settings-view.component.scss'
})
export class CountdownSettingsViewComponent implements OnInit {
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
