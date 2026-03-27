import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { WheelSettings } from '../../../models/wheel-settings';
import { SettingsService } from '../../../services/settings-service';

import { FormsModule } from '@angular/forms';
import { InputStyleDirective } from '../../../directives/input-style.directive';
import { Subscription, fromEvent, debounceTime, Subject, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'zulu-input',
  standalone: true,
  imports: [FormsModule, InputStyleDirective],
  templateUrl: './zulu-input.component.html',
  styleUrl: './zulu-input.component.scss'
})
export class ZuluInputComponent {
  @Input() label: string;
  @Input() className: string;
  @Input() placeholder: string = '';
  @Input() small: string;
  @Input() setting: string;
  @Input() model: string;
  @Input() type: string = 'text';

  @Output() inputChange = new EventEmitter<string>();
  
  @ViewChild('input') input: ElementRef;

  wheelSettings: WheelSettings

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
