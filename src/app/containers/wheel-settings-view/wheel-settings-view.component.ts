import { Component, OnInit } from '@angular/core';
import { WheelSettingsComponent } from "../../components/settings/wheel-settings/wheel-settings.component";
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { getRandomNumber } from '../../util/helpers';
import { randomNames } from '../../util/random-names';
import { Item } from '../../spin-wheel-ts/item';

@Component({
  selector: 'app-wheel-settings-view',
  standalone: true,
  imports: [WheelSettingsComponent, WheelMainComponent],
  templateUrl: './wheel-settings-view.component.html',
  styleUrl: './wheel-settings-view.component.scss'
})
export class WheelSettingsViewComponent implements OnInit {
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
