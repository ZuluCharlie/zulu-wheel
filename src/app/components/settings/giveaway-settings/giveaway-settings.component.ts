import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GiveawayDetails } from '../../../models/giveaway-details';
import { ZuluInputComponent } from "../../zulu-tools/zulu-input/zulu-input.component";
import { ZuluTextareaComponent } from "../../zulu-tools/zulu-textarea/zulu-textarea.component";
import { ZuluCheckboxComponent } from "../../zulu-tools/zulu-checkbox/zulu-checkbox.component";
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { FilePickerModalComponent } from '../../../modals/file-picker-modal/file-picker-modal.component';
import { SettingsService } from '../../../services/settings-service';
import { ModalService } from '../../../services/modal-service';

@Component({
  selector: 'giveaway-settings',
  standalone: true,
  imports: [ZuluInputComponent, ZuluTextareaComponent, ZuluCheckboxComponent, ZuluButtonComponent],
  templateUrl: './giveaway-settings.component.html',
  styleUrl: './giveaway-settings.component.scss'
})
export class GiveawaySettingsComponent {
  @Input() giveaway: GiveawayDetails;
  @Input() index: number;

  @Output() giveawayChanged = new EventEmitter<GiveawayDetails>();

  constructor(private modalService: ModalService, private settingsService: SettingsService) { }

  get settingPrefix() {
    return `giveaways[${this.index}].`;
  }

  onModelNameChange(e: string) {
    this.giveaway.name = e;
    this.giveawayChanged.emit(this.giveaway);
  }

  onModelProvidedChange(e: string) {
    this.giveaway.providedBy = e;
    this.giveawayChanged.emit(this.giveaway);
  }

  onModelDescriptionChange(e: string) {
    this.giveaway.description = e;
    this.giveawayChanged.emit(this.giveaway);
  }

  onModelLearnMoreChange(e: string) {
    this.giveaway.learnMoreUrl = e;
    this.giveawayChanged.emit(this.giveaway);
  }

  onModelTrackWinnersChange(e: boolean) {
    this.giveaway.trackWinners = e;
    this.giveawayChanged.emit(this.giveaway);
  }

  onOpenFilePicker() {
    const data = {
      folderName: 'Giveaway Images',
      folderPath: 'assets/img/giveaway-images'
    };

    this.modalService.open(FilePickerModalComponent, data, (result: string) => {
        this.giveaway.imagePath = result;
        this.giveawayChanged.emit(this.giveaway);
    });
  }
}
