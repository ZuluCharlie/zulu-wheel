import { Component } from '@angular/core';
import { ZuluModalBaseComponent } from "../zulu-modal-base/zulu-modal-base.component";
import { GiveawayCountdownComponent } from "../../components/displays/giveaway-countdown/giveaway-countdown.component";
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-countdown-modal',
  standalone: true,
  imports: [ZuluModalBaseComponent, GiveawayCountdownComponent],
  templateUrl: './countdown-modal.component.html',
  styleUrl: './countdown-modal.component.scss'
})
export class CountdownModalComponent {
  constructor(private modal: MatDialogRef<CountdownModalComponent>) { }

  onGoTime() {
    this.modal.close(true);
  }
}
