import { Component, Input } from '@angular/core';
import { TwitchChatMessage } from '../../../types/twitch-message';
import { MainStyleDirective } from '../../../directives/main-style.directive';

import { TwitchEmoptePipe } from '../../../pipes/twitch-emote-pipe';

@Component({
  selector: 'zulu-twitch-message',
  standalone: true,
  imports: [MainStyleDirective, TwitchEmoptePipe],
  templateUrl: './zulu-twitch-message.component.html',
  styleUrl: './zulu-twitch-message.component.scss'
})
export class ZuluTwitchMessageComponent {
  @Input() message: TwitchChatMessage;
}
