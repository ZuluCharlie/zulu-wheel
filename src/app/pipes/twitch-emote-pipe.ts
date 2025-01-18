import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'twitchEmote',
  standalone: true
})
export class TwitchEmoptePipe implements PipeTransform {
  transform(emoteId: string): string {
    return `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`
  }
}