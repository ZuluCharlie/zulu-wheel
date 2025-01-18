import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { StyleService } from '../services/style-service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[zuluMainStyle]',
  standalone: true
})
export class MainStyleDirective implements OnInit, OnDestroy {
  @Input() background: boolean = true;
  @Input() border: boolean = false;
  styleSettingsSubscription: Subscription;

  constructor(private styleService: StyleService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.styleSettingsSubscription = this.styleService.styleSettings$.subscribe(ss => {
      this.elementRef.nativeElement.style.color = ss.globalFontColor;
      this.elementRef.nativeElement.style.fontFamily = ss.globalFont;
      this.elementRef.nativeElement.style.accentColor = ss.globalFontColor;

      if (this.background) {
        this.elementRef.nativeElement.style.backgroundColor = ss.globalBackgroundColor;
      }

      if (this.border) {
        this.elementRef.nativeElement.style.borderWidth = '2px';
        this.elementRef.nativeElement.style.borderColor = ss.globalFontColor;
      }
    });
  }

  ngOnDestroy(): void {
    this.styleSettingsSubscription.unsubscribe();
  }
}
