import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StyleSettings } from '../../../models/style-settings';
import { StyleService } from '../../../services/style-service';
import { ButtonStyleDirective } from '../../../directives/button-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'zulu-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, ButtonStyleDirective],
  templateUrl: './zulu-button.component.html',
  styleUrl: './zulu-button.component.scss'
})
export class ZuluButtonComponent implements OnInit {
  @Input() disabled: boolean;
  @Input() className: string;
  @Input() icon: string;
  @Input() backgroundOverride: string;
  @Input() textOverride: string;
  @Input() tooltip?: string;
  @Input() isSecondary: boolean;
  @Input() fontOverride: string;

  @Output() buttonClick = new EventEmitter<void>();

  styleSettings: StyleSettings;
  fontColor: string;

  constructor(private settings: StyleService) { 
    this.settings.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => {
      this.styleSettings = ss;
    });
  }

  ngOnInit(): void {
    this.fontColor = this.getFontColor();
  }

  getFontColor(): string {
    if (this.textOverride) {
      return this.textOverride
    }

    if (!this.styleSettings) {
      return 'transparent';
    }

    return this.isSecondary ? this.styleSettings.globalFontColor : this.styleSettings.globalButtonFontColor;
  }
}
