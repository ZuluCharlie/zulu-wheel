import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WheelSettings } from './models/wheel-settings';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { FONT_PICKER_CONFIG, FontInterface, FontPickerConfigInterface, FontPickerModule, FontPickerService } from 'ngx-font-picker';
import { SettingsService } from './services/settings-service';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TwitchService } from './services/twitch-service';
import { MenuContainerComponent } from "./components/displays/menu-container/menu-container.component";
import { GiveawayService } from './services/giveaway-service';
import { StyleService } from './services/style-service';
import { StyleSettings } from './models/style-settings';
import { WinnerService } from './services/winner-service';
import { CountdownService } from './services/countdown-service';
import { StreamerBotService } from './services/streamerbot-service';
import { AudioService } from './services/audio-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { StaticWheelService } from './services/static-wheel-service';
import { Item } from './spin-wheel-ts/item';

const DEFAULT_FONT_PICKER_CONFIG: FontPickerConfigInterface = {
  apiKey: 'AIzaSyD-sn9nq8KSAAKgmqgDVZGck844ueiKkNE'
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FontPickerModule,
    MatToolbarModule,
    MatSidenavModule,
    MenuContainerComponent,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    FontPickerService,
    {
      provide: FONT_PICKER_CONFIG,
      useValue: DEFAULT_FONT_PICKER_CONFIG
    },
  ]
})
export class AppComponent implements OnInit {
  wheelSettings: WheelSettings;
  styleSettings: StyleSettings;
  wheelSettingsLoading: boolean = true;
  fontLoading: boolean = true;
  items: Partial<Item>[] = [];
  title: string;
  fontsLoaded: { [key: string]: boolean } = {};
  allfonts: FontInterface[];
  authToken: string;
  isMenuOpen: boolean = false;

  staticWheelFonts: string[] = [];
  backgroundImage: string;

  constructor(
    private sanitizer: DomSanitizer,
    private fontService: FontPickerService,
    private settingsService: SettingsService,
    private twitchService: TwitchService,
    private matIconRegistry: MatIconRegistry,
    private giveawayService: GiveawayService,
    private styleService: StyleService,
    private winnerService: WinnerService,
    private countdownService: CountdownService,
    private streamerBotService: StreamerBotService,
    private audioService: AudioService,
    private staticWheelService: StaticWheelService
  ) {
    this.matIconRegistry.addSvgIcon('add', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/add.svg'));
    this.matIconRegistry.addSvgIcon('audio', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/audio.svg'));
    this.matIconRegistry.addSvgIcon('close', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/close.svg'));
    this.matIconRegistry.addSvgIcon('delete_forever', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/delete_forever.svg'));
    this.matIconRegistry.addSvgIcon('download', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/download.svg'));
    this.matIconRegistry.addSvgIcon('external_link', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/external_link.svg'));
    this.matIconRegistry.addSvgIcon('maximize', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/maximize.svg'));
    this.matIconRegistry.addSvgIcon('minimize', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/minimize.svg'));
    this.matIconRegistry.addSvgIcon('mute', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/mute.svg'));
    this.matIconRegistry.addSvgIcon('play', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/play.svg'));
    this.matIconRegistry.addSvgIcon('stop', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/stop.svg'));
    this.matIconRegistry.addSvgIcon('streamerbot', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/streamerbot.svg'));
    this.matIconRegistry.addSvgIcon('twitch', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/twitch.svg'));
    this.matIconRegistry.addSvgIcon('upload', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/upload.svg'));
    this.loadInitialSettings();
  }

  ngOnInit() {
  }


  loadInitialSettings() {
    this.settingsService.loadSettings();
    this.styleService.loadSettings();
    this.winnerService.loadSettings();
    this.countdownService.loadSettings();
    this.twitchService.loadSettings();
    this.giveawayService.getAllGiveaways();
    this.streamerBotService.loadSettings();
    this.audioService.loadSettings();

    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.wheelSettings = ws;
      this.wheelSettingsLoading = false;
      this.backgroundImage = `url('${ ws.wheelBackgroundImagePath }')`
    });

    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => {
      this.styleSettings = ss;
      this.title = ss.wheelName;
      if (this.allfonts) {
        this.loadFont(this.styleSettings.globalFont);
      }
    });

    this.staticWheelService.allStaticWheels$.pipe(takeUntilDestroyed()).subscribe(sws => {
      const allItems = sws.map(w => w.items).flat();
      this.staticWheelFonts = sws.map(w => w.itemFont ?? 'Roboto');

      if (this.allfonts) {
        this.staticWheelFonts.forEach(font => this.loadFont(font));
      }
    });

    // Using getAllFonts here sucks, but getRequestedFont doesn't work because it expects strictly formed json,
    // which is not provided by Google for these fonts.
    // Keep an eye out for an update to this service that corrects this issue, or come up with your own later.
    this.fontService.getAllFonts('alpha').pipe(take(1)).subscribe((fonts) => {
      this.allfonts = fonts?.items as FontInterface[];
      if (this.styleSettings) {
        this.loadFont(this.styleSettings.globalFont);
      }

      if (this.staticWheelFonts) {
        this.staticWheelFonts.forEach(font => this.loadFont(font));
      }
    });

    this.twitchService.twitchSettings$.pipe(takeUntilDestroyed()).subscribe(ts => {
      if (ts.twitchAuthToken) {
        this.twitchService.validateToken(ts.twitchAuthToken).pipe(take(1)).subscribe({
          next: res => {
          }, error: () => this.twitchService.connectToTwitch(false)
        });
      }
    });

    this.twitchService.twitchAuthToken$.pipe(takeUntilDestroyed()).subscribe(token => this.authToken = token);
  }

  onMenuToggle(e: boolean) {
    this.isMenuOpen = e;
  }

  private loadFont(fontName: string) {
    const font = this.allfonts.find(f => f.family === fontName) as FontInterface;
    if (!this.fontsLoaded[fontName]) {
      this.fontService.loadFont(font);
      this.fontsLoaded[fontName] = true;
      this.fontLoading = false;
      this.settingsService.forceRefresh();
    }
  }
}
