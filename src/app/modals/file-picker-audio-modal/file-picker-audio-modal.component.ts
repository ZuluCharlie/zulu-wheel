import { Component, inject } from '@angular/core';
import { AudioSettings } from '../../models/audio-settings';
import { AudioService } from '../../services/audio-service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../../services/file-service';
import { ZuluModalBaseComponent } from "../zulu-modal-base/zulu-modal-base.component";
import { ZuluButtonComponent } from "../../components/zulu-tools/zulu-button/zulu-button.component";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ZuluInputComponent } from '../../components/zulu-tools/zulu-input/zulu-input.component';
import { MainStyleDirective } from '../../directives/main-style.directive';
import { StyleSettings, defaultStyleSettings } from '../../models/style-settings';
import { StyleService } from '../../services/style-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-file-picker-audio-modal',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatListModule, MatIconModule, ZuluButtonComponent, ZuluModalBaseComponent, ZuluInputComponent, MainStyleDirective],
  templateUrl: './file-picker-audio-modal.component.html',
  styleUrl: './file-picker-audio-modal.component.scss'
})
export class FilePickerAudioModalComponent {
  files: string[];
  settings: AudioSettings;
  styleSettings: StyleSettings = defaultStyleSettings;
  currentPicked: string;
  fileUrl: string;
  nullSelected: boolean = false;

  uploadFile: File;

  currentAudio = new Audio();

  data = inject(MAT_DIALOG_DATA);
  constructor(private fileService: FileService, private audioService: AudioService, private styleService: StyleService, private modal: MatDialogRef<FilePickerAudioModalComponent>) { 
    this.audioService.audioSettings$.pipe(takeUntilDestroyed()).subscribe(as => this.settings = as);
    this.fileService.getFilesInDirectory(this.data.folderPath, (files: string[]) =>
      this.files = files);

    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => this.styleSettings = ss);
  }

  onFileSelected(file: string) {
    if (this.currentPicked === `${this.data.folderPath}/${file}`) {
      return;
    }

    this.currentPicked = `${this.data.folderPath}/${file}`;
    this.playSound(this.currentPicked);
    this.nullSelected = false;
  }

  onFileSelectedDbl(file: string) {
    this.currentPicked = `${this.data.folderPath}/${file}`;
    this.nullSelected = false;
    this.onSubmit();
  }

  onNullSelected() {
    this.currentPicked = '';
    this.nullSelected = true;
  }

  onNullSelectedDbl() {
    this.currentPicked = '';
    this.nullSelected = true;
    this.onSubmit();
  }

  onUrlChange(e: string) {
    this.currentPicked = e;
    this.nullSelected = false;
  }

  onSubmit() {
    if (this.currentPicked || this.nullSelected) {
      this.modal.close(this.currentPicked);
    }
  }

  onFileUpload(event: any): void {
    this.uploadFile = event.target.files[0];

    this.uploadFile.arrayBuffer().then((buffer) => {
      this.fileService.saveFile(`${this.data.folderPath}/${this.uploadFile.name}`, buffer, () => {
        this.currentPicked = `${this.data.folderPath}/${this.uploadFile.name}`;
        this.onSubmit();
      })
    })
  }

  playSound(file: string) {
    this.currentAudio.pause();
    this.currentAudio.src = file;
    this.currentAudio.load();
    this.currentAudio.play();
  }
}
