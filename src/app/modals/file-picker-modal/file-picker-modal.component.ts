import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { WheelSettings } from '../../models/wheel-settings';
import { FileService } from '../../services/file-service';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings-service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ZuluButtonComponent } from "../../components/zulu-tools/zulu-button/zulu-button.component";
import { ZuluModalBaseComponent } from "../zulu-modal-base/zulu-modal-base.component";
import { ZuluInputComponent } from "../../components/zulu-tools/zulu-input/zulu-input.component";
import { MainStyleDirective } from '../../directives/main-style.directive';
import { StyleService } from '../../services/style-service';
import { defaultStyleSettings, StyleSettings } from '../../models/style-settings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-file-picker-modal',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatListModule, MatIconModule, ZuluButtonComponent, ZuluModalBaseComponent, ZuluInputComponent, MainStyleDirective],
  templateUrl: './file-picker-modal.component.html',
  styleUrl: './file-picker-modal.component.scss'
})
export class FilePickerModalComponent {
  files: string[];
  settings: WheelSettings;
  styleSettings: StyleSettings = defaultStyleSettings;
  currentPicked: string;
  fileUrl: string;
  nullSelected: boolean = false;

  uploadFile: File;

  data = inject(MAT_DIALOG_DATA);
  constructor(private fileService: FileService, private settingsService: SettingsService, private styleService: StyleService, private modal: MatDialogRef<FilePickerModalComponent>) {
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => this.settings = ws);
    this.fileService.getFilesInDirectory(this.data.folderPath, (files: string[]) =>
      this.files = files);

    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => this.styleSettings = ss);
  }

  onFileSelected(file: string) {
    this.currentPicked = `${this.data.folderPath}/${file}`;
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
}
