import { CdkDrag, CdkDropList, CdkDragHandle, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ColorPickerModule } from 'ngx-color-picker';
import { WheelSettings } from '../../../models/wheel-settings';
import { WheelItemSettings } from '../../../models/wheel-item-settings';
import { getRandomNumber, getVisibleTextColor } from '../../../util/helpers';
import { SettingsValue } from '../../../../main';
import { SettingsService } from '../../../services/settings-service';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { MatButtonModule } from '@angular/material/button';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../services/modal-service';

@Component({
  selector: 'app-wheel-item-settings',
  standalone: true,
  imports: [
    CommonModule,
    ColorPickerModule,
    MatIconModule,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    ScrollingModule,
    ZuluButtonComponent,
    ZuluCardComponent,
    MatButtonModule,
    MainStyleDirective
],
  templateUrl: './wheel-item-settings.component.html',
  styleUrl: './wheel-item-settings.component.scss'
})
export class WheelItemSettingsComponent {
  settings: WheelSettings;

  constructor(private settingsService: SettingsService, private modalService: ModalService) { 
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.settings = ws;
    });
  }

  onWedgeColorChange() {
    this.onItemsSettingsChange();
  }

  onAddWedgeColor() {
    this.settings.itemSettings = [...this.settings.itemSettings, this.getRandomWedgeColors()];
    this.onItemsSettingsChange();
  }

  onDeleteWedgeColor(index: number) {
    this.settings.itemSettings = this.settings.itemSettings.filter((item, i) => i !== index);
    this.onItemsSettingsChange();
  }

  onReorderWedgeColors(e: CdkDragDrop<WheelItemSettings[]>) {
    moveItemInArray(this.settings.itemSettings, e.previousIndex, e.currentIndex);
    this.onItemsSettingsChange();
  }

  getRandomWedgeColors() {
    const red = getRandomNumber(0, 255);
    const green = getRandomNumber(0, 255);
    const blue = getRandomNumber(0, 255);

    const backgroundColor = `#${ ('00' + red.toString(16)).slice(-2) }${ ('00' + green.toString(16)).slice(-2) }${ ('00' + blue.toString(16)).slice(-2) }`;
    const fontColor = getVisibleTextColor(backgroundColor)!;

    return { pieColor: backgroundColor, pieFontColor: fontColor }
  }

  onItemsSettingsChange() {
    const itemSettings: SettingsValue[] = this.settings.itemSettings.map(i => ({
      ['pieColor']: i.pieColor,
      ['pieFontColor']: i.pieFontColor
    }));

    this.settingsService.saveSetting('itemSettings', itemSettings);
  }

  getPieFontColorSetting(index: number): string {
    return `itemSettings[${index}.pieFontColor]`;
  }

  getPieColorSetting(index: number): string {
    return `itemSettings[${index}.pieColor]`;
  }

  openColorPickerModal(index: number) {
    const backgroundColor = this.settings.itemSettings[index].pieColor;
    const fontColor = this.settings.itemSettings[index].pieFontColor;
    this.modalService.openColorPicker('Pie Color', backgroundColor, fontColor, (result: { backgroundColor: string, fontColor: string }) => {
      this.settings.itemSettings[index].pieColor = result.backgroundColor;
      this.settings.itemSettings[index].pieFontColor = result.fontColor;
      this.onItemsSettingsChange();
      // this.settingsService.saveSetting(`itemSettings[${index}].pieColor`, result.backgroundColor);
      // this.settingsService.saveSetting(`itemSettings[${index}].pieFontColor`, result.fontColor);
    });
  }
}
