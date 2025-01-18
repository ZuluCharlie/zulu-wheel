//https://medium.com/@roylevy_28840/integrating-websocket-in-angular-to-create-a-realtime-application-in-5-minutes-4dd384e9484b

import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
@Injectable({
  providedIn: 'root'
})
export class WsService<T> {
  public messages: WebSocketSubject<T>;
  public ws: any;
  public isConnected = false;
  private subject: WebSocketSubject<any>;

  constructor() {}

  public open(url: string) {
    this.messages = <WebSocketSubject<T>>this.connect(url);
  }

  public connect(url: string): WebSocketSubject<any> {
    if (!this.subject) {
      this.subject = webSocket(url);
      this.isConnected = true;
    }

    return this.subject;
  }

  public disconnect() {
    if (!this.subject) {{
        return;
    }}

    this.subject.complete();
    this.messages.complete();
    this.isConnected = false;
  }
}
