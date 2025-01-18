import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { GiveawayDetails } from '../../../models/giveaway-details';
import { ZuluCardComponent } from "../../zulu-tools/zulu-card/zulu-card.component";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ZuluButtonComponent } from "../../zulu-tools/zulu-button/zulu-button.component";
import { CdkDrag, CdkDropList, CdkDragHandle, CdkDragDrop, moveItemInArray, CdkDragPreview } from '@angular/cdk/drag-drop';
import { WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';
import { CsvImportModalComponent } from '../../../modals/csv-import-modal/csv-import-modal.component';
import { GiveawayService } from '../../../services/giveaway-service';
import { MainStyleDirective } from '../../../directives/main-style.directive';
import { ModalService } from '../../../services/modal-service';
import { FileService } from '../../../services/file-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'giveaway-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, ZuluButtonComponent, ZuluCardComponent,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    CdkDragPreview,
    MainStyleDirective],
  templateUrl: './giveaway-list.component.html',
  styleUrl: './giveaway-list.component.scss'
})
export class GiveawayListComponent implements AfterViewInit, OnChanges {
  @Input() giveaways: GiveawayDetails[];
  @Output() selected = new EventEmitter<number>();
  @Output() reordered = new EventEmitter<GiveawayDetails[]>();
  @Output() deleted = new EventEmitter<number>();

  @ViewChild('giveawayListBody') giveawayListBody: ElementRef;

  settings: WheelSettings;
  headerStyle: { [klass: string]: any; } | null | undefined = null;

  constructor(
    private settingsService: SettingsService,
    private giveawayService: GiveawayService,
    private confirmationService: ModalService,
    private fileService: FileService,
    private modalService: ModalService) {
    this.settingsService.wheelSettings$.pipe(takeUntilDestroyed()).subscribe(ws => {
      this.settings = ws;
    });
  }

  ngAfterViewInit() {
    this.checkHeaderAlignment();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['giveaways']) {
      this.checkHeaderAlignment();
    }
  }

  onReorderGiveaways(e: CdkDragDrop<GiveawayDetails[]>) {
    moveItemInArray(this.giveaways, e.previousIndex, e.currentIndex);
    this.reordered.emit(this.giveaways);
  }

  onAddGiveaway() {
    this.selected.emit(-1);
  }

  onClear() {
    const confirmMessage = `You are about to delete ${this.giveaways.length} giveaway${this.giveaways.length === 1 ? '' : 's'}. Continue?`;
    this.confirmationService.confirm(confirmMessage, () => {
      this.giveawayService.saveAllGiveaways([]);
    });
  }

  onImportGiveaway() {
    const data = { headers: ['name', 'providedBy', 'imagePath', 'description', 'learnMoreUrl', 'trackWinners', 'winners'] };
    this.modalService.open(CsvImportModalComponent, data, (result) => {
      const results = result as (object[]|null);
      if (results) {
        const newGiveaways: GiveawayDetails[] = results.map((g: any) => ({
          name: g['name'] as string,
          providedBy: g['providedBy'] as string,
          imagePath: g['imagePath'] as string,
          description: g['description'] as string,
          learnMoreUrl: g['learnMoreUrl'] as string,
          trackWinners: g['trackWinners'].toString().toUpperCase() === 'YES' || (g['trackWinners'] as boolean),
          winners: (g['winners'] as string).split(',').filter(w => w.trim().length > 0)
        }));

        this.giveawayService.saveAllGiveaways(newGiveaways);
      }
    });
  }

  onExportGiveaways() {
    this.fileService.exportCsv(this.giveaways, [
      { property: 'name', header: 'Giveaway Name' },
      { property: 'providedBy', header: 'Provided By' },
      { property: 'imagePath', header: 'Image URL' },
      { property: 'description', header: 'Description' },
      { property: 'learnMoreUrl', header: 'Learn More URL' },
      { property: 'trackWinners', header: 'Track Winners?' },
      { property: 'winners', header: 'Winners (Separate Multiples with comma \',\')' },
    ], () => console.log('Giveaway List exported'));
  }

  private checkHeaderAlignment() {
    setTimeout(() => {
      this.headerStyle = this.giveawayListBody.nativeElement.scrollHeight > this.giveawayListBody.nativeElement.clientHeight ?
        { 'margin-right': '18px' } : null;
    }, 50);
  }
}
