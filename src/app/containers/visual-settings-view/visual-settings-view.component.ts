import { Component, OnInit } from '@angular/core';
import { getRandomNumber } from '../../util/helpers';
import { randomNames } from '../../util/random-names';
import { WheelMainComponent } from "../../components/wheels/wheel-main/wheel-main.component";
import { VisualSettingsComponent } from "../../components/settings/visual-settings/visual-settings.component";
import { Item } from '../../spin-wheel-ts/item';

@Component({
  selector: 'app-visual-settings-view',
  standalone: true,
  imports: [WheelMainComponent, VisualSettingsComponent],
  templateUrl: './visual-settings-view.component.html',
  styleUrl: './visual-settings-view.component.scss'
})
export class VisualSettingsViewComponent implements OnInit {
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
