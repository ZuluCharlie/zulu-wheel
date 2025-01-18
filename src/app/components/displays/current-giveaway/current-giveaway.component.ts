import { Component } from '@angular/core';
import { GiveawayDetails } from '../../../models/giveaway-details';
import { SelectValue, WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { GiveawayDetailsComponent } from "../giveaway-details/giveaway-details.component";
import { ZuluSelectComponent } from "../../zulu-tools/zulu-select/zulu-select.component";
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ZuluInputComponent } from "../../zulu-tools/zulu-input/zulu-input.component";
import { FormsModule } from '@angular/forms';
import { GiveawayService } from '../../../services/giveaway-service';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'current-giveaway',
  standalone: true,
  imports: [CommonModule, ZuluCardComponent, GiveawayDetailsComponent, ZuluSelectComponent, ZuluButtonComponent, MatIconModule, MatButtonModule, ZuluInputComponent, FormsModule,
    MainStyleDirective],
  templateUrl: './current-giveaway.component.html',
  styleUrl: './current-giveaway.component.scss'
})
export class CurrentGiveawayComponent {
  settings: WheelSettings;
  currentGiveaway: GiveawayDetails | null;
  currentGiveawayIndex: number | null;
  giveawaysCount: number;
  winnerToAdd: string;
  giveawayListItems: { label: string, value: number, disabled: boolean }[];

  get canBack() {
    return this.currentGiveawayIndex ?? 0 > 0;
  }

  get canForward() {
    return (this.currentGiveawayIndex ?? 0) < this.giveawaysCount - 1;
  }

  constructor(private settingsService: SettingsService, private giveawayService: GiveawayService, private router: Router) {
    this.giveawayService.currentGiveaway$.pipe(takeUntilDestroyed()).subscribe(g => this.currentGiveaway = g);
    this.giveawayService.allGiveawaysCount$.pipe(takeUntilDestroyed()).subscribe(g => this.giveawaysCount = g);
    this.giveawayService.currentGiveawayIndex$.pipe(takeUntilDestroyed()).subscribe(i => this.currentGiveawayIndex = i);
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.settings = ws;
    });

    this.giveawayService.allGiveaways$.pipe(takeUntilDestroyed()).subscribe(allGiveaways => {
      this.giveawayListItems = allGiveaways.map((g, i) => ({ label: `${i + 1} - ${g.name}`, value: i, disabled: false }));
    });
  }

  onForward() {
    this.giveawayService.setCurrentGiveaway(++this.currentGiveawayIndex!);
  }

  onBack() {
    this.giveawayService.setCurrentGiveaway(--this.currentGiveawayIndex!);
  }

  onSelect(e: SelectValue) {
    this.giveawayService.setCurrentGiveaway(e as number);
  }

  onRemoveWinner(index: number) {
    if (!this.currentGiveaway) {
      return;
    }

    this.currentGiveaway.winners = this.currentGiveaway.winners.filter((w, i) => i !== index);
    this.giveawayService.saveGiveaway(this.currentGiveaway, this.currentGiveawayIndex!);
  }

  onAddWinner() {
    if (!this.currentGiveaway || !this.winnerToAdd) {
      return;
    }

    this.currentGiveaway.winners = [...this.currentGiveaway.winners, this.winnerToAdd];
    this.giveawayService.saveGiveaway(this.currentGiveaway, this.currentGiveawayIndex!);
    this.winnerToAdd = '';
  }

  onEditGiveaway() {
    this.router.navigate(['giveaway-settings', this.currentGiveawayIndex]);
  }
}
