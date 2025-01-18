import { Component, OnInit } from '@angular/core';
import { WinnerSettingsComponent } from "../../components/settings/winner-settings/winner-settings.component";
import { randomNames } from '../../util/random-names';
import { getRandomNumber } from '../../util/helpers';
import { WinnerDisplayComponent } from '../../components/displays/winner-display/winner-display.component';
import { ZuluCardComponent } from "../../components/zulu-tools/zulu-card/zulu-card.component";

@Component({
  selector: 'app-winner-settings-view',
  standalone: true,
  imports: [WinnerSettingsComponent, WinnerDisplayComponent, ZuluCardComponent],
  templateUrl: './winner-settings-view.component.html',
  styleUrl: './winner-settings-view.component.scss'
})
export class WinnerSettingsViewComponent implements OnInit {
  winner: string;
  entryCount: number;

  ngOnInit() {
    this.winner = randomNames[getRandomNumber(0, 999)];
    this.entryCount = getRandomNumber(1, 1000);
  }
}
