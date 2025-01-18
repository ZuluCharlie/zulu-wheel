import { Component, OnDestroy, OnInit } from '@angular/core';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { ZuluAudioComponent } from "../../zulu-tools/zulu-audio/zulu-audio.component";
import { Subscription } from 'rxjs';
import { AudioSettings, AudioSettingsItem } from '../../../models/audio-settings';
import { AudioService } from '../../../services/audio-service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-audio-settings',
  standalone: true,
  imports: [CommonModule, MainStyleDirective, ZuluCardComponent, ZuluAudioComponent],
  templateUrl: './audio-settings.component.html',
  styleUrl: './audio-settings.component.scss'
})
export class AudioSettingsComponent {
  settings: AudioSettings;

  constructor(private audioService: AudioService) { 
    this.audioService.audioSettings$.pipe(takeUntilDestroyed()).subscribe(as => {
      this.settings = as;
    });
  }

  onFileChanged(e: string | null, item: AudioSettingsItem, setting: string) {
    this.audioService.saveSetting(setting, {...item, soundPath: e});
  }

  onVolumeChanged(e: number, item: AudioSettingsItem, setting: string) {
    this.audioService.saveSetting(setting, {...item, volume: e});
  }

  onMuteChanged(e: boolean, item: AudioSettingsItem, setting: string) {
    this.audioService.saveSetting(setting, {...item, muted: e});
  }
}
