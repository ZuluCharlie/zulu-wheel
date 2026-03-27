import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { SettingsService } from '../../../services/settings-service';

import { FormsModule } from '@angular/forms';
import { InputStyleDirective } from '../../../directives/input-style.directive';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'zulu-textarea',
  standalone: true,
  imports: [FormsModule, InputStyleDirective],
  templateUrl: './zulu-textarea.component.html',
  styleUrl: './zulu-textarea.component.scss'
})
export class ZuluTextareaComponent {
  @Input() label: string;
  @Input() className: string;
  @Input() placeholder: string = '';
  @Input() small: string;
  @Input() setting: string;
  @Input() model: string;
  @Input() rows: number;
  @Input() disabled: boolean;

  @Output() inputChange = new EventEmitter<string>();

  @ViewChild('input') input: ElementRef;

  modelChanged: Subject<string> = new Subject<string>();
  debounceSubscription: Subscription;

  constructor(private settings: SettingsService) { }

  ngOnInit() {
    this.debounceSubscription = this.modelChanged.pipe(
      debounceTime(150),
      distinctUntilChanged()
    ).subscribe(model => {
      this.model = model;
      this.saveChange(model);
    });
  }

  ngOnDestroy(): void {
    this.debounceSubscription?.unsubscribe();
  }

  onInputChange(e: string) {
    this.modelChanged.next(e);
  }

  saveChange(e: string) {
    if (this.setting) {
      this.settings.saveSetting(this.setting, e);
    }

    this.inputChange.emit(e);
  }
}
