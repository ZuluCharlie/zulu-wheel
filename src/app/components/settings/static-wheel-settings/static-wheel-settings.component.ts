import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { StaticWheel } from '../../../models/static-wheel';
import { CommonModule } from '@angular/common';
import { SettingsValue } from '../../../../main';
import { ZuluInputComponent } from "../../zulu-tools/zulu-input/zulu-input.component";
import { StaticWheelService } from '../../../services/static-wheel-service';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { ModalService } from '../../../services/modal-service';
import { ZuluSliderComponent } from "../../zulu-tools/zulu-slider/zulu-slider.component";
import { ZuluInputNumberComponent } from "../../zulu-tools/zulu-input-number/zulu-input-number.component";
import { FontInterface, FontPickerModule } from 'ngx-font-picker';
import { StyleService } from '../../../services/style-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ZuluAudioComponent } from "../../zulu-tools/zulu-audio/zulu-audio.component";
import { AudioSettingsItem } from '../../../models/audio-settings';

@Component({
  selector: 'app-static-wheel-settings',
  standalone: true,
  imports: [FontPickerModule, ZuluCardComponent, CommonModule, ZuluInputComponent, ZuluButtonComponent, ZuluSliderComponent, ZuluInputNumberComponent, ZuluAudioComponent],
  templateUrl: './static-wheel-settings.component.html',
  styleUrl: './static-wheel-settings.component.scss'
})
export class StaticWheelSettingsComponent {
  @Input() staticWheel: StaticWheel
  @Input() staticWheelIndex: number
  @Output() showPointerChange = new EventEmitter<boolean>();

  pointerTimerId: number | null = null;

  defaultFont: string;
  font: FontInterface | null;

  constructor(private staticWheelService: StaticWheelService, private modalService: ModalService, private styleService: StyleService) {
    this.styleService.styleSettings$.pipe(takeUntilDestroyed()).subscribe(style => {
      this.defaultFont = style.globalFont;
    });
  }

  get audioItem(): AudioSettingsItem | null {
    return !this.staticWheel ? null : {
      soundPath: this.staticWheel.wheelTickSoundPath,
      volume: this.staticWheel.wheelTickSoundVolume,
      muted: this.staticWheel.wheelTickSoundMute
    }
  }

  onSettingChange(e: SettingsValue, setting: string): Promise<void> {
    return this.staticWheelService.saveStaticWheelSetting(setting, e, this.staticWheelIndex);
  }

  onOpenFilePickerOverlay() {
    this.modalService.openFilePicker('Overlay Images', 'assets/img/overlay-images', (result: string) => {
      this.onSettingChange(result, 'wheelOverlayImagePath');
    });
  }

  onOpenFilePickerCenter() {
    this.modalService.openFilePicker('Center Images', 'assets/img/center-images', (result: string) => {
      this.onSettingChange(result, 'wheelCenterImagePath');
    });
  }

  showPointer(e: number) {
    if (this.pointerTimerId) {
      this.showPointerChange.emit(false);
      clearTimeout(this.pointerTimerId);
    }

    window.setTimeout(() => {
      this.onSettingChange(e, 'pointerAngle').then(() => this.showPointerChange.emit(true));
    }, 10);
    this.pointerTimerId = window.setTimeout(() => {
      this.pointerTimerId = null;
      this.showPointerChange.emit(false);
    }, 2500);
  }

  onFontChange(e: FontInterface) {
    this.onSettingChange(e.family, 'itemFont');
  }
}
