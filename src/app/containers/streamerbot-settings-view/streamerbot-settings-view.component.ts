import { Component } from '@angular/core';
import { StreamerbotSettingsComponent } from "../../components/settings/streamerbot-settings/streamerbot-settings.component";

@Component({
  selector: 'app-streamerbot-settings-view',
  standalone: true,
  imports: [StreamerbotSettingsComponent],
  templateUrl: './streamerbot-settings-view.component.html',
  styleUrl: './streamerbot-settings-view.component.scss'
})
export class StreamerbotSettingsViewComponent {
}
