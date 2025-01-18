import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WheelSettings } from '../../models/wheel-settings';
import { SettingsService } from '../../services/settings-service';
import { ZuluButtonComponent } from "../../components/zulu-tools/zulu-button/zulu-button.component";
import { Subscription } from 'rxjs';
import { MainStyleDirective } from '../../directives/main-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'zulu-modal-base',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, ZuluButtonComponent, MainStyleDirective],
  templateUrl: './zulu-modal-base.component.html',
  styleUrl: './zulu-modal-base.component.scss'
})
export class ZuluModalBaseComponent {
  @Input() header: string;
  @Input() cancelText: string;
  @Input() saveText: string;
  @Input() disabled: boolean;

  @Output() closed = new EventEmitter();
  @Output() saved = new EventEmitter();

  settings: WheelSettings;

  constructor(private settingsService: SettingsService, private modal: MatDialogRef<any>) { 
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => this.settings = ws);
    this.modal.addPanelClass('zulu-modal');
  }

  onCancel() {
    if (this.closed) {
      this.closed.emit();
    }
  }

  onSaved() {
    if (this.saved) {
      this.saved.emit();
    }
  }
}
