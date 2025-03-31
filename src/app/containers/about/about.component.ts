import { Component } from '@angular/core';
import { ZuluCardComponent } from "../../components/zulu-tools/zulu-card/zulu-card.component";
import { ZuluImageComponent } from "../../components/zulu-tools/zulu-image/zulu-image.component";
import { MainStyleDirective } from '../../directives/main-style.directive';


@Component({
  selector: 'app-about',
  standalone: true,
  imports: [ZuluCardComponent, ZuluImageComponent, MainStyleDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  appVersion: string;
  constructor() {
    if (window.electronAPI) {
      window.electronAPI.getAppVersionNumber().then(v => this.appVersion = v);
    }
  }
}
