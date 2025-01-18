import { Component } from '@angular/core';
import { SettingsService } from '../../../services/settings-service';
import { WheelSettings } from '../../../models/wheel-settings';
import { CommonModule } from '@angular/common';
import { FontInterface, FontPickerModule } from 'ngx-font-picker';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { ZuluCardComponent } from '../../zulu-tools/zulu-card/zulu-card.component';
import { ZuluInputComponent } from '../../zulu-tools/zulu-input/zulu-input.component';
import { ZuluSliderComponent } from "../../zulu-tools/zulu-slider/zulu-slider.component";
import { StyleService } from '../../../services/style-service';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { ButtonStyleDirective } from '../../../directives/button-style.directive';
import { FileService } from '../../../services/file-service';
import { InputStyleDirective } from '../../../directives/input-style.directive';
import { ModalService } from '../../../services/modal-service';

@Component({
  selector: 'app-visual-settings',
  standalone: true,
  imports: [
    CommonModule,
    FontPickerModule,
    ZuluButtonComponent,
    ZuluCardComponent,
    ZuluInputComponent,
    ZuluSliderComponent,
    MainStyleDirective,
    ButtonStyleDirective,
    InputStyleDirective
],
  templateUrl: './visual-settings.component.html',
  styleUrl: './visual-settings.component.scss'
})
export class VisualSettingsComponent {
  wheelSettings: WheelSettings;
  font: FontInterface | null;

  wheelName: string;
  fontColor: string;
  backgroundColor: string;
  buttonFontColor: string;
  buttonColor: string;
  inputFontColor: string;
  inputBackgroundColor: string;
  fontFamily: string;

  constructor(private styleService: StyleService, private settingsService: SettingsService, private fileService: FileService, private modalService: ModalService) {
    this.settingsService.wheelSettings$.subscribe(ws => {
      this.wheelSettings = ws;
    });

    this.styleService.styleSettings$.subscribe(ss => {
      this.fontColor = ss.globalFontColor;
      this.backgroundColor = ss.globalBackgroundColor;
      this.buttonFontColor = ss.globalButtonFontColor;
      this.buttonColor = ss.globalButtonColor;
      this.inputFontColor = ss.globalInputFontColor;
      this.inputBackgroundColor = ss.globalInputBackgroundColor;
      this.wheelName = ss.wheelName;
      this.fontFamily = ss.globalFont;
    })
  }

  onOpenFilePickerBackground() {
    this.modalService.openFilePicker('Background Images', 'assets/img/background-images', (result: string) => {
      this.settingsService.saveSetting('wheelBackgroundImagePath', result);
    });
  }

  onOpenFilePickerOverlay() {
    this.modalService.openFilePicker('Overlay Images', 'assets/img/overlay-images', (result: string) => {
      this.settingsService.saveSetting('wheelOverlayImagePath', result);
    });
  }

  onOpenFilePickerCenter() {
    this.modalService.openFilePicker('Center Images', 'assets/img/center-images', (result: string) => {
      this.settingsService.saveSetting('wheelCenterImagePath', result);
    });
  }

  openGlobalColorPickerModal() {
    this.modalService.openColorPicker('Menu Color Settings', this.backgroundColor, this.fontColor, (result: { backgroundColor: string, fontColor: string }) => {
      this.styleService.saveSetting('globalBackgroundColor', result.backgroundColor);
      this.styleService.saveSetting('globalFontColor', result.fontColor);
    })
  }

  openButtonColorPickerModal() {
    this.modalService.openColorPicker('Button Color Settings', this.buttonColor, this.buttonFontColor, (result: { backgroundColor: string, fontColor: string }) => {
      this.styleService.saveSetting('globalButtonColor', result.backgroundColor);
      this.styleService.saveSetting('globalButtonFontColor', result.fontColor);
    })
  }

  openInputColorPickerModal() {
    this.modalService.openColorPicker('Input Color Settings', this.inputBackgroundColor, this.inputFontColor, (result: { backgroundColor: string, fontColor: string }) => {
      this.styleService.saveSetting('globalInputBackgroundColor', result.backgroundColor);
      this.styleService.saveSetting('globalInputFontColor', result.fontColor);
    })
  }

  onFontChange(e: FontInterface) {
    this.styleService.saveSetting('globalFont', e.family);
  }

  onWheelNameChange(e: string) {
    this.styleService.saveSetting('wheelName', e);
  }

  downloadWheelTemplate() {
    this.fileService.openWheelTemplate((error) => console.log(error));
  }
}
