import { Component, inject, OnInit } from '@angular/core';
import { ZuluModalBaseComponent } from "../zulu-modal-base/zulu-modal-base.component";
import { WinnerDisplayComponent } from "../../components/displays/winner-display/winner-display.component";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WinnerResult } from '../../models/winner-result';
import { AudioSettingsItem } from '../../models/audio-settings';
import { TwitchService } from '../../services/twitch-service';

@Component({
  selector: 'app-winner-modal',
  standalone: true,
  imports: [ZuluModalBaseComponent, WinnerDisplayComponent],
  templateUrl: './winner-modal.component.html',
  styleUrl: './winner-modal.component.scss'
})
export class WinnerModalComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);

  winner: string;
  entryCount: number;
  runTimer: boolean;
  imgSrc: string | null;
  confirmed: boolean = false;
  winnerMessageOverride?: string | null = null;
  winnerSoundOverride?: AudioSettingsItem | null = null;

  lapsed: boolean = false;

  constructor(private modal: MatDialogRef<WinnerModalComponent>, private twitchService: TwitchService) {
  }

  ngOnInit(): void {
    this.runTimer = this.data.runTimer;
    this.winner = this.data.winner;
    this.entryCount = this.data.entryCount;
    this.imgSrc = this.data.imgSrc;
    this.winnerMessageOverride = this.data.winnerMessageOverride;
    this.winnerSoundOverride = this.data.winnerSoundOverride;
    if (!this.data.runTimer) {
      this.confirmed = true;
    }
  }

  onConfirmed() {
    this.confirmed = true;
  }

  onLapsed() {
    this.lapsed = true;
  }

  confirmWinner() {
    this.modal.close(this.lapsed ? WinnerResult.Lapsed : WinnerResult.Confirm);
  }
}
