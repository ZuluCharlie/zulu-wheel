import { Component, Input } from '@angular/core';
import { TwitchService } from '../../../services/twitch-service';
import { skip, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TwitchChatMessage } from '../../../types/twitch-message';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { CommonModule } from '@angular/common';
import { ZuluTwitchMessageComponent } from "../../zulu-tools/zulu-twitch-message/zulu-twitch-message.component";
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";

@Component({
  selector: 'app-twitch-messages',
  standalone: true,
  imports: [MainStyleDirective, CommonModule, ZuluTwitchMessageComponent, ZuluButtonComponent],
  templateUrl: './twitch-messages.component.html',
  styleUrl: './twitch-messages.component.scss',
})
export class TwitchMessagesComponent {
  @Input() chatterUserNames: string[];

  isConnected: boolean = false;
  allMessages: TwitchChatMessage[] = [];
  authToken: string;

  constructor(private twitchService: TwitchService) {
    this.twitchService.twitchSettings$.pipe(takeUntilDestroyed()).subscribe(ts => {
      if (ts.twitchAuthToken) {
        this.isConnected = true;
      }
    });

    this.twitchService.chatMessageReceived$.pipe(takeUntilDestroyed()).subscribe(msg => {
      if (!msg || !this.chatterUserNames) {
        return;
      }

      if (this.chatterUserNames.map(n => n.toLowerCase()).includes(msg.chatter_user_name.toLowerCase())) {
        this.allMessages = [...this.allMessages, msg];
      }
    });
    
    this.twitchService.twitchAuthToken$.pipe(takeUntilDestroyed()).subscribe(token => this.updateTwitchAuthToken(token));
  }

  connectToTwitch() {
    this.twitchService.connectToTwitch(false);
  }

  updateTwitchAuthToken(token: string) {
    if (token !== this.authToken) {
      this.twitchService.saveSetting('twitchAuthToken', token);
      this.authToken = token;
      this.twitchService.openListener(token);
    }
  }
}
