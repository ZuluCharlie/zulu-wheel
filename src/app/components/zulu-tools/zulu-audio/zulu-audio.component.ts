import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ZuluButtonComponent } from "../zulu-button/zulu-button.component";
import { CommonModule } from '@angular/common';
import { AudioSettingsItem } from '../../../models/audio-settings';
import { MatIconModule } from '@angular/material/icon';
import { ZuluSliderComponent } from "../zulu-slider/zulu-slider.component";
import { ModalService } from '../../../services/modal-service';

@Component({
  selector: 'zulu-audio',
  standalone: true,
  imports: [CommonModule, ZuluButtonComponent, MatIconModule, ZuluSliderComponent],
  templateUrl: './zulu-audio.component.html',
  styleUrl: './zulu-audio.component.scss'
})
export class ZuluAudioComponent implements OnInit, OnDestroy {
  @Input() model: AudioSettingsItem;
  @Input() setting: string;
  @Input() label?: string;
  @Output() fileChanged = new EventEmitter<string | null>();
  @Output() volumeChanged = new EventEmitter<number>();
  @Output() muteChanged = new EventEmitter<boolean>();

  @ViewChild('audio') audio: ElementRef<HTMLAudioElement>;

  isPlaying = false;

  constructor(private modalService: ModalService) { }

  ngOnInit() {
    this.audio?.nativeElement.load();
  }

  ngOnDestroy() {
    this.audio?.nativeElement.pause();
  }

  onOpenFilePicker() {
    this.modalService.openAudioFilePicker(`Sounds - ${ this.setting }`, 'assets/sounds', (result: string) => {
      this.fileChanged.emit(result);
    });
  }

  playSound() {
    this.audio.nativeElement.currentTime = 0;
    this.audio.nativeElement.play().then(() => this.isPlaying = true);
  }

  stopSound() {
    this.audio.nativeElement.pause();
    this.isPlaying = false;
  }

  onVolumeChanged(e: number) {
    this.playSound();
    this.volumeChanged.emit(e);
  }

  toggleMute() {
    this.muteChanged.emit(!this.model.muted);
  }
}
