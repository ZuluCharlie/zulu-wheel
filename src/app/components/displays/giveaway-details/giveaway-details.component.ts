import { Component, Input } from '@angular/core';
import { GiveawayDetails } from '../../../models/giveaway-details';

import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { ZuluImageComponent } from "../../zulu-tools/zulu-image/zulu-image.component";
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'giveaway-details',
  standalone: true,
  imports: [ZuluImageComponent, RouterModule, ZuluButtonComponent],
  templateUrl: './giveaway-details.component.html',
  styleUrl: './giveaway-details.component.scss'
})
export class GiveawayDetailsComponent {
  @Input() giveaway: GiveawayDetails;

  constructor(private router: Router) { }

  onLearnMore() {
    window.open(this.giveaway.learnMoreUrl!, '_blank');
  }
}
