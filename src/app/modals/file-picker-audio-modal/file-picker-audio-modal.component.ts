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
import { ZuluCheckboxComponent } from "../../components/zulu-tools/zulu-checkbox/zulu-checkbox.component";
import { GuidGenerator } from '../../util/guid-generator';

@Component({
  selector: 'app-file-picker-audio-modal',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatListModule, MatIconModule, ZuluButtonComponent, ZuluModalBaseComponent, ZuluInputComponent, MainStyleDirective, ZuluCheckboxComponent],
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
  isUrl: boolean = false;
  downloadFromUrl: boolean = false;

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
    this.isUrl = false;
  }

  onFileSelectedDbl(file: string) {
    this.currentPicked = `${this.data.folderPath}/${file}`;
    this.nullSelected = false;
    this.isUrl = false;
    this.onSubmit();
  }

  onNullSelected() {
    this.currentPicked = '';
    this.nullSelected = true;
    this.isUrl = false;
  }

  onNullSelectedDbl() {
    this.currentPicked = '';
    this.nullSelected = true;
    this.isUrl = false;
    this.onSubmit();
  }

  onUrlChange(e: string) {
    this.currentPicked = e;
    this.nullSelected = false;
    this.isUrl = true;
  }

  onDownloadChange(e: boolean) {
    this.downloadFromUrl = e;
  }

  onSubmit() {
    if (this.isUrl && this.downloadFromUrl) {
      const imgGuid = GuidGenerator.standard();
      const ext = this.getFileExtensionFromUrl(this.currentPicked);
      if (!['.mp3', '.wav', '.ogg'].includes(ext)) {
        console.log('File type not supported.');
        return;
      }

      const filePath = `downloads/${imgGuid}${ext}`;
      this.fileService.downloadFile(this.currentPicked, filePath, (filename) => {
        this.modal.close(filename);
      })
    }
    else if (this.currentPicked || this.nullSelected) {
      this.modal.close(this.currentPicked);
    }
  }

  onFileUpload(event: any): void {
    this.uploadFile = event.target.files[0];

    this.uploadFile.arrayBuffer().then((buffer) => {
      this.fileService.saveFile(`${this.data.folderPath}/${this.uploadFile.name}`, buffer, (fileName) => {
        this.currentPicked = fileName;
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

  getFileExtensionFromUrl(url: string) {
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    const endpoint = fileName.indexOf('?');
    const fileExtension = endpoint >= 0 ?
      fileName.substring(fileName.lastIndexOf('.'), endpoint) :
      fileName.substring(fileName.lastIndexOf('.'));
    return fileExtension;
  }
}
