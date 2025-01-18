import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { StaticWheelItem } from '../../../models/static-wheel';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { CommonModule } from '@angular/common';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { StaticWheelService } from '../../../services/static-wheel-service';
import { SettingsValue } from '../../../../main';
import { ZuluInputComponent } from "../../zulu-tools/zulu-input/zulu-input.component";
import { ModalService } from '../../../services/modal-service';
import { ZuluInputNumberComponent } from "../../zulu-tools/zulu-input-number/zulu-input-number.component";
import { ZuluAudioComponent } from "../../zulu-tools/zulu-audio/zulu-audio.component";
import { AudioSettingsItem } from '../../../models/audio-settings';
import { ZuluSliderComponent } from "../../zulu-tools/zulu-slider/zulu-slider.component";

@Component({
  selector: 'app-static-wheel-item-settings',
  standalone: true,
  imports: [CommonModule, ZuluCardComponent, ZuluInputComponent, ZuluButtonComponent, ZuluInputNumberComponent, ZuluAudioComponent, ZuluSliderComponent],
  templateUrl: './static-wheel-item-settings.component.html',
  styleUrl: './static-wheel-item-settings.component.scss'
})
export class StaticWheelItemSettingsComponent {
  @Input() staticWheelItem: StaticWheelItem;
  @Input() staticWheelIndex: number;
  @Input() staticWheelItemIndex: number;
  @Output() finish = new EventEmitter<void>();

  showImageSettings: boolean = false;
  showWinnerSettings: boolean = false;

  get staticWheelItemAudio(): AudioSettingsItem {
    return {
      soundPath: this.staticWheelItem.itemWinningSound,
      volume: this.staticWheelItem.itemWinningSoundVolume,
      muted: this.staticWheelItem.itemWinningSoundMute
    };
  }

  constructor(private staticWheelService: StaticWheelService, private modalService: ModalService) { }

  onSettingChange(e: SettingsValue, setting: string) {
    this.staticWheelService.saveStaticWheelItemSetting(setting, e, this.staticWheelIndex, this.staticWheelItemIndex);
  }

  onWeightChange(e: number) {
    this.onSettingChange(Math.floor(e), 'itemWeight');
  }

  openColorPickerModal() {
    this.modalService.openColorPicker('Pie Color', this.staticWheelItem.backgroundColor, this.staticWheelItem.labelColor, (result: { backgroundColor: string, fontColor: string }) => {
      this.onSettingChange(result.backgroundColor, 'backgroundColor');
      this.onSettingChange(result.fontColor, 'labelColor');
    });
  }

  onShowImageSettings() {
    this.showWinnerSettings = false;
    this.showImageSettings = true;
  }

  onShowWinnerSettings() {
    this.showImageSettings = false;
    this.showWinnerSettings = true;
  }

  onShowMainSettings() {
    this.showImageSettings = false;
    this.showWinnerSettings = false;
  }

  onOpenFilePickerOverlay() {
    this.modalService.openFilePicker('Item Image', 'assets/img/static-item-images', (result: string) => {
      this.onSettingChange(result, 'imagePath');
    });
  }
}
