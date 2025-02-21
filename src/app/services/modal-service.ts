import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ConfirmationModalComponent } from "../modals/confirmation-modal/confirmation-modal.component";
import { ComponentType } from "@angular/cdk/portal";
import { FilePickerModalComponent } from "../modals/file-picker-modal/file-picker-modal.component";
import { ColorPickerModalComponent } from "../modals/color-picker-modal/color-picker-modal.component";
import { FilePickerAudioModalComponent } from "../modals/file-picker-audio-modal/file-picker-audio-modal.component";

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    constructor(private dialog: MatDialog) { }
    defaultConfig: MatDialogConfig = {
        enterAnimationDuration: '300ms',
        exitAnimationDuration: '300ms',
    };

    confirm(message: string, callback: () => void, confirmText?: string, cancelText?: string) {
        const data = { message, confirmText, cancelText };
        this.openModal(ConfirmationModalComponent, true, data, (confirmed) => {
            if (confirmed) {
                callback();
            }
        });
    }

    openFilePicker(folderName: string, folderPath: string, callback: (result: string) => void) {
        const data = { folderName, folderPath };
        this.openModal(FilePickerModalComponent, true, data, callback);
    }

    openAudioFilePicker(folderName: string, folderPath: string, callback: (result: string) => void) {
        const data = { folderName, folderPath };
        this.openModal(FilePickerAudioModalComponent, true, data, callback);
    }

    openColorPicker(header: string, backgroundColor: string, fontColor: string, callback: (result: { backgroundColor: string, fontColor: string }) => void) {
        const data = { header, backgroundColor, fontColor };
        this.openModal(ColorPickerModalComponent, false, data, callback);
    }  
    
    open<TComponent, TResult>(component: ComponentType<TComponent>, data: object, callback: (result: TResult) => void, config: Partial<MatDialogConfig> = {}) {
        this.openModal(component, true, data, callback, config);
    }

    openModal<TComponent, TResult>(component: ComponentType<TComponent>, hasBackdrop: boolean, data: object, callback: (result: TResult) => void, config: Partial<MatDialogConfig> = {}) {
        const dialogRef = this.dialog.open<TComponent,object,TResult>(component, {...this.defaultConfig, ...config, hasBackdrop, disableClose: hasBackdrop, data});
        firstValueFrom<TResult|undefined>(dialogRef.afterClosed()).then(result => {
            if (result !== undefined) {
                callback(result);
            }
        })
    }
}