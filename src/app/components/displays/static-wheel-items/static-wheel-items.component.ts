import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StaticWheelItem } from '../../../models/static-wheel';
import { ZuluButtonComponent } from '../../zulu-tools/zulu-button/zulu-button.component';
import { ZuluCardComponent } from '../../zulu-tools/zulu-card/zulu-card.component';
import { StaticWheelService } from '../../../services/static-wheel-service';
import { CdkDrag, CdkDropList, CdkDragHandle, CdkDragDrop, moveItemInArray, CdkDragPreview } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-static-wheel-items',
  standalone: true,
  imports: [ZuluCardComponent, CommonModule, ZuluButtonComponent, CdkDrag,
    CdkDropList, CdkDragPreview,
    CdkDragHandle, MatIconModule],
  templateUrl: './static-wheel-items.component.html',
  styleUrl: './static-wheel-items.component.scss'
})
export class StaticWheelItemsComponent {
  @Input() items: StaticWheelItem[];
  @Input() currentWheelIndex: number;
  @Input() wheelFont: string | null;
  @Output() editItem = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<number>();
  @Output() editItemName = new EventEmitter<string>();

  constructor(private staticWheelService: StaticWheelService) { }

  addWheelItem() {
    var newIndex = this.items.length;
    this.staticWheelService.addStaticWheelItem(this.currentWheelIndex).then(() => {
      this.editItem.emit(newIndex);
    });
  }

  onReorderItems(e: CdkDragDrop<StaticWheelItem[]>) {
    moveItemInArray(this.items, e.previousIndex, e.currentIndex);
    this.staticWheelService.saveStaticWheelItems('items', this.items, this.currentWheelIndex);
  }
}
