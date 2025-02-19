import { Component, OnDestroy, OnInit } from '@angular/core';
import { GiveawaySettingsComponent } from "../../components/settings/giveaway-settings/giveaway-settings.component";
import { GiveawayDetailsComponent } from "../../components/displays/giveaway-details/giveaway-details.component";
import { GiveawayDetails } from '../../models/giveaway-details';
import { ZuluSelectComponent } from "../../components/zulu-tools/zulu-select/zulu-select.component";
import { SettingsService } from '../../services/settings-service';
import { Subscription, switchMap, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ZuluCardComponent } from "../../components/zulu-tools/zulu-card/zulu-card.component";
import { GiveawayListComponent } from "../../components/displays/giveaway-list/giveaway-list.component";
import { SelectValue, WheelSettings } from '../../models/wheel-settings';
import { ZuluButtonComponent } from "../../components/zulu-tools/zulu-button/zulu-button.component";
import { GiveawayService } from '../../services/giveaway-service';
import { MainStyleDirective } from '../../directives/main-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-giveaway-settings-view',
  standalone: true,
  imports: [CommonModule, GiveawaySettingsComponent, GiveawayDetailsComponent, ZuluSelectComponent, ZuluCardComponent, GiveawayListComponent, ZuluButtonComponent, MainStyleDirective, MatIconModule, MatButtonModule],
  templateUrl: './giveaway-settings-view.component.html',
  styleUrl: './giveaway-settings-view.component.scss'
})
export class GiveawaySettingsViewComponent {
  settings: WheelSettings;
  currentGiveaway: GiveawayDetails | null;
  currentGiveawayIndex: number | null = -1;
  allGiveaways: GiveawayDetails[];
  giveawayListItems: { label: string, value: number, disabled: boolean }[];

  constructor(private settingsService: SettingsService, private giveawayService: GiveawayService, private route: ActivatedRoute) { 
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.settings = ws;
    });

    this.giveawayService.allGiveaways$.pipe(takeUntilDestroyed()).subscribe(g => {
      this.allGiveaways = g;
      this.giveawayListItems = this.allGiveaways.map((g, i) => ({ label: `${i + 1} - ${g.name}`, value: i, disabled: false }));
      if (this.currentGiveawayIndex !== null) {
        this.currentGiveaway = this.allGiveaways[this.currentGiveawayIndex];
      }
    });
    
    const params = this.route.snapshot.paramMap;
    if (params.has('id')) {
      this.onSelectGiveaway(Number(params.get('id')));
    }
  }

  onSelectGiveaway(e: SelectValue) {
    const currentlength = this.allGiveaways.length;
    this.currentGiveawayIndex = e as number | null;
    if (this.currentGiveawayIndex === -1) {
      this.giveawayService.addGiveaway().then(() => {
        this.currentGiveawayIndex = currentlength;
        this.currentGiveaway = this.allGiveaways[this.currentGiveawayIndex];
      });
    }
    else {
      this.currentGiveaway = this.currentGiveawayIndex !== null ? this.allGiveaways[this.currentGiveawayIndex] : null;
    }
  }

  onReorderedGiveaways(e: GiveawayDetails[]) {
    this.saveGiveaways(e);
  }

  onDeletedGiveaways(e: number) {
    this.allGiveaways = this.allGiveaways.filter((g, i) => i !== e);
    this.saveGiveaways(this.allGiveaways);
  }

  onGiveawayUpdated(e: GiveawayDetails) {
    this.currentGiveaway = e;
    this.allGiveaways[this.currentGiveawayIndex!] = e;
    this.giveawayListItems[this.currentGiveawayIndex!].label = `${this.currentGiveawayIndex! + 1} - ${e.name}`;

    this.giveawayService.saveGiveaway(this.currentGiveaway, this.currentGiveawayIndex!);
  }

  onRemoveWinner(index: number) {
    if (!this.currentGiveaway) {
      return;
    }

    this.currentGiveaway.winners = this.currentGiveaway.winners.filter((w, i) => i !== index);
    this.giveawayService.saveGiveaway(this.currentGiveaway, this.currentGiveawayIndex!);
  }

  private saveGiveaways(giveaways: GiveawayDetails[]) {
    this.giveawayService.saveAllGiveaways(giveaways);
  }
}
