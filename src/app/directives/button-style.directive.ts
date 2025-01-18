import { Directive, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { StyleService } from '../services/style-service';
import { StyleSettings } from '../models/style-settings';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[zuluButtonStyle]',
  standalone: true
})
export class ButtonStyleDirective implements OnInit, OnDestroy, OnChanges {
  @Input() isSecondary: boolean;
  @Input() backgroundOverride: string;
  @Input() textOverride: string;
  @Input() fontOverride: string;

  @HostListener('mouseenter')
  onHover() {
    if (!this.elementRef.nativeElement.disabled) {
      this.elementRef.nativeElement.style.borderColor = this.textOverride ?? this.styleSettings?.globalFontColor;
    }
  }

  @HostListener('mouseleave')
  onUnhover() {
    this.elementRef.nativeElement.style.borderColor = this.backgroundOverride ?? (this.isSecondary ? 'transparent' : this.styleSettings?.globalButtonColor);
  }

  styleSettings: StyleSettings;
  styleSettingsSubscription: Subscription;

  constructor(private styleService: StyleService, private elementRef: ElementRef) { }

  ngOnInit() {
    this.styleSettingsSubscription = this.styleService.styleSettings$.subscribe(ss => {
      this.styleSettings = ss;
      this.elementRef.nativeElement.style.color = this.textOverride ?? (this.isSecondary ? ss.globalFontColor : ss.globalButtonFontColor);
      this.elementRef.nativeElement.style.fontFamily = this.fontOverride ?? ss.globalFont;
      this.elementRef.nativeElement.style.backgroundColor = this.backgroundOverride ?? (this.isSecondary ? 'transparent' : ss.globalButtonColor);
      this.elementRef.nativeElement.style.accentColor = ss.globalButtonColor;
      this.elementRef.nativeElement.style.borderColor = this.backgroundOverride ?? (this.isSecondary ? 'transparent' : ss.globalButtonColor);
    });
  }

  ngOnDestroy(): void {
    this.styleSettingsSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fontOverride']) {
      this.elementRef.nativeElement.style.fontFamily = changes['fontOverride'].currentValue;
    }
    if (changes['textOverride']) {
      this.elementRef.nativeElement.style.color = changes['textOverride'].currentValue;
    }
    if (changes['backgroundOverride']) {
      this.elementRef.nativeElement.style.backgroundColor = changes['backgroundOverride'].currentValue;
      this.elementRef.nativeElement.style.borderColor = changes['backgroundOverride'].currentValue;
    }
  }
}
