import { Component, inject } from '@angular/core';
import { ZuluColorPickerComponent } from "../../components/zulu-tools/zulu-color-picker/zulu-color-picker.component";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ZuluModalBaseComponent } from "../zulu-modal-base/zulu-modal-base.component";
import { StyleSettings } from '../../models/style-settings';
import { StyleService } from '../../services/style-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-wedge-color-picker-modal',
  standalone: true,
  imports: [ZuluColorPickerComponent, CommonModule, MatDialogModule, MatIconModule, ZuluModalBaseComponent],
  templateUrl: './color-picker-modal.component.html',
  styleUrl: './color-picker-modal.component.scss'
})
export class ColorPickerModalComponent {
  settings: StyleSettings;
  data = inject(MAT_DIALOG_DATA);

  header: string;
  backgroundColor: string;
  fontColor: string;

  constructor(private settingsService: StyleService, private modal: MatDialogRef<ColorPickerModalComponent>)  { 
    this.settingsService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(ss => this.settings = ss);
    this.header = this.data.header;
    this.backgroundColor = this.data.backgroundColor;
    this.fontColor = this.data.fontColor;
  }

  onBackgroundColorChanged(e: string) {
    this.backgroundColor = e;
  }

  onFontColorChanged(e: string) {
    this.fontColor = e;
  }

  onSubmit() {
    this.modal.close({ backgroundColor: this.backgroundColor, fontColor: this.fontColor });
  }
}
