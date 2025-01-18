import { Component, OnInit } from '@angular/core';
import { WheelItemSettingsComponent } from "../../components/settings/wheel-item-settings/wheel-item-settings.component";
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { Item } from 'spin-wheel-ts';
import { getRandomNumber } from '../../util/helpers';
import { randomNames } from '../../util/random-names';

@Component({
  selector: 'app-item-settings-view',
  standalone: true,
  imports: [WheelItemSettingsComponent, WheelMainComponent],
  templateUrl: './item-settings-view.component.html',
  styleUrl: './item-settings-view.component.scss'
})
export class ItemSettingsViewComponent implements OnInit {
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
