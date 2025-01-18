import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { StyleService } from '../services/style-service';
import { Subscription } from 'rxjs';
import { StyleSettings } from '../models/style-settings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
    selector: '[zuluInputStyle]',
    standalone: true
})
export class InputStyleDirective {
    styleSettings: StyleSettings;

    @HostListener('focus')
    onFocus() {
      if (!this.elementRef.nativeElement.disabled) {
        this.elementRef.nativeElement.style.borderColor = this.styleSettings?.globalFontColor;
        this.elementRef.nativeElement.style.boxShadow = `0 0 0 0.25rem ${this.styleSettings?.globalFontColor.slice(0, 7)}40`;
      }
    }

    @HostListener('blur')
    onBlur() {
      if (!this.elementRef.nativeElement.disabled) {
        this.elementRef.nativeElement.style.borderColor = this.styleSettings?.globalInputFontColor;
        this.elementRef.nativeElement.style.boxShadow = 'none';
      }
    }

    constructor(private styleService: StyleService, private elementRef: ElementRef) { 
        this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => {
            this.styleSettings = ss;
            this.elementRef.nativeElement.style.color = ss.globalInputFontColor;
            this.elementRef.nativeElement.style.fontFamily = ss.globalFont;
            this.elementRef.nativeElement.style.backgroundColor = ss.globalInputBackgroundColor;
            this.elementRef.nativeElement.style.borderColor = ss.globalInputFontColor;
            this.elementRef.nativeElement.style.setProperty('--placeHolder-color', ss.globalInputFontColor);
            this.elementRef.nativeElement.style.setProperty('--input-background-color', ss.globalInputBackgroundColor);
        });
    }
}
