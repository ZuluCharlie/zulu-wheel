import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ZuluModalBaseComponent } from "../zulu-modal-base/zulu-modal-base.component";

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [ZuluModalBaseComponent],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  data = inject(MAT_DIALOG_DATA);
  constructor (private modal: MatDialogRef<ConfirmationModalComponent>) { }

  onConfirm() {
    this.modal.close(true);
  }
}
