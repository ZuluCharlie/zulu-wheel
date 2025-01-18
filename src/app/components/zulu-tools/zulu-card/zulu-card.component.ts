import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainStyleDirective } from '../../../directives/main-style.directive';

@Component({
  selector: 'zulu-card',
  standalone: true,
  imports: [CommonModule, MainStyleDirective,
    MainStyleDirective],
  templateUrl: './zulu-card.component.html',
  styleUrl: './zulu-card.component.scss'
})
export class ZuluCardComponent {
  @Input() header: string;
  @Input() className: string;
  @Input() noPadding: boolean;
}
