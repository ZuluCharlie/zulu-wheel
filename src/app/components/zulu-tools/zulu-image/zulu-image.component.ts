import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'zulu-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zulu-image.component.html',
  styleUrl: './zulu-image.component.scss'
})
export class ZuluImageComponent {
  @Input() imagePath: string;
}
