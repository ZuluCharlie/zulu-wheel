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
import { GuidGenerator } from '../../util/guid-generator';
import { ZuluCheckboxComponent } from "../../components/zulu-tools/zulu-checkbox/zulu-checkbox.component";

@Component({
  selector: 'app-file-picker-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    MatListModule,
    MatIconModule,
    ZuluButtonComponent,
    ZuluModalBaseComponent,
    ZuluInputComponent,
    MainStyleDirective,
    ZuluCheckboxComponent
  ],
  templateUrl: './file-picker-modal.component.html',
  styleUrl: './file-picker-modal.component.scss'
})
export class FilePickerModalComponent {
  files: { fullPath: string, fileName: string }[];
  settings: WheelSettings;
  styleSettings: StyleSettings = defaultStyleSettings;
  currentPicked: string;
  fileUrl: string;
  nullSelected: boolean = false;
  isUrl: boolean = false;
  downloadFromUrl: boolean = false;

  uploadFile: File;

  data = inject(MAT_DIALOG_DATA);
  constructor(private fileService: FileService, private settingsService: SettingsService, private styleService: StyleService, private modal: MatDialogRef<FilePickerModalComponent>) {
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => this.settings = ws);
    this.fileService.getFilesInDirectory(this.data.folderPath, (files: string[]) =>
      this.files = files.map(f => ({ fullPath: f, fileName: this.extractFilename(f) })));

    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => this.styleSettings = ss);
  }

  onFileSelected(file: string) {
    this.currentPicked = file;
    this.nullSelected = false;
    this.isUrl = false;
  }

  onFileSelectedDbl(file: string) {
    this.currentPicked = file;
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
      if (!['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp'].includes(ext)) {
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

  extractFilename(path: string) {
    const pathArray = path.split("/");
    const lastIndex = pathArray.length - 1;
    return pathArray[lastIndex];
  };

  getFileExtensionFromUrl(url: string) {
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    const endpoint = fileName.indexOf('?');
    const fileExtension = endpoint >= 0 ?
      fileName.substring(fileName.lastIndexOf('.'), endpoint) :
      fileName.substring(fileName.lastIndexOf('.'));
    return fileExtension;
  }
}
