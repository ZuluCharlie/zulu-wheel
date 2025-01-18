import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { WheelSettings } from '../../../models/wheel-settings';
import { Subscription } from 'rxjs';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { AnimatedUnderlineDirective } from '../../../directives/animated-underline.directive';

@Component({
  selector: 'menu-container',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MainStyleDirective,
    AnimatedUnderlineDirective],
  templateUrl: './menu-container.component.html',
  styleUrl: './menu-container.component.scss'
})
export class MenuContainerComponent {
  @Input() isMenuOpen: boolean
  @Output() toggled = new EventEmitter<boolean>();
  
  settingsServiceSubscription: Subscription;

  wheelSettings: WheelSettings
  constructor(private router: Router) {}

  onReload() {
    if (window.electronAPI) {
      window.electronAPI.reload(this.router.url);
    }
  }
}
