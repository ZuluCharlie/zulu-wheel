import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ZuluModalBaseComponent } from "../zulu-modal-base/zulu-modal-base.component";
import { ZuluButtonComponent } from "../../components/zulu-tools/zulu-button/zulu-button.component";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../../services/file-service';
import { skip } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-csv-import-modal',
  standalone: true,
  imports: [CommonModule, ZuluModalBaseComponent, ZuluButtonComponent],
  templateUrl: './csv-import-modal.component.html',
  styleUrl: './csv-import-modal.component.scss'
})
export class CsvImportModalComponent {
  results: object[];
  headers: string[];
  isInitialized: boolean = false;

  data = inject(MAT_DIALOG_DATA);
  constructor(private modal: MatDialogRef<CsvImportModalComponent>, private fileService: FileService) { 
    this.headers = this.data.headers;
    this.fileService.csvImport$.pipe(skip(1), takeUntilDestroyed()).subscribe(csv => {
      this.results = csv;
    });
  }

  onFileUpload(e: any) {
    const uploadFile = e.target.files[0];
    uploadFile.arrayBuffer().then((buffer: ArrayBuffer) => {
      this.fileService.importCsv(buffer, this.headers, () => { console.log('import sent') });
    });
  }

  onSubmit() {
    if (this.results) {
      this.modal.close(this.results);
    }
  }

  downloadImportCsvTemplate() {
    this.fileService.openImportCsvTemplate((error) => console.log(error));
  }
}
