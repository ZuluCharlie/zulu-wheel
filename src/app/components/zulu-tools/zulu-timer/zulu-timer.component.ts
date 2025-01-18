import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface TimerDetails {
  elapsed: number;
  remaining: number;
}

@Component({
  selector: 'zulu-timer',
  standalone: true,
  imports: [],
  templateUrl: './zulu-timer.component.html',
  styleUrl: './zulu-timer.component.scss'
})
export class ZuluTimerComponent implements OnInit {
  @Input() time: number;
  @Output() ticked = new EventEmitter<TimerDetails>();
  @Output() lapsed = new EventEmitter<void>();

  timerStart: number = 0;
  timerEnd: number = 0;

  ngOnInit(): void {
    this.timerStart = performance.now();
    this.timerEnd = this.timerStart + this.time;
    window.requestAnimationFrame(t => this.tick(t));
  }

  tick(now: number) {
    if (now > this.timerEnd) {
      this.lapsed?.emit();
      return;
    }

    this.ticked?.emit({ elapsed: now - this.timerStart, remaining: this.timerEnd - now });
    window.requestAnimationFrame(t => this.tick(t));
  }

}
