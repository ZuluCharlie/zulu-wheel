import { Directive, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { StyleSettings } from '../models/style-settings';
import { StyleService } from '../services/style-service';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[zuluAnimatedUnderline]',
  standalone: true
})
export class AnimatedUnderlineDirective {
  @HostListener('mouseover')
  onHover() {
    this.elementRef.nativeElement.style.backgroundPosition = '100% 100%';
    this.elementRef.nativeElement.style.backgroundSize = '100% 2px';
  }

  @HostListener('mouseleave')
  onUnhover() {
    this.elementRef.nativeElement.style.backgroundPosition = '0 100%';
    this.elementRef.nativeElement.style.backgroundSize = '0 2px';
  }

  styleSettings: StyleSettings;

  constructor(private styleService: StyleService, private elementRef: ElementRef) { 
    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => {
      this.elementRef.nativeElement.style.display = 'inline-block';
      this.elementRef.nativeElement.style.backgroundImage = `linear-gradient(${ss.globalFontColor} 0 0)`;
      this.elementRef.nativeElement.style.backgroundPosition = '0 100%';
      this.elementRef.nativeElement.style.backgroundSize = '0 2px';
      this.elementRef.nativeElement.style.backgroundRepeat = 'no-repeat';
      this.elementRef.nativeElement.style.transition = 'background-size 0.3s, background-position 0s 0.3s';
    });
  }

}
