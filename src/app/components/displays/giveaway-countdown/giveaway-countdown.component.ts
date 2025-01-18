import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { TimerDetails, ZuluTimerComponent } from "../../zulu-tools/zulu-timer/zulu-timer.component";
import { CommonModule } from '@angular/common';
import { Subscription, take } from 'rxjs';
import { CountdownSettings } from '../../../models/countdown-settings';
import { CountdownService } from '../../../services/countdown-service';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { ButtonStyleDirective } from '../../../directives/button-style.directive';
import { AudioService } from '../../../services/audio-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-giveaway-countdown',
  standalone: true,
  imports: [CommonModule, ZuluTimerComponent,
    MainStyleDirective, ButtonStyleDirective],
  templateUrl: './giveaway-countdown.component.html',
  styleUrl: './giveaway-countdown.component.scss'
})
export class GiveawayCountdownComponent implements OnInit, OnDestroy {
  @Output() goTime = new EventEmitter<void>();

  settings: CountdownSettings;
  timeRemaining: number;
  timerStarted: boolean = false;
  percentRemaining: number = 100;

  constructor(private settingsService: CountdownService, private audioService: AudioService) { }

  ngOnInit() {
    this.settingsService.countdownSettings$.pipe(take(1)).subscribe(cs => {
      this.settings = cs;
      if (!cs.countdown) {
        this.goTime?.emit();
        return;
      }
      
      this.audioService.playAudio('countdownRunning', false);
      this.timerStarted = true;
    });    
  }

  ngOnDestroy() {
    this.audioService.stopAudio('countdownRunning');
  }

  onTick(e: TimerDetails) {
    this.timeRemaining = Math.ceil(e.remaining / 1000);
    this.percentRemaining = (e.remaining) / (this.settings.countdownTimer * 1000) * 100;
  }

  onLapsed() {
    this.timeRemaining = 0;
    this.goTime?.emit();
  }
}
